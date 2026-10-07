import { Router } from 'express';
import { LoyaltyController } from '../controllers/loyaltyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/my-ledger', requireAuth, LoyaltyController.getMyLedger);
router.get('/tiers', LoyaltyController.getMembershipTiers);

export default router;
