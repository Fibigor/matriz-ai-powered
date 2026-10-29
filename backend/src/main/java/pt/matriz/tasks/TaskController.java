package pt.matriz.tasks;

import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pt.matriz.identity.IdentityService;
import static pt.matriz.common.ApiModels.*;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService tasks;
    private final IdentityService identities;

    public TaskController(TaskService tasks, IdentityService identities) {
        this.tasks = tasks;
        this.identities = identities;
    }

    private String user(Principal principal) { return identities.current(principal.getName()).id(); }

    @GetMapping
    public TaskPage list(Principal principal, @PathVariable String projectId,
                         @RequestParam(required = false) String status, @RequestParam(required = false) String priority,
                         @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return tasks.list(projectId, user(principal), status, priority, page, pageSize);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskView create(Principal principal, @PathVariable String projectId, @RequestBody CreateTask input) {
        return tasks.create(projectId, user(principal), input);
    }

    @GetMapping("/{id}")
    public TaskView get(Principal principal, @PathVariable String projectId, @PathVariable String id) {
        return tasks.get(projectId, id, user(principal));
    }

    @PutMapping("/{id}")
    public TaskView update(Principal principal, @PathVariable String projectId, @PathVariable String id,
                           @RequestBody UpdateTask input) {
        return tasks.update(projectId, id, user(principal), input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable String projectId, @PathVariable String id, @RequestParam long version) {
        tasks.delete(projectId, id, user(principal), version);
    }

    @PutMapping("/{id}/assignments/{target}")
    public TaskView assign(Principal principal, @PathVariable String projectId, @PathVariable String id,
                           @PathVariable String target, @RequestBody VersionInput input) {
        return tasks.assign(projectId, id, user(principal), target, input.version(), false);
    }

    @DeleteMapping("/{id}/assignments/{target}")
    public TaskView unassign(Principal principal, @PathVariable String projectId, @PathVariable String id,
                             @PathVariable String target, @RequestParam long version) {
        return tasks.assign(projectId, id, user(principal), target, version, true);
    }

    @GetMapping("/{id}/comments")
    public CommentPage comments(Principal principal, @PathVariable String projectId, @PathVariable String id,
                                @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return tasks.comments(projectId, id, user(principal), page, pageSize);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentView comment(Principal principal, @PathVariable String projectId, @PathVariable String id,
                               @RequestBody CommentInput input) {
        return tasks.comment(projectId, id, user(principal), input.content());
    }
}
