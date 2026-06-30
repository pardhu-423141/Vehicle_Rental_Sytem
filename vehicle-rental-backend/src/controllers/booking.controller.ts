import { Response } from 'express';
import { db } from '../config/db';
import { notifyUser } from '../utils/socket';
import { calcDiscount } from './coupon.controller';
import { CouponType } from '@prisma/client';

const notifyManagerOfHandover = async (vehicleId: string, bookingId: string) => {
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      include: { manager: true }
    });
    if (vehicle?.managerId) {
      notifyUser(vehicle.managerId, 'handover:required', {
        type: 'handover',
        title: 'Handover Required',
        message: `Booking confirmed for ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}). Customer is expecting key handover.`,
        bookingId,
        vehicleId,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Notify manager error:', err);
  }
};

// ─── 1. CREATE BOOKING ────────────────────────────────────────────────────────
export const createBooking = async (req: any, res: Response) => {
  const { vehicleId, startDate, endDate, couponCode } = req.body;
  const userId = req.user?.id;

  try {
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId, deletedAt: null } });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found or unavailable.' });

    const overlapping = await db.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ONGOING'] },
        OR: [{ startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }]
      }
    });
    if (overlapping) return res.status(400).json({ message: 'Vehicle already booked for these dates.' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const baseCost = diffDays * vehicle.rentalRate;
    const taxes = Math.round(baseCost * 0.18);
    const grossTotal = baseCost + taxes;

    // ── Coupon validation ──
    let discount = 0;
    let appliedCouponId: string | null = null;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const coupon = await db.userCoupon.findFirst({
        where: {
          code: couponCode.trim().toUpperCase(),
          userId,
          isUsed: false,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
        }
      });

      if (coupon) {
        // Welcome coupon: only valid on first booking
        if (coupon.couponType === CouponType.WELCOME) {
          const priorBookings = await db.booking.count({
            where: { userId, status: { not: 'CANCELLED' } }
          });
          if (priorBookings > 0) {
            return res.status(400).json({
              message: 'Welcome coupon is only valid on your very first booking.'
            });
          }
        }

        if (coupon.minBookingAmount && grossTotal < coupon.minBookingAmount) {
          return res.status(400).json({
            message: `Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon.`
          });
        }

        discount = Math.round(calcDiscount(coupon, grossTotal));
        appliedCouponId = coupon.id;
        appliedCouponCode = coupon.code;
      }
    }

    const finalPrice = Math.max(0, grossTotal - discount);

    const booking = await db.booking.create({
      data: {
        userId,
        vehicleId,
        startDate: start,
        endDate: end,
        totalPrice: finalPrice,
        discount,
        couponId: appliedCouponId,
        couponCode: appliedCouponCode,
        // Payment-first flow: confirm only after Razorpay webhook success
        status: 'PENDING'
      }
    });

    // NOTE: Coupon usage + manager notification moved to Razorpay webhook (payment.controller.ts)

    res.status(201).json({ ...booking, discount, appliedCouponCode });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ message: 'Internal Server Error during booking.' });
  }
};

// ─── 2. GET USER BOOKINGS ─────────────────────────────────────────────────────
export const getUserBookings = async (req: any, res: Response) => {
  try {
    const bookings = await db.booking.findMany({
      where: { userId: req.user.id },
      include: { vehicle: true, review: true },
      orderBy: { startDate: 'desc' }
    });

    res.json(bookings.map(b => ({
      ...b,
      vehicle: {
        id: b.vehicle.id,
        name: `${b.vehicle.make} ${b.vehicle.model}`,
        type: b.vehicle.type,
        image: b.vehicle.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'
      }
    })));
  } catch {
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
};

// ─── 3. CANCEL BOOKING ────────────────────────────────────────────────────────
export const cancelBooking = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking || booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking.' });
    }

    // Refund coupon on cancellation
    if (booking.couponId) {
      await db.userCoupon.update({
        where: { id: booking.couponId },
        data: { isUsed: false, usedAt: null }
      }).catch(() => {});
    }

    const updated = await db.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
    res.json({ message: 'Booking cancelled successfully', updated });
  } catch {
    res.status(500).json({ message: 'Cancellation failed.' });
  }
};

// ─── 4. GET BOOKING HISTORY ───────────────────────────────────────────────────
export const getBookingHistory = async (req: any, res: Response) => {
  try {
    const history = await db.booking.findMany({
      where: { userId: req.user.id },
      include: { vehicle: true, review: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history.map(b => ({
      ...b,
      vehicle: {
        id: b.vehicle.id,
        name: `${b.vehicle.make} ${b.vehicle.model}`,
        type: b.vehicle.type,
        image: b.vehicle.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'
      }
    })));
  } catch {
    res.status(500).json({ message: 'Failed to fetch booking history' });
  }
};
