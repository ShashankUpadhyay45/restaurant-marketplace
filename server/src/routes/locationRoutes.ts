import { Router } from 'express';
import { LocationController } from '../controllers/locationController.js';

const router = Router();

router.get('/cities', LocationController.getCities);
router.get('/search', LocationController.search);
router.get('/reverse-geocode', LocationController.reverseGeocode);
router.get('/closest', LocationController.getClosest);

export default router;
