import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public/Demo endpoints
router.get('/preview/:type', NotificationController.getPreview);
router.get('/recent', NotificationController.getRecentLogs);

// Authenticated actions
router.post('/resend', requireAuth, NotificationController.resendConfirmation);

export default router;
