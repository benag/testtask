import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const schemas: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    createTask: Joi.ObjectSchema<any>;
    updateTask: Joi.ObjectSchema<any>;
    createTranslationKey: Joi.ObjectSchema<any>;
    updateTranslation: Joi.ObjectSchema<any>;
    createLanguage: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map