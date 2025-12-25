import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req: Request) => {
    // Use email if provided, otherwise fall back to IP
    return req.body.email || req.ip || 'unknown';
  },
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  keyGenerator: (req: Request) => req.ip || 'unknown',
  message: {
    success: false,
    error: 'Too many registration attempts. Please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for admin operations
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 admin operations per window
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: {
    success: false,
    error: 'Too many admin operations. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for translation updates (prevent spam)
export const translationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 translation updates per minute
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: {
    success: false,
    error: 'Too many translation updates. Please wait a moment.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
