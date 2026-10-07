import { describe, it, expect, vi } from 'vitest';
import { ReservationEngine } from '../services/reservationEngine.js';
import { Table } from '../models/Table.js';
import { Reservation } from '../models/Reservation.js';

describe('ReservationEngine Concurrency & Availability Tests', () => {
  it('returns available tables when capacity matches and table is not reserved', async () => {
    const restaurantId = '507f1f77bcf86cd799439011';
    const mockTables = [
      { _id: 'tbl_1', tableNumber: 'Table 1', capacity: 2, minPartySize: 1, isActive: true },
      { _id: 'tbl_2', tableNumber: 'Table 2', capacity: 4, minPartySize: 2, isActive: true }
    ];

    vi.spyOn(Table, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockTables)
    } as any);

    // No existing reservations
    vi.spyOn(Reservation, 'find').mockResolvedValue([]);

    const result = await ReservationEngine.getAvailableTables(
      restaurantId,
      '2026-10-15',
      '19:30',
      2
    );

    expect(result.isAvailable).toBe(true);
    expect(result.availableTables.length).toBe(2);
  });

  it('filters out already booked tables for the given slot preventing double booking', async () => {
    const restaurantId = '507f1f77bcf86cd799439011';
    const mockTables = [
      { _id: 'tbl_1', tableNumber: 'Table 1', capacity: 2, minPartySize: 1, isActive: true },
      { _id: 'tbl_2', tableNumber: 'Table 2', capacity: 2, minPartySize: 1, isActive: true }
    ];

    vi.spyOn(Table, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockTables)
    } as any);

    // Table 1 is already reserved!
    vi.spyOn(Reservation, 'find').mockResolvedValue([
      { tableId: 'tbl_1', status: 'CONFIRMED' }
    ] as any);

    const result = await ReservationEngine.getAvailableTables(
      restaurantId,
      '2026-10-15',
      '19:30',
      2
    );

    expect(result.isAvailable).toBe(true);
    expect(result.availableTables.length).toBe(1);
    expect(result.availableTables[0]._id).toBe('tbl_2');
  });

  it('rejects booking when all candidate tables are booked', async () => {
    const restaurantId = '507f1f77bcf86cd799439011';
    const mockTables = [
      { _id: 'tbl_1', tableNumber: 'Table 1', capacity: 2, minPartySize: 1, isActive: true }
    ];

    vi.spyOn(Table, 'find').mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockTables)
    } as any);

    vi.spyOn(Reservation, 'find').mockResolvedValue([
      { tableId: 'tbl_1', status: 'CONFIRMED' }
    ] as any);

    const result = await ReservationEngine.getAvailableTables(
      restaurantId,
      '2026-10-15',
      '19:30',
      2
    );

    expect(result.isAvailable).toBe(false);
    expect(result.availableTables.length).toBe(0);
  });
});
