import { Router } from 'express';
import authRoutes from './auth';
import taskRoutes from './tasks';
import adminRoutes from './admin';
import translationRoutes from './translations';
import aiTranslationRoutes from './aiTranslation';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/admin', adminRoutes);
router.use('/translations', translationRoutes);
router.use('/ai-translations', aiTranslationRoutes);

export default router;
