import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class TaskController {
    createTask(req: AuthRequest, res: Response): Promise<void>;
    getTasks(req: AuthRequest, res: Response): Promise<void>;
    getTask(req: AuthRequest, res: Response): Promise<void>;
    updateTask(req: AuthRequest, res: Response): Promise<void>;
    deleteTask(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=taskController.d.ts.map