import { Router } from 'express';
import { OwnerController } from '../controllers/ownerController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all owner routes
router.use(requireAuth);
router.use(requireRole('restaurant_owner', 'admin'));

router.get('/metrics', OwnerController.getDashboardMetrics);
router.get('/orders', OwnerController.getOrders);
router.patch('/orders/:id/status', OwnerController.updateOrderStatus);

router.get('/reservations', OwnerController.getReservations);
router.patch('/reservations/:id/status', OwnerController.updateReservationStatus);

router.get('/menu', OwnerController.getMenuItems);
router.post('/menu', OwnerController.createMenuItem);
router.patch('/menu/:id/toggle-stock', OwnerController.toggleStock);

router.get('/tables', OwnerController.getTables);
router.post('/tables', OwnerController.createTable);

router.post('/ai/query', OwnerController.askAI);

export default router;
