export interface User { id: string; displayName: string }
export interface Member extends User { active: boolean; role: 'MANAGER' | 'MEMBER' }
export interface Progress { total: number; todo: number; inProgress: number; done: number; completedPercent: number }
export interface Pagination { page: number; pageSize: number; totalItems: number; totalPages: number }
export interface Project {
  id: string; name: string; description: string; ownerUserId: string;
  currentRole: 'MANAGER' | 'MEMBER'; version: number; createdAt: string; progress: Progress;
}
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export interface Task {
  id: string; projectId: string; title: string; description: string; status: Status;
  priority: Priority; assignees: User[]; version: number; createdAt: string; updatedAt: string;
}
export interface ProjectPage { items: Project[]; pagination: Pagination }
export interface TaskPage { project: Project; items: Task[]; pagination: Pagination; progress: Progress }
export interface Comment { id: string; taskId: string; author: User; content: string; createdAt: string }
export interface CommentPage { items: Comment[]; pagination: Pagination }
export const statusLabels: Record<Status, string> = { TODO: 'Por fazer', IN_PROGRESS: 'Em curso', DONE: 'Concluída' };
export const priorityLabels: Record<Priority, string> = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta' };
