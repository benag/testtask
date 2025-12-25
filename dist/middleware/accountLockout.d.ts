import { Request, Response, NextFunction } from 'express';
interface LoginAttempt {
    email: string;
    ip: string;
    success: boolean;
}
export declare class AccountLockoutService {
    private static readonly MAX_ATTEMPTS;
    private static readonly LOCKOUT_DURATION;
    static recordLoginAttempt(attempt: LoginAttempt): Promise<void>;
    static isAccountLocked(email: string): Promise<{
        locked: boolean;
        lockedUntil?: Date;
    }>;
    static unlockAccount(email: string): Promise<void>;
}
export declare const checkAccountLockout: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=accountLockout.d.ts.map