package pt.matriz.common;

import java.time.Instant;
import java.util.List;

public final class ApiModels {
    private ApiModels() {}

    public record UserView(String id, String displayName) {}
    public record MemberView(String id, String displayName, boolean active, String role) {}
    public record Progress(long total, long todo, long inProgress, long done, int completedPercent) {}
    public record Pagination(int page, int pageSize, long totalItems, long totalPages) {}
    public record ProjectView(String id, String name, String description, String ownerUserId,
                              String currentRole, long version, Instant createdAt, Progress progress) {}
    public record ProjectPage(List<ProjectView> items, Pagination pagination) {}
    public record TaskView(String id, String projectId, String title, String description,
                           String status, String priority, List<UserView> assignees,
                           long version, Instant createdAt, Instant updatedAt) {}
    public record TaskPage(ProjectView project, List<TaskView> items, Pagination pagination, Progress progress) {}
    public record CommentView(String id, String taskId, UserView author, String content, Instant createdAt) {}
    public record CommentPage(List<CommentView> items, Pagination pagination) {}
    public record ProjectInput(String name, String description, Long version) {}
    public record CreateTask(String title, String description, String priority) {}
    public record UpdateTask(String title, String description, String status, String priority, Long version) {}
    public record VersionInput(Long version) {}
    public record MemberInput(String userId) {}
    public record CommentInput(String content) {}
}
