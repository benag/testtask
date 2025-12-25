import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { validateRequest, schemas } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats.bind(adminController));

// User management
router.get('/users', adminController.getUsers.bind(adminController));

// Language management
router.get('/languages', adminController.getLanguages.bind(adminController));
router.post('/languages', validateRequest(schemas.createLanguage), adminController.createLanguage.bind(adminController));
router.put('/languages/:id', adminController.updateLanguage.bind(adminController));

// Translation key management
router.get('/translation-keys', adminController.getTranslationKeys.bind(adminController));
router.post('/translation-keys', validateRequest(schemas.createTranslationKey), adminController.createTranslationKey.bind(adminController));
router.put('/translation-keys/:id', adminController.updateTranslationKey.bind(adminController));
router.delete('/translation-keys/:id', adminController.deleteTranslationKey.bind(adminController));

// Translation management
router.get('/translations', adminController.getTranslations.bind(adminController));
router.get('/translations/all', adminController.getAllTranslations.bind(adminController));
router.post('/translations', adminController.createTranslation.bind(adminController));
router.put('/translations/:id', adminController.updateTranslationById.bind(adminController));
router.delete('/translations/:id', adminController.deleteTranslationById.bind(adminController));

// Legacy translation management (keeping for backward compatibility)
router.put('/translations/:keyId/:languageCode', validateRequest(schemas.updateTranslation), adminController.updateTranslation.bind(adminController));
router.delete('/translations/:keyId/:languageCode', adminController.deleteTranslation.bind(adminController));

// Export/Import
router.get('/translations/export', adminController.exportTranslations.bind(adminController));
router.post('/translations/import', adminController.importTranslations.bind(adminController));

export default router;
