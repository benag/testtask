import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
// Removed DOMPurify to fix ES module issues in production

// Configuration for different sanitization levels
interface SanitizationConfig {
  allowHTML?: boolean;
  maxLength?: number;
  trimWhitespace?: boolean;
  normalizeEmail?: boolean;
}

export class InputSanitizer {
  // Sanitize a single string value
  static sanitizeString(
    input: string, 
    config: SanitizationConfig = {}
  ): string {
    if (typeof input !== 'string') return input;

    let sanitized = input;

    // Trim whitespace if enabled (default: true)
    if (config.trimWhitespace !== false) {
      sanitized = sanitized.trim();
    }

    // Normalize email if it's an email field
    if (config.normalizeEmail && validator.isEmail(sanitized)) {
      sanitized = validator.normalizeEmail(sanitized) || sanitized;
    }

    // Handle HTML content
    if (config.allowHTML) {
      // Simple HTML sanitization - remove script tags and dangerous content
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else {
      // Escape HTML entities for plain text
      sanitized = validator.escape(sanitized);
    }

    // Enforce maximum length
    if (config.maxLength && sanitized.length > config.maxLength) {
      sanitized = sanitized.substring(0, config.maxLength);
    }

    return sanitized;
  }

  // Recursively sanitize an object
  static sanitizeObject(
    obj: any, 
    fieldConfigs: Record<string, SanitizationConfig> = {}
  ): any {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, fieldConfigs));
    }
    
    if (typeof obj !== 'object') {
      return typeof obj === 'string' ? this.sanitizeString(obj) : obj;
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const config = fieldConfigs[key] || {};
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value, config);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value, fieldConfigs);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Middleware for general input sanitization
export const sanitizeInput = (
  fieldConfigs: Record<string, SanitizationConfig> = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = InputSanitizer.sanitizeObject(req.body, fieldConfigs);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        const sanitizedQuery: any = {};
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            sanitizedQuery[key] = InputSanitizer.sanitizeString(value);
          } else {
            sanitizedQuery[key] = value;
          }
        }
        req.query = sanitizedQuery;
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        const sanitizedParams: any = {};
        for (const [key, value] of Object.entries(req.params)) {
          if (typeof value === 'string') {
            sanitizedParams[key] = InputSanitizer.sanitizeString(value);
          } else {
            sanitizedParams[key] = value;
          }
        }
        req.params = sanitizedParams;
      }

      next();
    } catch (error) {
      console.error('Input sanitization error:', error);
      res.status(400).json({
        success: false,
        error: 'Invalid input data'
      });
    }
  };
};

// Specific sanitization configurations for different endpoints
export const taskSanitization = sanitizeInput({
  title: { maxLength: 255, trimWhitespace: true },
  description: { allowHTML: true, maxLength: 2000, trimWhitespace: true }
});

export const authSanitization = sanitizeInput({
  email: { normalizeEmail: true, maxLength: 255, trimWhitespace: true },
  password: { maxLength: 128, trimWhitespace: false } // Don't trim passwords
});

export const translationSanitization = sanitizeInput({
  key_name: { maxLength: 255, trimWhitespace: true },
  value: { allowHTML: false, maxLength: 1000, trimWhitespace: true },
  description: { maxLength: 500, trimWhitespace: true },
  category: { maxLength: 100, trimWhitespace: true },
  language_code: { maxLength: 10, trimWhitespace: true }
});

// Advanced XSS protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Set XSS protection headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Additional XSS checks for specific patterns
  const checkForXSS = (value: string): boolean => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(value));
  };

  const validateInput = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return !checkForXSS(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.every(validateInput);
    }
    
    if (obj && typeof obj === 'object') {
      return Object.values(obj).every(validateInput);
    }
    
    return true;
  };

  // Check request body, query, and params for XSS
  const inputs = [req.body, req.query, req.params].filter(Boolean);
  
  for (const input of inputs) {
    if (!validateInput(input)) {
      return res.status(400).json({
        success: false,
        error: 'Potentially malicious input detected'
      });
    }
  }

  return next();
};
