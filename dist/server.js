"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const rateLimiting_1 = require("./middleware/rateLimiting");
const sanitization_1 = require("./middleware/sanitization");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(sanitization_1.xssProtection);
app.use('/api/', rateLimiting_1.generalLimiter);
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', routes_1.default);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Manager API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            tasks: '/api/tasks',
            admin: '/api/admin',
            translations: '/api/translations'
        }
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        error: config_1.config.nodeEnv === 'production' ? 'Internal server error' : err.message
    });
});
const server = app.listen(config_1.config.port, () => {
    console.log(`🚀 Server running on port ${config_1.config.port}`);
    console.log(`📊 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🌐 CORS origin: ${config_1.config.cors.origin}`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map