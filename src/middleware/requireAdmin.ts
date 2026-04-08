import { Request, Response, NextFunction } from 'express';
import { User } from '../types';

// Extend Request interface locally to include user property
interface AuthenticatedRequest extends Request {
  user?: User;
}

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated (should be handled by authenticateToken middleware first)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
