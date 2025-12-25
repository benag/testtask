"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssProtection = exports.translationSanitization = exports.authSanitization = exports.taskSanitization = exports.sanitizeInput = exports.InputSanitizer = void 0;
const validator_1 = __importDefault(require("validator"));
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
class InputSanitizer {
    static sanitizeString(input, config = {}) {
        if (typeof input !== 'string')
            return input;
        let sanitized = input;
        if (config.trimWhitespace !== false) {
            sanitized = sanitized.trim();
        }
        if (config.normalizeEmail && validator_1.default.isEmail(sanitized)) {
            sanitized = validator_1.default.normalizeEmail(sanitized) || sanitized;
        }
        if (config.allowHTML) {
            sanitized = isomorphic_dompurify_1.default.sanitize(sanitized, {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: []
            });
        }
        else {
            sanitized = validator_1.default.escape(sanitized);
        }
        if (config.maxLength && sanitized.length > config.maxLength) {
            sanitized = sanitized.substring(0, config.maxLength);
        }
        return sanitized;
    }
    static sanitizeObject(obj, fieldConfigs = {}) {
        if (obj === null || obj === undefined)
            return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item, fieldConfigs));
        }
        if (typeof obj !== 'object') {
            return typeof obj === 'string' ? this.sanitizeString(obj) : obj;
        }
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            const config = fieldConfigs[key] || {};
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value, config);
            }
            else if (typeof value === 'object') {
                sanitized[key] = this.sanitizeObject(value, fieldConfigs);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}
exports.InputSanitizer = InputSanitizer;
const sanitizeInput = (fieldConfigs = {}) => {
    return (req, res, next) => {
        try {
            if (req.body && typeof req.body === 'object') {
                req.body = InputSanitizer.sanitizeObject(req.body, fieldConfigs);
            }
            if (req.query && typeof req.query === 'object') {
                const sanitizedQuery = {};
                for (const [key, value] of Object.entries(req.query)) {
                    if (typeof value === 'string') {
                        sanitizedQuery[key] = InputSanitizer.sanitizeString(value);
                    }
                    else {
                        sanitizedQuery[key] = value;
                    }
                }
                req.query = sanitizedQuery;
            }
            if (req.params && typeof req.params === 'object') {
                const sanitizedParams = {};
                for (const [key, value] of Object.entries(req.params)) {
                    if (typeof value === 'string') {
                        sanitizedParams[key] = InputSanitizer.sanitizeString(value);
                    }
                    else {
                        sanitizedParams[key] = value;
                    }
                }
                req.params = sanitizedParams;
            }
            next();
        }
        catch (error) {
            console.error('Input sanitization error:', error);
            res.status(400).json({
                success: false,
                error: 'Invalid input data'
            });
        }
    };
};
exports.sanitizeInput = sanitizeInput;
exports.taskSanitization = (0, exports.sanitizeInput)({
    title: { maxLength: 255, trimWhitespace: true },
    description: { allowHTML: true, maxLength: 2000, trimWhitespace: true }
});
exports.authSanitization = (0, exports.sanitizeInput)({
    email: { normalizeEmail: true, maxLength: 255, trimWhitespace: true },
    password: { maxLength: 128, trimWhitespace: false }
});
exports.translationSanitization = (0, exports.sanitizeInput)({
    key_name: { maxLength: 255, trimWhitespace: true },
    value: { allowHTML: false, maxLength: 1000, trimWhitespace: true },
    description: { maxLength: 500, trimWhitespace: true },
    category: { maxLength: 100, trimWhitespace: true },
    language_code: { maxLength: 10, trimWhitespace: true }
});
const xssProtection = (req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    const checkForXSS = (value) => {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
        ];
        return xssPatterns.some(pattern => pattern.test(value));
    };
    const validateInput = (obj) => {
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
exports.xssProtection = xssProtection;
//# sourceMappingURL=sanitization.js.map