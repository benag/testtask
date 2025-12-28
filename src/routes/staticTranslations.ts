import { Router } from 'express';
import { StaticTranslationController } from '../controllers/staticTranslationController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
const staticTranslationController = new StaticTranslationController();

// Test endpoint (no auth required for debugging)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Static translations API is working!' });
});

// Get available languages (no auth required for reading)
router.get('/languages', staticTranslationController.getAvailableLanguages.bind(staticTranslationController));

// Get static translations for a language (no auth required for reading)
router.get('/:languageCode', staticTranslationController.getStaticTranslations.bind(staticTranslationController));

// Update static translations requires admin access
router.use(authenticateToken);
router.use(requireAdmin);
router.put('/:languageCode', staticTranslationController.updateStaticTranslations.bind(staticTranslationController));

export default router;
