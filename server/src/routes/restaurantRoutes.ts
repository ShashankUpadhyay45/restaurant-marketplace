import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurantController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', RestaurantController.getAll);
router.get('/nearby', RestaurantController.getNearby);
router.get('/:id', RestaurantController.getById);
router.post('/:id/reviews', requireAuth, RestaurantController.addReview);

export default router;
