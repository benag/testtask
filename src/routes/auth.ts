import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validateRequest(schemas.register), authController.register.bind(authController));
router.post('/login', validateRequest(schemas.login), authController.login.bind(authController));

// Protected routes
router.get('/me', authenticateToken, authController.me.bind(authController));
router.put('/language', authenticateToken, authController.updateLanguage.bind(authController));

export default router;
