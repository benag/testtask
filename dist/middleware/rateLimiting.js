"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translationLimiter = exports.adminLimiter = exports.registerLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        return req.body.email || req.ip || 'unknown';
    },
    message: {
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator: (req) => req.ip || 'unknown',
    message: {
        success: false,
        error: 'Too many registration attempts. Please try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.adminLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 50,
    keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
    message: {
        success: false,
        error: 'Too many admin operations. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.translationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
    message: {
        success: false,
        error: 'Too many translation updates. Please wait a moment.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiting.js.map