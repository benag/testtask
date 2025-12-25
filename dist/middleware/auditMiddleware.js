"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAuth = exports.auditMiddleware = void 0;
const auditService_1 = require("../services/auditService");
const auditMiddleware = (action, resource) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
            const auditAction = action || determineAction(req.method, req.route?.path);
            const auditResource = resource || determineResource(req.route?.path);
            const resourceId = req.params.id || req.params.taskId || req.params.userId;
            const auditOptions = {
                success: isSuccess,
                details: {
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    body: sanitizeRequestBody(req.body)
                }
            };
            if (auditResource)
                auditOptions.resource = auditResource;
            if (resourceId)
                auditOptions.resourceId = resourceId;
            if (!isSuccess && data) {
                auditOptions.errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
            }
            auditService_1.AuditService.logFromRequest(req, auditAction, auditOptions);
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
const auditAuth = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        const action = req.path.includes('login') ?
            (isSuccess ? auditService_1.AUDIT_ACTIONS.LOGIN_SUCCESS : auditService_1.AUDIT_ACTIONS.LOGIN_FAILED) :
            auditService_1.AUDIT_ACTIONS.REGISTER;
        const authOptions = {
            resource: 'auth',
            success: isSuccess,
            details: {
                email: req.body.email,
                method: req.method,
                path: req.path,
                statusCode: res.statusCode
            }
        };
        if (!isSuccess && data) {
            authOptions.errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
        }
        auditService_1.AuditService.logFromRequest(req, action, authOptions);
        return originalSend.call(this, data);
    };
    next();
};
exports.auditAuth = auditAuth;
function determineAction(method, path) {
    if (!path)
        return `${method.toLowerCase()}_request`;
    const pathLower = path.toLowerCase();
    if (pathLower.includes('task')) {
        switch (method) {
            case 'POST': return auditService_1.AUDIT_ACTIONS.TASK_CREATE;
            case 'PUT':
            case 'PATCH': return auditService_1.AUDIT_ACTIONS.TASK_UPDATE;
            case 'DELETE': return auditService_1.AUDIT_ACTIONS.TASK_DELETE;
            case 'GET': return auditService_1.AUDIT_ACTIONS.TASK_VIEW;
        }
    }
    if (pathLower.includes('translation')) {
        switch (method) {
            case 'POST': return auditService_1.AUDIT_ACTIONS.TRANSLATION_CREATE;
            case 'PUT':
            case 'PATCH': return auditService_1.AUDIT_ACTIONS.TRANSLATION_UPDATE;
            case 'DELETE': return auditService_1.AUDIT_ACTIONS.TRANSLATION_DELETE;
            case 'GET': return 'translation_view';
        }
    }
    if (pathLower.includes('admin') && pathLower.includes('user')) {
        switch (method) {
            case 'GET': return auditService_1.AUDIT_ACTIONS.ADMIN_USER_VIEW;
            case 'PUT':
            case 'PATCH': return auditService_1.AUDIT_ACTIONS.ADMIN_USER_UPDATE;
            case 'DELETE': return auditService_1.AUDIT_ACTIONS.ADMIN_USER_DELETE;
        }
    }
    return `${method.toLowerCase()}_${pathLower.replace(/[^a-z0-9]/g, '_')}`;
}
function determineResource(path) {
    if (!path)
        return 'unknown';
    const pathLower = path.toLowerCase();
    if (pathLower.includes('task'))
        return 'task';
    if (pathLower.includes('translation'))
        return 'translation';
    if (pathLower.includes('user'))
        return 'user';
    if (pathLower.includes('auth'))
        return 'auth';
    if (pathLower.includes('admin'))
        return 'admin';
    return 'api';
}
function sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object')
        return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
//# sourceMappingURL=auditMiddleware.js.map