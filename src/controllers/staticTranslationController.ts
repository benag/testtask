import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

export class StaticTranslationController {
  private getTranslationFilePath(languageCode: string): string {
    return path.join(__dirname, '../../client/src/locales', `${languageCode}.json`);
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
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const translations = JSON.parse(fileContent);

        res.json({
          success: true,
          data: {
            languageCode,
            translations
          }
        });
      } catch (fileError) {
        res.status(404).json({
          success: false,
          error: `Translation file not found for language: ${languageCode}`
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
      
      // Create a backup of the original file
      const backupPath = `${filePath}.backup.${Date.now()}`;
      try {
        await fs.copyFile(filePath, backupPath);
      } catch (backupError) {
        console.warn('Could not create backup file:', backupError);
      }

      // Write the updated translations
      const formattedJson = JSON.stringify(translations, null, 2);
      await fs.writeFile(filePath, formattedJson + '\n', 'utf-8');

      res.json({
        success: true,
        message: `Static translations updated for ${languageCode}`,
        data: {
          languageCode,
          updatedKeys: Object.keys(translations).length,
          backupCreated: true
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
