import { Request, Response } from 'express';
import { Role, CouponType, DiscountType } from '@prisma/client';
import { db } from '../config/db';
import crypto from 'crypto';

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: Role };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateCode = (prefix: string): string =>
  `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

/** Compute display status from DB fields */
export const getCouponStatus = (c: { isUsed: boolean; expiresAt: Date | null }): 'Active' | 'Used' | 'Expired' => {
  if (c.isUsed) return 'Used';
  if (c.expiresAt && c.expiresAt < new Date()) return 'Expired';
  return 'Active';
};

/** Calculate discount amount for a given booking total */
export const calcDiscount = (coupon: {
  discountType: string; discountValue: number; maxDiscount: number | null;
}, amount: number): number => {
  if (coupon.discountType === 'FIXED') {
    return Math.min(coupon.discountValue, amount);
  }
  const raw = (amount * coupon.discountValue) / 100;
  return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
};

// ─── Issue Welcome Coupon (called from auth controller after OTP verify) ──────
export const issueWelcomeCoupon = async (userId: string): Promise<void> => {
  try {
    const already = await db.userCoupon.findFirst({ where: { userId, couponType: CouponType.WELCOME } });
    if (already) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.userCoupon.create({
      data: {
        userId,
        code: generateCode('WELCOME'),
        couponType: CouponType.WELCOME,
        discountType: DiscountType.PERCENT,
        discountValue: 10,
        maxDiscount: null,
        minBookingAmount: null,
        conditions: 'First booking only. One-time use. Valid for 30 days from registration.',
        expiresAt
      }
    });
  } catch (err) {
    console.error('Failed to issue welcome coupon:', err);
  }
};

// ─── Issue Milestone Coupon (called from operations controller on COMPLETED) ──
export const issueMilestoneCoupon = async (userId: string, completedCount: number): Promise<void> => {
  try {
    if (completedCount % 5 !== 0 || completedCount === 0) return;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await db.userCoupon.create({
      data: {
        userId,
        code: generateCode('RIDE'),
        couponType: CouponType.MILESTONE,
        discountType: DiscountType.PERCENT,
        discountValue: 10,
        maxDiscount: 200,
        minBookingAmount: null,
        conditions: `Earned at ${completedCount} completed bookings. 10% off up to ₹200. Valid for 1 month.`,
        expiresAt
      }
    });
  } catch (err) {
    console.error('Failed to issue milestone coupon:', err);
  }
};

// ─── GET MY COUPONS (all with computed status) ────────────────────────────────
export const getMyCoupons = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const coupons = await db.userCoupon.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = coupons.map(c => ({
      ...c,
      status: getCouponStatus(c)
    }));

    res.json(enriched);
  } catch {
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
};

// ─── GET ACTIVE COUPONS (only Active ones for dashboard display) ──────────────
export const getActiveCoupons = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const coupons = await db.userCoupon.findMany({
      where: {
        userId,
        isUsed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
      },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = coupons.map(c => ({ ...c, status: 'Active' as const }));
    res.json(enriched);
  } catch {
    res.status(500).json({ message: 'Failed to fetch active coupons' });
  }
};

// ─── GET ELIGIBLE COUPONS FOR A BOOKING AMOUNT ───────────────────────────────
export const getEligibleCoupons = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const amount = parseFloat(req.query.amount as string) || 0;

  try {
    // Count prior non-cancelled bookings to check welcome eligibility
    const priorBookings = await db.booking.count({
      where: { userId, status: { not: 'CANCELLED' } }
    });

    const coupons = await db.userCoupon.findMany({
      where: {
        userId,
        isUsed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
      }
    });

    const eligible = coupons
      .filter(c => {
        // Welcome coupon only valid for first booking
        if (c.couponType === CouponType.WELCOME && priorBookings > 0) return false;
        // minBookingAmount check
        if (c.minBookingAmount && amount < c.minBookingAmount) return false;
        return true;
      })
      .map(c => ({
        ...c,
        status: 'Active' as const,
        savings: Math.round(calcDiscount(c, amount))
      }));

    res.json(eligible);
  } catch {
    res.status(500).json({ message: 'Failed to fetch eligible coupons' });
  }
};

// ─── VALIDATE / PREVIEW A COUPON CODE ────────────────────────────────────────
export const validateCoupon = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { code, amount } = req.body;

  try {
    const coupon = await db.userCoupon.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        userId,
        isUsed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }]
      }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid, already used, or expired coupon code.' });
    }

    // Welcome coupon → only on first booking
    if (coupon.couponType === CouponType.WELCOME) {
      const priorBookings = await db.booking.count({
        where: { userId, status: { not: 'CANCELLED' } }
      });
      if (priorBookings > 0) {
        return res.status(400).json({
          message: 'This welcome coupon is only valid on your first booking.'
        });
      }
    }

    // minBookingAmount check
    if (coupon.minBookingAmount && amount < coupon.minBookingAmount) {
      return res.status(400).json({
        message: `Minimum booking amount of ₹${coupon.minBookingAmount} required.`
      });
    }

    const discount = Math.round(calcDiscount(coupon, amount));

    res.json({
      valid: true,
      coupon: { ...coupon, status: 'Active' },
      discount,
      finalAmount: Math.round(amount - discount)
    });
  } catch {
    res.status(500).json({ message: 'Validation failed' });
  }
};
