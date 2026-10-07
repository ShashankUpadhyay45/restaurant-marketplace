import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/metrics', AdminController.getPlatformMetrics);
router.get('/restaurants', AdminController.getAllRestaurants);
router.patch('/restaurants/:id/verify', AdminController.verifyRestaurant);
router.patch('/restaurants/:id/commission', AdminController.updateCommission);
router.get('/users', AdminController.getUsers);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
