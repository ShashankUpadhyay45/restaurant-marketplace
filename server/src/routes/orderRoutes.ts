import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/calculate', OrderController.calculate);
router.post('/', requireAuth, OrderController.createOrder);
router.get('/my-orders', requireAuth, OrderController.getMyOrders);
router.get('/:id', requireAuth, OrderController.getOrderById);
router.post('/:id/cancel', requireAuth, OrderController.cancelOrder);

export default router;
