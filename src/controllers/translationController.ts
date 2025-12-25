import { Request, Response } from 'express';
import { TranslationService } from '../services/translationService';

const translationService = new TranslationService();

export class TranslationController {
  async getLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await translationService.getLanguages();
      
      res.json({
        success: true,
        data: languages
      });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { language } = req.params;
      
      if (!language) {
        res.status(400).json({
          success: false,
          error: 'Language parameter is required'
        });
        return;
      }
      
      const translations = await translationService.getTranslationsByLanguage(language);
      
      res.json({
        success: true,
        data: translations
      });
    } catch (error) {
      console.error('Get translations error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
