import { Router } from 'express';
import { StaticTranslationController } from '../controllers/staticTranslationController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
const staticTranslationController = new StaticTranslationController();

// All static translation routes require admin access
router.use(authenticateToken);
router.use(requireAdmin);

// Get available languages
router.get('/languages', staticTranslationController.getAvailableLanguages.bind(staticTranslationController));

// Get static translations for a language
router.get('/:languageCode', staticTranslationController.getStaticTranslations.bind(staticTranslationController));

// Update static translations for a language
router.put('/:languageCode', staticTranslationController.updateStaticTranslations.bind(staticTranslationController));

export default router;
