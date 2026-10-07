import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { LoyaltyLedger } from '../models/LoyaltyLedger.js';
import { User } from '../models/User.js';

export class LoyaltyController {
  public static async getMyLedger(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const user = await User.findById(req.user._id);
      const ledger = await LoyaltyLedger.find({ userId: req.user._id }).sort({ createdAt: -1 });

      const totalEarned = ledger
        .filter(l => l.transactionType === 'EARNED' || l.transactionType === 'BONUS')
        .reduce((sum, l) => sum + l.points, 0);

      const totalRedeemed = ledger
        .filter(l => l.transactionType === 'REDEEMED')
        .reduce((sum, l) => sum + Math.abs(l.points), 0);

      res.json({
        success: true,
        currentBalance: user?.loyaltyPointsBalance || 0,
        membershipTier: user?.membershipTier || 'STANDARD',
        stats: {
          totalEarned,
          totalRedeemed
        },
        transactions: ledger
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch loyalty ledger.' });
    }
  }

  public static async getMembershipTiers(req: AuthRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      tiers: [
        {
          tier: 'STANDARD',
          minSpend: 0,
          perks: ['Standard 5% points on all delivery and dining', 'Itemized receipt tracking', 'Email order updates']
        },
        {
          tier: 'BRONZE',
          minSpend: 150,
          perks: ['6% points earn rate', 'Priority table holds for 20 mins', 'Special birthday dessert voucher']
        },
        {
          tier: 'SILVER',
          minSpend: 500,
          perks: ['8% points earn rate', 'Free delivery on orders over $25', 'VIP booth booking access', 'Direct chef compliments']
        },
        {
          tier: 'GOLD',
          minSpend: 1200,
          perks: ['10% points earn rate', 'Unlimited free delivery', 'Guaranteed peak table reservation slots', 'Direct concierge line']
        }
      ]
    });
  }
}
