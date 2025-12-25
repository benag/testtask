import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters, PaginatedResponse } from '../types';
export declare class TaskService {
    createTask(userId: string, taskData: CreateTaskRequest): Promise<Task>;
    getUserTasks(userId: string, filters?: TaskFilters, page?: number, limit?: number): Promise<PaginatedResponse<Task>>;
    getTaskById(taskId: string, userId: string): Promise<Task | null>;
    updateTask(taskId: string, userId: string, taskData: UpdateTaskRequest): Promise<Task | null>;
    deleteTask(taskId: string, userId: string): Promise<boolean>;
    getTaskStats(): Promise<{
        total_tasks: number;
        tasks_by_status: {
            status: string;
            count: number;
        }[];
        tasks_by_priority: {
            priority: string;
            count: number;
        }[];
    }>;
}
//# sourceMappingURL=taskService.d.ts.map