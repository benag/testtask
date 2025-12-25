import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AdminController {
    getStats(req: AuthRequest, res: Response): Promise<void>;
    getLanguages(req: AuthRequest, res: Response): Promise<void>;
    createLanguage(req: AuthRequest, res: Response): Promise<void>;
    updateLanguage(req: AuthRequest, res: Response): Promise<void>;
    getTranslationKeys(req: AuthRequest, res: Response): Promise<void>;
    createTranslationKey(req: AuthRequest, res: Response): Promise<void>;
    updateTranslationKey(req: AuthRequest, res: Response): Promise<void>;
    deleteTranslationKey(req: AuthRequest, res: Response): Promise<void>;
    getTranslations(req: AuthRequest, res: Response): Promise<void>;
    updateTranslation(req: AuthRequest, res: Response): Promise<void>;
    deleteTranslation(req: AuthRequest, res: Response): Promise<void>;
    exportTranslations(req: AuthRequest, res: Response): Promise<void>;
    importTranslations(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=adminController.d.ts.map