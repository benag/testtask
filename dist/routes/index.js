"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const tasks_1 = __importDefault(require("./tasks"));
const admin_1 = __importDefault(require("./admin"));
const translations_1 = __importDefault(require("./translations"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Task Manager API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
router.use('/auth', auth_1.default);
router.use('/tasks', tasks_1.default);
router.use('/admin', admin_1.default);
router.use('/translations', translations_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map