import { Request, Response, NextFunction } from 'express';
interface SanitizationConfig {
    allowHTML?: boolean;
    maxLength?: number;
    trimWhitespace?: boolean;
    normalizeEmail?: boolean;
}
export declare class InputSanitizer {
    static sanitizeString(input: string, config?: SanitizationConfig): string;
    static sanitizeObject(obj: any, fieldConfigs?: Record<string, SanitizationConfig>): any;
}
export declare const sanitizeInput: (fieldConfigs?: Record<string, SanitizationConfig>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const taskSanitization: (req: Request, res: Response, next: NextFunction) => void;
export declare const authSanitization: (req: Request, res: Response, next: NextFunction) => void;
export declare const translationSanitization: (req: Request, res: Response, next: NextFunction) => void;
export declare const xssProtection: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=sanitization.d.ts.map