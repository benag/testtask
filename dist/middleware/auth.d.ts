import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
export interface AuthRequest extends Request {
    user?: Omit<User, 'password_hash'>;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map