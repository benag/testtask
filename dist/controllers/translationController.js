"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationController = void 0;
const translationService_1 = require("../services/translationService");
const translationService = new translationService_1.TranslationService();
class TranslationController {
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
    async getTranslations(req, res) {
        try {
            const { language } = req.params;
            const translations = await translationService.getTranslationsByLanguage(language);
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
}
exports.TranslationController = TranslationController;
//# sourceMappingURL=translationController.js.map