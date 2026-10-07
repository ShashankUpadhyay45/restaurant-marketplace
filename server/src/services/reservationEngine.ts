import { Table, ITable } from '../models/Table.js';
import { Reservation, IReservation } from '../models/Reservation.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import mongoose from 'mongoose';

export interface CheckAvailabilityResult {
  isAvailable: boolean;
  availableTables: ITable[];
  message?: string;
}

export class ReservationEngine {
  /**
   * Evaluates available tables for a restaurant at a specific date, time, and party size
   */
  public static async getAvailableTables(
    restaurantId: string,
    reservationDate: string, // YYYY-MM-DD
    timeSlot: string,        // e.g. "19:30"
    guestCount: number
  ): Promise<CheckAvailabilityResult> {
    // 1. Find all active tables at the restaurant capable of seating this party
    const candidateTables = await Table.find({
      restaurantId,
      isActive: true,
      capacity: { $gte: guestCount },
      minPartySize: { $lte: guestCount }
    }).sort({ capacity: 1 }); // Prefer smallest table that comfortably fits

    if (candidateTables.length === 0) {
      return {
        isAvailable: false,
        availableTables: [],
        message: `No tables configured for party size of ${guestCount}.`
      };
    }

    // 2. Find all existing active reservations on that date and time slot
    const existingReservations = await Reservation.find({
      restaurantId,
      reservationDate,
      timeSlot,
      status: { $in: ['PENDING', 'CONFIRMED', 'SEATED'] }
    });

    const bookedTableIds = new Set(
      existingReservations.map(r => r.tableId.toString())
    );

    // 3. Filter candidate tables that are not booked
    const freeTables = candidateTables.filter(
      table => !bookedTableIds.has(table._id.toString())
    );

    return {
      isAvailable: freeTables.length > 0,
      availableTables: freeTables,
      message: freeTables.length > 0
        ? `${freeTables.length} tables available for this time slot.`
        : 'All suitable tables are booked for this time slot. Please select another time or join the waitlist.'
    };
  }

  /**
   * Atomically locks and books a table
   */
  public static async bookTableAtomic(
    restaurantId: string,
    customerId: string,
    reservationDate: string,
    timeSlot: string,
    guestCount: number,
    preferredTableId?: string,
    specialRequests?: string
  ): Promise<{ reservation: IReservation; qrCodeDataUrl: string }> {
    // Check available tables
    const check = await this.getAvailableTables(restaurantId, reservationDate, timeSlot, guestCount);
    if (!check.isAvailable || check.availableTables.length === 0) {
      throw new Error('Selected time slot or table is no longer available. Please select another time.');
    }

    let selectedTable = check.availableTables[0];
    if (preferredTableId) {
      const match = check.availableTables.find(t => t._id.toString() === preferredTableId);
      if (match) {
        selectedTable = match;
      }
    }

    // Atomic double-booking check right before saving
    const existingConflict = await Reservation.findOne({
      restaurantId,
      tableId: selectedTable._id,
      reservationDate,
      timeSlot,
      status: { $in: ['PENDING', 'CONFIRMED', 'SEATED'] }
    });

    if (existingConflict) {
      throw new Error('Collision detected: Table was just reserved by another guest. Please try another slot.');
    }

    // Generate unique verification token
    const tokenPayload = `GF-RES-${restaurantId}-${selectedTable._id}-${reservationDate}-${timeSlot}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrCodeToken = tokenPayload;

    // Generate QR code data URL for immediate ticket rendering
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeToken, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1A365D',
        light: '#FFFFFF'
      }
    });

    const reservation = new Reservation({
      restaurantId,
      customerId,
      tableId: selectedTable._id,
      guestCount,
      reservationDate,
      timeSlot,
      durationMinutes: 90,
      status: 'CONFIRMED',
      depositAmount: 0,
      qrCodeToken,
      specialRequests
    });

    await reservation.save();

    return { reservation, qrCodeDataUrl };
  }
}
