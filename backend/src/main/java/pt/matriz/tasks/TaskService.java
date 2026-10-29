package pt.matriz.tasks;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import pt.matriz.common.ApiException;
import pt.matriz.common.Inputs;
import pt.matriz.projects.ProjectService;
import static pt.matriz.common.ApiModels.*;

@Service
public class TaskService {
    private static final Set<String> STATES = Set.of("TODO", "IN_PROGRESS", "DONE");
    private static final Set<String> PRIORITIES = Set.of("LOW", "MEDIUM", "HIGH");
    private final JdbcTemplate db;
    private final ProjectService projects;

    public TaskService(JdbcTemplate db, ProjectService projects) {
        this.db = db;
        this.projects = projects;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public TaskPage list(String projectId, String userId, String status, String priority, int page, int size) {
        Inputs.page(page, size);
        projects.access(projectId, userId, false, false);
        if (status != null) Inputs.choice(status, STATES, "status");
        if (priority != null) Inputs.choice(priority, PRIORITIES, "priority");
        String where = " FROM task WHERE project_id=? AND (?='' OR status=?) AND (?='' OR priority=?)";
        String state = status == null ? "" : status, level = priority == null ? "" : priority;
        long total = db.queryForObject("SELECT count(*)" + where, Long.class, projectId, state, state, level, level);
        List<TaskView> items = db.query("SELECT *" + where + " ORDER BY created_at,id LIMIT ? OFFSET ?",
                (rs, row) -> task(rs), projectId, state, state, level, level, size, Inputs.offset(page, size));
        return new TaskPage(projects.get(projectId, userId), items, Inputs.pagination(page, size, total), projects.progress(projectId));
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public TaskView get(String projectId, String id, String userId) {
        projects.access(projectId, userId, false, false);
        return find(projectId, id);
    }

    @Transactional
    public TaskView create(String projectId, String userId, CreateTask input) {
        projects.access(projectId, userId, false, true);
        String title = Inputs.title(input.title(), 200, "title");
        String description = Inputs.description(input.description());
        String priority = input.priority() == null ? "MEDIUM" : Inputs.choice(input.priority(), PRIORITIES, "priority");
        String id = UUID.randomUUID().toString();
        db.update("INSERT INTO task(id,project_id,title,description,priority) VALUES (?,?,?,?,?)",
                id, projectId, title, description, priority);
        return find(projectId, id);
    }

    @Transactional
    public TaskView update(String projectId, String id, String userId, UpdateTask input) {
        projects.access(projectId, userId, false, true);
        find(projectId, id);
        String title = Inputs.title(input.title(), 200, "title");
        String description = Inputs.description(input.description());
        String status = Inputs.choice(input.status(), STATES, "status");
        String priority = Inputs.choice(input.priority(), PRIORITIES, "priority");
        int changed = db.update("""
                UPDATE task SET title=?,description=?,status=?,priority=?,version=version+1,updated_at=CURRENT_TIMESTAMP
                WHERE id=? AND project_id=? AND version=?
                """, title, description, status, priority, id, projectId, Inputs.version(input.version()));
        if (changed == 0) throw ProjectService.stale();
        return find(projectId, id);
    }

    @Transactional
    public void delete(String projectId, String id, String userId, long version) {
        projects.access(projectId, userId, false, true);
        find(projectId, id);
        if (db.update("DELETE FROM task WHERE id=? AND project_id=? AND version=?", id, projectId, version) == 0) {
            throw ProjectService.stale();
        }
    }

    @Transactional
    public TaskView assign(String projectId, String id, String userId, String target, Long version, boolean remove) {
        projects.access(projectId, userId, true, true);
        TaskView before = find(projectId, id);
        if (before.version() != Inputs.version(version)) throw ProjectService.stale();
        int changed;
        if (remove) {
            changed = db.update("DELETE FROM task_assignment WHERE task_id=? AND user_id=?", id, target);
        } else {
            boolean eligible = Boolean.TRUE.equals(db.queryForObject("""
                    SELECT EXISTS(SELECT 1 FROM participation m JOIN app_user u ON u.id=m.user_id
                    WHERE m.project_id=? AND u.id=? AND u.active)
                    """, Boolean.class, projectId, target));
            if (!eligible) throw Inputs.invalid("userId", "Conta não elegível.");
            changed = db.update("""
                    INSERT INTO task_assignment(task_id,project_id,user_id) VALUES (?,?,?) ON CONFLICT DO NOTHING
                    """, id, projectId, target);
        }
        if (changed > 0) db.update("UPDATE task SET version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?", id);
        return find(projectId, id);
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public CommentPage comments(String projectId, String id, String userId, int page, int size) {
        Inputs.page(page, size);
        projects.access(projectId, userId, false, false);
        find(projectId, id);
        long total = db.queryForObject("SELECT count(*) FROM task_comment WHERE task_id=?", Long.class, id);
        List<CommentView> items = db.query("""
                SELECT c.*,u.display_name FROM task_comment c JOIN app_user u ON u.id=c.author_id
                WHERE c.task_id=? ORDER BY c.created_at,c.id LIMIT ? OFFSET ?
                """, (rs, row) -> comment(rs), id, size, Inputs.offset(page, size));
        return new CommentPage(items, Inputs.pagination(page, size, total));
    }

    @Transactional
    public CommentView comment(String projectId, String id, String userId, String content) {
        projects.access(projectId, userId, false, true);
        find(projectId, id);
        String text = Inputs.title(content, 2000, "content");
        String commentId = UUID.randomUUID().toString();
        db.update("INSERT INTO task_comment(id,task_id,author_id,content) VALUES (?,?,?,?)", commentId, id, userId, text);
        return db.query("""
                SELECT c.*,u.display_name FROM task_comment c JOIN app_user u ON u.id=c.author_id WHERE c.id=?
                """, (rs, row) -> comment(rs), commentId).getFirst();
    }

    private TaskView find(String projectId, String id) {
        return db.query("SELECT * FROM task WHERE project_id=? AND id=?", (rs, row) -> task(rs), projectId, id)
                .stream().findFirst().orElseThrow(ApiException::notFound);
    }

    private TaskView task(ResultSet rs) throws SQLException {
        String id = rs.getString("id");
        List<UserView> assignees = db.query("""
                SELECT u.id,u.display_name FROM task_assignment a JOIN app_user u ON u.id=a.user_id
                WHERE a.task_id=? ORDER BY u.display_name,u.id
                """, (user, row) -> new UserView(user.getString("id"), user.getString("display_name")), id);
        return new TaskView(id, rs.getString("project_id"), rs.getString("title"), rs.getString("description"),
                rs.getString("status"), rs.getString("priority"), assignees, rs.getLong("version"),
                rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("updated_at").toInstant());
    }

    private CommentView comment(ResultSet rs) throws SQLException {
        return new CommentView(rs.getString("id"), rs.getString("task_id"),
                new UserView(rs.getString("author_id"), rs.getString("display_name")), rs.getString("content"),
                rs.getTimestamp("created_at").toInstant());
    }
}
