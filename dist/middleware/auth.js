"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, error: 'Access token required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
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
exports.requireAdmin = requireAdmin;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            req.user = decoded;
        }
        catch (error) {
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map