import { Router } from 'express';
import { AITranslationController } from '../controllers/aiTranslationController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
const aiTranslationController = new AITranslationController();

// All AI translation routes require admin access
router.use(authenticateToken);
router.use(requireAdmin);

// Generate single translation
router.post('/generate', aiTranslationController.generateTranslation.bind(aiTranslationController));

// Generate multiple translations
router.post('/generate-bulk', aiTranslationController.generateBulkTranslations.bind(aiTranslationController));

// Generate translations for a key (extracts meaningful text)
router.post('/generate-key', aiTranslationController.generateKeyTranslations.bind(aiTranslationController));

// Save generated translation
router.post('/save', aiTranslationController.saveGeneratedTranslation.bind(aiTranslationController));

// Get available languages for translation
router.get('/languages', aiTranslationController.getAvailableLanguages.bind(aiTranslationController));

// Validate OpenAI API key
router.get('/validate-api-key', aiTranslationController.validateApiKey.bind(aiTranslationController));

export default router;
