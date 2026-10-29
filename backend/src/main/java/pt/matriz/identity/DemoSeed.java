package pt.matriz.identity;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "matriz.demo.enabled", havingValue = "true")
public class DemoSeed implements ApplicationRunner {
    private final JdbcTemplate db;

    public DemoSeed(JdbcTemplate db) {
        this.db = db;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        // A transaction-scoped lock makes simultaneous demo startups safe without resetting existing data.
        db.execute("SELECT pg_advisory_xact_lock(73429031)");
        if (Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM app_user WHERE id='user-ana')", Boolean.class))) return;
        for (String[] user : new String[][]{{"ana", "Ana"}, {"bruno", "Bruno"}, {"carla", "Carla"}}) {
            db.update("INSERT INTO app_user(id,username,display_name) VALUES (?,?,?)",
                    "user-" + user[0], user[0], user[1]);
        }
        db.update("INSERT INTO project(id,name,description,owner_user_id) VALUES ('proj-alfa','Alfa','Preparação do MVP da Matriz','user-ana')");
        db.update("INSERT INTO participation(project_id,user_id) VALUES ('proj-alfa','user-ana'),('proj-alfa','user-bruno')");
        db.update("INSERT INTO project(id,name,description,owner_user_id) VALUES ('proj-beta','Beta','Projeto privado de Carla','user-carla')");
        db.update("INSERT INTO participation(project_id,user_id) VALUES ('proj-beta','user-carla')");
        String[] titles = {"Definir âmbito", "Rever requisitos", "Desenhar modelo", "Preparar contrato", "Validar protótipo"};
        String[] statuses = {"DONE", "DONE", "IN_PROGRESS", "TODO", "TODO"};
        for (int i = 0; i < titles.length; i++) {
            db.update("INSERT INTO task(id,project_id,title,status) VALUES (?,'proj-alfa',?,?)",
                    "task-0" + (i + 1), titles[i], statuses[i]);
        }
        db.update("INSERT INTO task_assignment(task_id,project_id,user_id) VALUES ('task-01','proj-alfa','user-ana'),('task-01','proj-alfa','user-bruno')");
    }
}
