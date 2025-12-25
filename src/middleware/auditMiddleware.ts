import { Request, Response, NextFunction } from 'express';
import { AuditService, AUDIT_ACTIONS } from '../services/auditService';

// Middleware to automatically log API requests
export const auditMiddleware = (action?: string, resource?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    // Override res.send to capture response
    res.send = function(data: any) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      
      // Determine action if not provided
      const auditAction = action || determineAction(req.method, req.route?.path);
      
      // Determine resource if not provided
      const auditResource = resource || determineResource(req.route?.path);
      
      // Extract resource ID from params
      const resourceId = req.params.id || req.params.taskId || req.params.userId;
      
      // Create audit log entry
      const auditOptions: any = {
        success: isSuccess,
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          // Don't log sensitive data like passwords
          body: sanitizeRequestBody(req.body)
        }
      };

      if (auditResource) auditOptions.resource = auditResource;
      if (resourceId) auditOptions.resourceId = resourceId;
      if (!isSuccess && data) {
        auditOptions.errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
      }

      AuditService.logFromRequest(req, auditAction, auditOptions);

      return originalSend.call(this, data);
    };

    next();
  };
};

// Specific audit middleware for authentication
export const auditAuth = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
    const action = req.path.includes('login') ? 
      (isSuccess ? AUDIT_ACTIONS.LOGIN_SUCCESS : AUDIT_ACTIONS.LOGIN_FAILED) :
      AUDIT_ACTIONS.REGISTER;

    const authOptions: any = {
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

    AuditService.logFromRequest(req, action, authOptions);

    return originalSend.call(this, data);
  };

  next();
};

// Helper function to determine action from HTTP method and path
function determineAction(method: string, path?: string): string {
  if (!path) return `${method.toLowerCase()}_request`;
  
  const pathLower = path.toLowerCase();
  
  if (pathLower.includes('task')) {
    switch (method) {
      case 'POST': return AUDIT_ACTIONS.TASK_CREATE;
      case 'PUT':
      case 'PATCH': return AUDIT_ACTIONS.TASK_UPDATE;
      case 'DELETE': return AUDIT_ACTIONS.TASK_DELETE;
      case 'GET': return AUDIT_ACTIONS.TASK_VIEW;
    }
  }
  
  if (pathLower.includes('translation')) {
    switch (method) {
      case 'POST': return AUDIT_ACTIONS.TRANSLATION_CREATE;
      case 'PUT':
      case 'PATCH': return AUDIT_ACTIONS.TRANSLATION_UPDATE;
      case 'DELETE': return AUDIT_ACTIONS.TRANSLATION_DELETE;
      case 'GET': return 'translation_view';
    }
  }
  
  if (pathLower.includes('admin') && pathLower.includes('user')) {
    switch (method) {
      case 'GET': return AUDIT_ACTIONS.ADMIN_USER_VIEW;
      case 'PUT':
      case 'PATCH': return AUDIT_ACTIONS.ADMIN_USER_UPDATE;
      case 'DELETE': return AUDIT_ACTIONS.ADMIN_USER_DELETE;
    }
  }
  
  return `${method.toLowerCase()}_${pathLower.replace(/[^a-z0-9]/g, '_')}`;
}

// Helper function to determine resource from path
function determineResource(path?: string): string {
  if (!path) return 'unknown';
  
  const pathLower = path.toLowerCase();
  
  if (pathLower.includes('task')) return 'task';
  if (pathLower.includes('translation')) return 'translation';
  if (pathLower.includes('user')) return 'user';
  if (pathLower.includes('auth')) return 'auth';
  if (pathLower.includes('admin')) return 'admin';
  
  return 'api';
}

// Sanitize request body to remove sensitive information
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}
