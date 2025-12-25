import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../types';

export interface AuthRequest extends Request {
  user?: Omit<User, 'password_hash'>;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as Omit<User, 'password_hash'>;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }

  next();
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as Omit<User, 'password_hash'>;
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without user
    }
  }

  next();
};
