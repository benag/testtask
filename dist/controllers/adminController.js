"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const translationService_1 = require("../services/translationService");
const userService_1 = require("../services/userService");
const taskService_1 = require("../services/taskService");
const translationService = new translationService_1.TranslationService();
const userService = new userService_1.UserService();
const taskService = new taskService_1.TaskService();
class AdminController {
    async getStats(req, res) {
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
        }
        catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async getLanguages(req, res) {
        try {
            const languages = await translationService.getLanguages();
            res.json({
                success: true,
                data: languages
            });
        }
        catch (error) {
            console.error('Get languages error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async createLanguage(req, res) {
        try {
            const { code, name, is_active = true } = req.body;
            const language = await translationService.createLanguage(code, name, is_active);
            res.status(201).json({
                success: true,
                data: language,
                message: 'Language created successfully'
            });
        }
        catch (error) {
            console.error('Create language error:', error);
            if (error.code === '23505') {
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
    async updateLanguage(req, res) {
        try {
            const { id } = req.params;
            const { name, is_active } = req.body;
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
        }
        catch (error) {
            console.error('Update language error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async getTranslationKeys(req, res) {
        try {
            const keys = await translationService.getTranslationKeys();
            res.json({
                success: true,
                data: keys
            });
        }
        catch (error) {
            console.error('Get translation keys error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async createTranslationKey(req, res) {
        try {
            const keyData = req.body;
            const key = await translationService.createTranslationKey(keyData);
            res.status(201).json({
                success: true,
                data: key,
                message: 'Translation key created successfully'
            });
        }
        catch (error) {
            console.error('Create translation key error:', error);
            if (error.code === '23505') {
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
    async updateTranslationKey(req, res) {
        try {
            const { id } = req.params;
            const keyData = req.body;
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
        }
        catch (error) {
            console.error('Update translation key error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async deleteTranslationKey(req, res) {
        try {
            const { id } = req.params;
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
        }
        catch (error) {
            console.error('Delete translation key error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async getTranslations(req, res) {
        try {
            const translations = await translationService.getTranslationsWithDetails();
            res.json({
                success: true,
                data: translations
            });
        }
        catch (error) {
            console.error('Get translations error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async updateTranslation(req, res) {
        try {
            const { keyId, languageCode } = req.params;
            const translationData = req.body;
            const translation = await translationService.updateTranslation(keyId, languageCode, translationData);
            res.json({
                success: true,
                data: translation,
                message: 'Translation updated successfully'
            });
        }
        catch (error) {
            console.error('Update translation error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async deleteTranslation(req, res) {
        try {
            const { keyId, languageCode } = req.params;
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
        }
        catch (error) {
            console.error('Delete translation error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async exportTranslations(req, res) {
        try {
            const translations = await translationService.exportTranslations();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="translations.json"');
            res.json(translations);
        }
        catch (error) {
            console.error('Export translations error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    async importTranslations(req, res) {
        try {
            const importData = req.body;
            const result = await translationService.importTranslations(importData);
            res.json({
                success: true,
                data: result,
                message: `Import completed. ${result.imported} translations imported.`
            });
        }
        catch (error) {
            console.error('Import translations error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map