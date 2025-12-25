import { Request, Response } from 'express';
import { TranslationService } from '../services/translationService';
import { UserService } from '../services/userService';
import { TaskService } from '../services/taskService';
import { CreateTranslationKeyRequest, UpdateTranslationRequest, ApiResponse } from '../types';
import { AuthRequest } from '../middleware/auth';

const translationService = new TranslationService();
const userService = new UserService();
const taskService = new TaskService();

export class AdminController {
  // Dashboard stats
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const [userStats, taskStats] = await Promise.all([
        userService.getUserStats(),
        taskService.getTaskStats()
      ]);

      res.json({
        success: true,
        data: {
          users: userStats,
          tasks: taskStats
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // User management
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Language management
  async getLanguages(req: AuthRequest, res: Response): Promise<void> {
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

  async createLanguage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { code, name, is_active = true } = req.body;

      const language = await translationService.createLanguage(code, name, is_active);

      res.status(201).json({
        success: true,
        data: language,
        message: 'Language created successfully'
      });
    } catch (error) {
      console.error('Create language error:', error);
      if ((error as any).code === '23505') { // Unique violation
        res.status(409).json({
          success: false,
          error: 'Language code already exists'
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateLanguage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Language ID is required'
        });
        return;
      }

      const language = await translationService.updateLanguage(id, name, is_active);
      
      if (!language) {
        res.status(404).json({
          success: false,
          error: 'Language not found'
        });
        return;
      }

      res.json({
        success: true,
        data: language,
        message: 'Language updated successfully'
      });
    } catch (error) {
      console.error('Update language error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Translation key management
  async getTranslationKeys(req: AuthRequest, res: Response): Promise<void> {
    try {
      const keys = await translationService.getTranslationKeys();
      
      res.json({
        success: true,
        data: keys
      });
    } catch (error) {
      console.error('Get translation keys error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createTranslationKey(req: AuthRequest, res: Response): Promise<void> {
    try {
      const keyData: CreateTranslationKeyRequest = req.body;

      const key = await translationService.createTranslationKey(keyData);

      res.status(201).json({
        success: true,
        data: key,
        message: 'Translation key created successfully'
      });
    } catch (error) {
      console.error('Create translation key error:', error);
      if ((error as any).code === '23505') { // Unique violation
        res.status(409).json({
          success: false,
          error: 'Translation key already exists'
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateTranslationKey(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const keyData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Translation key ID is required'
        });
        return;
      }

      const key = await translationService.updateTranslationKey(id, keyData);
      
      if (!key) {
        res.status(404).json({
          success: false,
          error: 'Translation key not found'
        });
        return;
      }

      res.json({
        success: true,
        data: key,
        message: 'Translation key updated successfully'
      });
    } catch (error) {
      console.error('Update translation key error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteTranslationKey(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Translation key ID is required'
        });
        return;
      }

      const deleted = await translationService.deleteTranslationKey(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Translation key not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Translation key deleted successfully'
      });
    } catch (error) {
      console.error('Delete translation key error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Translation management
  async getTranslations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const translations = await translationService.getTranslationsWithDetails();
      
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

  async getAllTranslations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const translations = await translationService.getAllTranslations();
      
      res.json({
        success: true,
        data: translations
      });
    } catch (error) {
      console.error('Get all translations error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createTranslation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { key_id, language_code, value } = req.body;

      if (!key_id || !language_code || !value) {
        res.status(400).json({
          success: false,
          error: 'Key ID, language code, and value are required'
        });
        return;
      }

      const translation = await translationService.updateTranslation(
        key_id, 
        language_code, 
        { value }
      );

      res.status(201).json({
        success: true,
        data: translation,
        message: 'Translation created successfully'
      });
    } catch (error) {
      console.error('Create translation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateTranslationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { value } = req.body;

      if (!id || !value) {
        res.status(400).json({
          success: false,
          error: 'Translation ID and value are required'
        });
        return;
      }

      // For now, we'll need to parse the ID to get keyId and languageCode
      // This is a simplified approach - in production you might want a different strategy
      const translation = await translationService.updateTranslationById(id, { value });

      if (!translation) {
        res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: translation,
        message: 'Translation updated successfully'
      });
    } catch (error) {
      console.error('Update translation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteTranslationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Translation ID is required'
        });
        return;
      }

      const deleted = await translationService.deleteTranslationById(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Translation deleted successfully'
      });
    } catch (error) {
      console.error('Delete translation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateTranslation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { keyId, languageCode } = req.params;
      const translationData: UpdateTranslationRequest = req.body;

      if (!keyId || !languageCode) {
        res.status(400).json({
          success: false,
          error: 'Key ID and language code are required'
        });
        return;
      }

      const translation = await translationService.updateTranslation(
        keyId, 
        languageCode, 
        translationData
      );

      res.json({
        success: true,
        data: translation,
        message: 'Translation updated successfully'
      });
    } catch (error) {
      console.error('Update translation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteTranslation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { keyId, languageCode } = req.params;

      if (!keyId || !languageCode) {
        res.status(400).json({
          success: false,
          error: 'Key ID and language code are required'
        });
        return;
      }

      const deleted = await translationService.deleteTranslation(keyId, languageCode);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Translation not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Translation deleted successfully'
      });
    } catch (error) {
      console.error('Delete translation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Export/Import
  async exportTranslations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const translations = await translationService.exportTranslations();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="translations.json"');
      res.json(translations);
    } catch (error) {
      console.error('Export translations error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async importTranslations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const importData = req.body;

      const result = await translationService.importTranslations(importData);

      res.json({
        success: true,
        data: result,
        message: `Import completed. ${result.imported} translations imported.`
      });
    } catch (error) {
      console.error('Import translations error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
