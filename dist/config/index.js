"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/task_manager',
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '30m',
    },
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
};
//# sourceMappingURL=index.js.map