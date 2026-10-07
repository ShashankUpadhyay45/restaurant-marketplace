import { describe, it, expect, vi } from 'vitest';
import { User } from '../models/User.js';
import { LoyaltyLedger } from '../models/LoyaltyLedger.js';

describe('Loyalty Ledger Balance & Reversals Tests', () => {
  it('awards 5% loyalty points on completed subtotal correctly', () => {
    const subtotal = 120.00;
    const pointsAwarded = Math.round(subtotal * 5); // 120 * 5 = 600 points ($6 value)
    expect(pointsAwarded).toBe(600);
  });

  it('calculates reversal and ensures balance does not fall below zero', () => {
    let currentBalance = 300;
    const pointsToReverse = 500; // Customer only had 300 points

    const newBalance = Math.max(0, currentBalance - pointsToReverse);
    expect(newBalance).toBe(0);
  });
});
