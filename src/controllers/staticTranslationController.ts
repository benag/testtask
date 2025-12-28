import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

export class StaticTranslationController {
  private getTranslationFilePath(languageCode: string): string {
    // In development, the files are in the source directory
    // In production, they might be in a different location
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Development: files are in the source directory
      return path.join(process.cwd(), 'client/src/locales', `${languageCode}.json`);
    } else {
      // Production: files might be in the built directory
      return path.join(__dirname, '../../client/src/locales', `${languageCode}.json`);
    }
  }

  async getStaticTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { languageCode } = req.params;

      if (!languageCode) {
        res.status(400).json({
          success: false,
          error: 'Language code is required'
        });
        return;
      }

      const filePath = this.getTranslationFilePath(languageCode);
      console.log(`📁 Looking for translation file at: ${filePath}`);
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const translations = JSON.parse(fileContent);
        console.log(`✅ Successfully loaded ${Object.keys(translations).length} translations for ${languageCode}`);
        console.log(`🎯 nav.tasks value from file:`, translations['nav.tasks']);
        console.log(`🔍 First 10 translation keys:`, Object.keys(translations).slice(0, 10));
        console.log(`🔍 File content preview:`, fileContent.substring(0, 200) + '...');

        res.json({
          success: true,
          data: {
            languageCode,
            translations
          }
        });
      } catch (fileError) {
        console.error(`❌ Failed to load translation file for ${languageCode}:`, fileError);
        res.status(404).json({
          success: false,
          error: `Translation file not found for language: ${languageCode}. Path: ${filePath}`
        });
      }
    } catch (error) {
      console.error('Get static translations error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get static translations'
      });
    }
  }

  async updateStaticTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { languageCode } = req.params;
      const { translations } = req.body;

      if (!languageCode || !translations) {
        res.status(400).json({
          success: false,
          error: 'Language code and translations are required'
        });
        return;
      }

      const filePath = this.getTranslationFilePath(languageCode);
      console.log(`💾 Saving translations to: ${filePath}`);
      
      // Create a backup of the original file
      const backupPath = `${filePath}.backup.${Date.now()}`;
      try {
        await fs.copyFile(filePath, backupPath);
        console.log(`📎 Backup created: ${backupPath}`);
      } catch (backupError) {
        console.warn('Could not create backup file:', backupError);
      }

      // Write the updated translations
      const formattedJson = JSON.stringify(translations, null, 2);
      await fs.writeFile(filePath, formattedJson + '\n', 'utf-8');
      console.log(`✅ Successfully saved ${Object.keys(translations).length} translations for ${languageCode}`);

      // Clear require cache to force reload of the JSON file
      const absolutePath = require.resolve(filePath);
      delete require.cache[absolutePath];
      
      // Also clear any Node.js module cache for the locales
      Object.keys(require.cache).forEach(key => {
        if (key.includes('/locales/') && key.endsWith('.json')) {
          delete require.cache[key];
        }
      });

      res.json({
        success: true,
        message: `Static translations updated for ${languageCode}`,
        data: {
          languageCode,
          updatedKeys: Object.keys(translations).length,
          backupCreated: true,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Update static translations error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update static translations'
      });
    }
  }

  async getAvailableLanguages(req: Request, res: Response): Promise<void> {
    try {
      const localesDir = path.join(__dirname, '../../client/src/locales');
      const files = await fs.readdir(localesDir);
      
      const languages = files
        .filter(file => file.endsWith('.json') && file !== 'index.ts')
        .map(file => file.replace('.json', ''))
        .sort();

      res.json({
        success: true,
        data: languages
      });
    } catch (error) {
      console.error('Get available languages error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available languages'
      });
    }
  }
}
