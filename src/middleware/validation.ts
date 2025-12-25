import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    preferred_language: Joi.string().optional().default('en'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createTask: Joi.object({
    title: Joi.string().required().max(255),
    description: Joi.string().optional().allow(''),
    status: Joi.string().valid('todo', 'in_progress', 'done').optional().default('todo'),
    priority: Joi.string().valid('low', 'medium', 'high').optional().default('medium'),
    due_date: Joi.date().iso().optional(),
  }),

  updateTask: Joi.object({
    title: Joi.string().optional().max(255),
    description: Joi.string().optional().allow(''),
    status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    due_date: Joi.date().iso().optional().allow(null),
  }),

  createTranslationKey: Joi.object({
    key_name: Joi.string().required().max(255),
    description: Joi.string().optional().allow(''),
    category: Joi.string().optional().max(100),
  }),

  updateTranslation: Joi.object({
    value: Joi.string().required(),
  }),

  createLanguage: Joi.object({
    code: Joi.string().required().max(10),
    name: Joi.string().required().max(100),
    is_active: Joi.boolean().optional().default(true),
  }),
};
