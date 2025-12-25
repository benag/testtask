"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: errorMessage
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
exports.schemas = {
    register: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        preferred_language: joi_1.default.string().optional().default('en'),
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
    createTask: joi_1.default.object({
        title: joi_1.default.string().required().max(255),
        description: joi_1.default.string().optional().allow(''),
        status: joi_1.default.string().valid('todo', 'in_progress', 'done').optional().default('todo'),
        priority: joi_1.default.string().valid('low', 'medium', 'high').optional().default('medium'),
        due_date: joi_1.default.date().iso().optional(),
    }),
    updateTask: joi_1.default.object({
        title: joi_1.default.string().optional().max(255),
        description: joi_1.default.string().optional().allow(''),
        status: joi_1.default.string().valid('todo', 'in_progress', 'done').optional(),
        priority: joi_1.default.string().valid('low', 'medium', 'high').optional(),
        due_date: joi_1.default.date().iso().optional().allow(null),
    }),
    createTranslationKey: joi_1.default.object({
        key_name: joi_1.default.string().required().max(255),
        description: joi_1.default.string().optional().allow(''),
        category: joi_1.default.string().optional().max(100),
    }),
    updateTranslation: joi_1.default.object({
        value: joi_1.default.string().required(),
    }),
    createLanguage: joi_1.default.object({
        code: joi_1.default.string().required().max(10),
        name: joi_1.default.string().required().max(100),
        is_active: joi_1.default.boolean().optional().default(true),
    }),
};
//# sourceMappingURL=validation.js.map