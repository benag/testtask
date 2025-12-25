"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_ACTIONS = exports.AuditService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AuditService {
    static async log(entry) {
        try {
            const query = `
        INSERT INTO audit_logs (
          user_id, action, resource, resource_id, details, 
          ip_address, user_agent, success, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
            const values = [
                entry.userId || null,
                entry.action,
                entry.resource || null,
                entry.resourceId || null,
                entry.details ? JSON.stringify(entry.details) : null,
                entry.ipAddress || null,
                entry.userAgent || null,
                entry.success !== false,
                entry.errorMessage || null
            ];
            await database_1.default.query(query, values);
        }
        catch (error) {
            console.error('Audit logging failed:', error);
        }
    }
    static async logFromRequest(req, action, options = {}) {
        const userAgent = req.get('User-Agent');
        const entry = {
            userId: req.user?.id,
            action,
            ...(options.resource && { resource: options.resource }),
            ...(options.resourceId && { resourceId: options.resourceId }),
            ...(options.details && { details: options.details }),
            ...(req.ip && { ipAddress: req.ip }),
            ...(userAgent && { userAgent }),
            ...(options.success !== undefined && { success: options.success }),
            ...(options.errorMessage && { errorMessage: options.errorMessage })
        };
        await this.log(entry);
    }
    static async getLogs(filters = {}) {
        let query = `
      SELECT 
        al.*,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
        const values = [];
        let paramCount = 0;
        if (filters.userId) {
            paramCount++;
            query += ` AND al.user_id = $${paramCount}`;
            values.push(filters.userId);
        }
        if (filters.action) {
            paramCount++;
            query += ` AND al.action = $${paramCount}`;
            values.push(filters.action);
        }
        if (filters.resource) {
            paramCount++;
            query += ` AND al.resource = $${paramCount}`;
            values.push(filters.resource);
        }
        if (filters.startDate) {
            paramCount++;
            query += ` AND al.created_at >= $${paramCount}`;
            values.push(filters.startDate);
        }
        if (filters.endDate) {
            paramCount++;
            query += ` AND al.created_at <= $${paramCount}`;
            values.push(filters.endDate);
        }
        if (filters.success !== undefined) {
            paramCount++;
            query += ` AND al.success = $${paramCount}`;
            values.push(filters.success);
        }
        query += ` ORDER BY al.created_at DESC`;
        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            values.push(filters.limit);
        }
        if (filters.offset) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            values.push(filters.offset);
        }
        const result = await database_1.default.query(query, values);
        return result.rows;
    }
    static async getStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const queries = await Promise.all([
            database_1.default.query('SELECT COUNT(*) as count FROM audit_logs WHERE created_at >= $1', [startDate]),
            database_1.default.query('SELECT COUNT(*) as count FROM audit_logs WHERE created_at >= $1 AND success = true', [startDate]),
            database_1.default.query('SELECT COUNT(*) as count FROM audit_logs WHERE created_at >= $1 AND success = false', [startDate]),
            database_1.default.query('SELECT COUNT(DISTINCT user_id) as count FROM audit_logs WHERE created_at >= $1 AND user_id IS NOT NULL', [startDate]),
            database_1.default.query('SELECT action, COUNT(*) as count FROM audit_logs WHERE created_at >= $1 GROUP BY action ORDER BY count DESC LIMIT 10', [startDate])
        ]);
        return {
            totalLogs: parseInt(queries[0].rows[0].count),
            successfulActions: parseInt(queries[1].rows[0].count),
            failedActions: parseInt(queries[2].rows[0].count),
            uniqueUsers: parseInt(queries[3].rows[0].count),
            topActions: queries[4].rows
        };
    }
}
exports.AuditService = AuditService;
exports.AUDIT_ACTIONS = {
    LOGIN_SUCCESS: 'login_success',
    LOGIN_FAILED: 'login_failed',
    LOGOUT: 'logout',
    REGISTER: 'register',
    TASK_CREATE: 'task_create',
    TASK_UPDATE: 'task_update',
    TASK_DELETE: 'task_delete',
    TASK_VIEW: 'task_view',
    ADMIN_USER_VIEW: 'admin_user_view',
    ADMIN_USER_UPDATE: 'admin_user_update',
    ADMIN_USER_DELETE: 'admin_user_delete',
    TRANSLATION_CREATE: 'translation_create',
    TRANSLATION_UPDATE: 'translation_update',
    TRANSLATION_DELETE: 'translation_delete',
    TRANSLATION_EXPORT: 'translation_export',
    TRANSLATION_IMPORT: 'translation_import',
    ACCOUNT_LOCKED: 'account_locked',
    ACCOUNT_UNLOCKED: 'account_unlocked',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded'
};
//# sourceMappingURL=auditService.js.map