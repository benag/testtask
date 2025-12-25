import { Router } from 'express';
import { TranslationController } from '../controllers/translationController';

const router = Router();
const translationController = new TranslationController();

// Public routes for translations
router.get('/languages', translationController.getLanguages.bind(translationController));
router.get('/:language', translationController.getTranslations.bind(translationController));

export default router;
