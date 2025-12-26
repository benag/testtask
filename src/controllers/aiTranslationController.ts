import { Request, Response } from 'express';
import { AITranslationService } from '../services/aiTranslationService';
import { TranslationService } from '../services/translationService';

export class AITranslationController {
  private aiTranslationService: AITranslationService;
  private translationService: TranslationService;

  constructor() {
    this.aiTranslationService = new AITranslationService();
    this.translationService = new TranslationService();
  }

  async generateTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { key, sourceLanguage, targetLanguage, context } = req.body;

      if (!key || !sourceLanguage || !targetLanguage) {
        res.status(400).json({
          success: false,
          error: 'Key, source language, and target language are required'
        });
        return;
      }

      // Get the source text from the database
      const sourceTranslations = await this.translationService.getTranslationsByLanguage(sourceLanguage);
      const sourceText = sourceTranslations[key];

      if (!sourceText) {
        res.status(404).json({
          success: false,
          error: `Translation key "${key}" not found in source language "${sourceLanguage}"`
        });
        return;
      }

      const translation = await this.aiTranslationService.generateTranslation(
        key,
        sourceText,
        sourceLanguage,
        targetLanguage,
        context
      );

      res.json({
        success: true,
        data: {
          key,
          sourceText,
          translation,
          sourceLanguage,
          targetLanguage
        }
      });
    } catch (error) {
      console.error('Generate translation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate translation'
      });
    }
  }

  async generateBulkTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { keys, sourceLanguage, targetLanguage, context } = req.body;

      if (!keys || !Array.isArray(keys) || !sourceLanguage || !targetLanguage) {
        res.status(400).json({
          success: false,
          error: 'Keys array, source language, and target language are required'
        });
        return;
      }

      // Get source translations
      const sourceTranslations = await this.translationService.getTranslationsByLanguage(sourceLanguage);

      // Prepare translation requests
      const translationRequests = keys
        .filter(key => sourceTranslations[key]) // Only include keys that exist in source
        .map(key => ({
          key,
          sourceText: sourceTranslations[key] as string, // Type assertion since we filtered above
          sourceLanguage,
          targetLanguage,
          context
        }));

      if (translationRequests.length === 0) {
        res.status(404).json({
          success: false,
          error: 'No valid translation keys found in source language'
        });
        return;
      }

      const results = await this.aiTranslationService.generateMultipleTranslations(translationRequests);

      res.json({
        success: true,
        data: {
          sourceLanguage,
          targetLanguage,
          results,
          total: results.length,
          successful: results.filter(r => !r.error).length,
          failed: results.filter(r => r.error).length
        }
      });
    } catch (error) {
      console.error('Generate bulk translations error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate bulk translations'
      });
    }
  }

  async saveGeneratedTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { key, translation, targetLanguage } = req.body;

      if (!key || !translation || !targetLanguage) {
        res.status(400).json({
          success: false,
          error: 'Key, translation, and target language are required'
        });
        return;
      }

      // Save the translation to the database
      await this.translationService.updateTranslation(key, targetLanguage, translation);

      res.json({
        success: true,
        message: 'Translation saved successfully',
        data: {
          key,
          translation,
          targetLanguage
        }
      });
    } catch (error) {
      console.error('Save translation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save translation'
      });
    }
  }

  async getAvailableLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = this.aiTranslationService.getAvailableLanguages();
      
      res.json({
        success: true,
        data: languages
      });
    } catch (error) {
      console.error('Get available languages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available languages'
      });
    }
  }

  async generateKeyTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { key, targetLanguages } = req.body;

      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Translation key is required'
        });
        return;
      }

      const languages = targetLanguages || ['he', 'ru'];
      const translations = await this.aiTranslationService.generateKeyTranslations(key, languages);

      res.json({
        success: true,
        data: {
          key,
          translations,
          targetLanguages: languages
        }
      });
    } catch (error) {
      console.error('Generate key translations error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate key translations'
      });
    }
  }

  async validateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const isValid = await this.aiTranslationService.validateApiKey();
      
      res.json({
        success: true,
        data: {
          apiKeyValid: isValid,
          message: isValid ? 'OpenAI API key is valid' : 'OpenAI API key is invalid or missing'
        }
      });
    } catch (error) {
      console.error('Validate API key error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate API key'
      });
    }
  }
}
