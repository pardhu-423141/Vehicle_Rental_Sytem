import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '../config/db';
import type { PaymentStatus, BookingStatus } from '@prisma/client';

const razorpay = (() => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
})();

const getAmountInPaise = (amountInRupees: number) => {
  return Math.round(amountInRupees * 100);
};

export const createRazorpayOrder = async (req: any, res: Response) => {
  try {
    const { bookingId, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!bookingId || amount === undefined) {
      return res.status(400).json({ message: 'bookingId and amount are required' });
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Razorpay minimum amount is 1 INR. If a coupon makes the cart ₹0, skip Razorpay!
    if (amount < 1) {
      return res.status(400).json({ message: 'Amount must be at least ₹1 to process via Razorpay.' });
    }

    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay keys not configured on server' });
    }

    const amountPaise = getAmountInPaise(amount);

    // FIX 1 & 2: Ensure notes are strings and receipt is max 40 chars
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${bookingId}`.substring(0, 40), 
      notes: {
        bookingId: String(bookingId) 
      }
    });

    // FIX 3: Use upsert so if a user retries a payment, it safely updates the existing DB row instead of crashing
    await db.payment.upsert({
      where: { bookingId: booking.id },
      update: { 
        amount, 
        status: 'PENDING', 
        transactionId: null 
      },
      create: {
        bookingId: booking.id,
        amount,
        paymentMethod: 'RAZORPAY',
        status: 'PENDING',
        transactionId: null
      }
    });

    return res.status(201).json({
      order_id: order.id,
      amount: amountPaise,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err: any) {
    console.error('createRazorpayOrder error:', err);
    return res.status(500).json({ message: err.message || 'Server error while creating order.' });
  }
};

export const razorpayWebhook = async (req: any, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ message: 'RAZORPAY_WEBHOOK_SECRET not set' });
    }

    const signature = req.headers['x-razorpay-signature'];
    
    // FIX 4: Use req.rawBody if available. JSON.stringify(req.body) drops whitespaces and fails Razorpay's hash check.
    const payloadToVerify = req.rawBody || JSON.stringify(req.body); 

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadToVerify)
      .digest('hex');

    if (String(signature) !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventType = event?.event;

    const paymentEntity = event?.payload?.payment?.entity;
    const transactionId = paymentEntity?.id;
    const bookingId = paymentEntity?.notes?.bookingId;

    if (!bookingId) {
      return res.status(200).json({ received: true });
    }

    if (eventType === 'payment.captured') {
      await db.payment.update({
        where: { bookingId },
        data: { status: 'SUCCESS', transactionId }
      });

      await db.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' as BookingStatus }
      });

      const booking = await db.booking.findUnique({ where: { id: bookingId } });
      if (booking?.couponId) {
        await db.userCoupon.update({
          where: { id: booking.couponId },
          data: { isUsed: true, usedAt: new Date() }
        }).catch(() => {});
      }

    } else if (eventType === 'payment.failed') {
      await db.payment.update({
        where: { bookingId },
        data: { status: 'FAILED', transactionId: transactionId || null }
      });

      await db.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' as BookingStatus }
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('razorpayWebhook error:', err);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};