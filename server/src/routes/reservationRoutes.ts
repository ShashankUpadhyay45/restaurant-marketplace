import { Router } from 'express';
import { ReservationController } from '../controllers/reservationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/check', ReservationController.checkAvailability);
router.post('/', requireAuth, ReservationController.createReservation);
router.get('/my-reservations', requireAuth, ReservationController.getMyReservations);
router.post('/:id/cancel', requireAuth, ReservationController.cancelReservation);

export default router;
