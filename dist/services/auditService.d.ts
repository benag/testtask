import { Request } from 'express';
export interface AuditLogEntry {
    userId?: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
}
export declare class AuditService {
    static log(entry: AuditLogEntry): Promise<void>;
    static logFromRequest(req: Request, action: string, options?: {
        resource?: string;
        resourceId?: string;
        details?: Record<string, any>;
        success?: boolean;
        errorMessage?: string;
    }): Promise<void>;
    static getLogs(filters?: {
        userId?: string;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        success?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<any[]>;
    static getStats(days?: number): Promise<{
        totalLogs: number;
        successfulActions: number;
        failedActions: number;
        uniqueUsers: number;
        topActions: Array<{
            action: string;
            count: number;
        }>;
    }>;
}
export declare const AUDIT_ACTIONS: {
    readonly LOGIN_SUCCESS: "login_success";
    readonly LOGIN_FAILED: "login_failed";
    readonly LOGOUT: "logout";
    readonly REGISTER: "register";
    readonly TASK_CREATE: "task_create";
    readonly TASK_UPDATE: "task_update";
    readonly TASK_DELETE: "task_delete";
    readonly TASK_VIEW: "task_view";
    readonly ADMIN_USER_VIEW: "admin_user_view";
    readonly ADMIN_USER_UPDATE: "admin_user_update";
    readonly ADMIN_USER_DELETE: "admin_user_delete";
    readonly TRANSLATION_CREATE: "translation_create";
    readonly TRANSLATION_UPDATE: "translation_update";
    readonly TRANSLATION_DELETE: "translation_delete";
    readonly TRANSLATION_EXPORT: "translation_export";
    readonly TRANSLATION_IMPORT: "translation_import";
    readonly ACCOUNT_LOCKED: "account_locked";
    readonly ACCOUNT_UNLOCKED: "account_unlocked";
    readonly RATE_LIMIT_EXCEEDED: "rate_limit_exceeded";
};
//# sourceMappingURL=auditService.d.ts.map