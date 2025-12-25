import { Request, Response, NextFunction } from 'express';
export declare const auditMiddleware: (action?: string, resource?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auditMiddleware.d.ts.map