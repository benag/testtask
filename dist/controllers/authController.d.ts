import { Request, Response } from 'express';
import { LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '../types';
export declare class AuthController {
    register(req: Request<{}, ApiResponse<AuthResponse>, RegisterRequest>, res: Response): Promise<void>;
    login(req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>, res: Response): Promise<void>;
    me(req: Request, res: Response): Promise<void>;
    updateLanguage(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map