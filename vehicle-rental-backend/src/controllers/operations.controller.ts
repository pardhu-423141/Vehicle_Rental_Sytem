import { Request, Response } from 'express';
import { Role, BookingStatus } from '@prisma/client';
import { db } from '../config/db';
import { logVehicleStatus } from '../utils/vehicleStatusLogger';
import { notifyUser } from '../utils/socket';
import { issueMilestoneCoupon } from './coupon.controller';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: Role };
}

// 1. GET DAILY OPERATIONS QUEUE
export const getOperationsQueue = async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user?.id;
  try {
    const [handovers, returns] = await Promise.all([
      db.booking.findMany({
        where: { status: BookingStatus.CONFIRMED, vehicle: { managerId } },
        include: { user: true, vehicle: true },
        orderBy: { startDate: 'asc' }
      }),
      db.booking.findMany({
        where: { status: BookingStatus.ONGOING, vehicle: { managerId } },
        include: { user: true, vehicle: true },
        orderBy: { endDate: 'asc' }
      })
    ]);
    res.status(200).json({ handovers, returns });
  } catch (error) {
    console.error('Queue Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch operations queue' });
  }
};

// 2. PROCESS HANDOVER
export const processHandover = async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  const managerId = req.user?.id as string;
  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await db.$transaction([
      db.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.ONGOING, handoverAt: new Date() } }),
      db.vehicle.update({ where: { id: booking.vehicleId }, data: { status: 'In Use' } })
    ]);

    await logVehicleStatus(db, {
      vehicleId: booking.vehicleId, status: 'In Use', changedBy: managerId,
      reason: `Keys handed over for booking ${bookingId}`
    });

    res.status(200).json({ message: 'Handover processed successfully' });
  } catch (error) {
    console.error('Handover Error:', error);
    res.status(500).json({ error: 'Failed to process handover' });
  }
};

// 3. PROCESS RETURN — issues milestone coupon every 5 completed bookings
export const processReturn = async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  const { condition, reason } = req.body;
  const managerId = req.user?.id as string;
  try {
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const newVehicleStatus = condition === 'good' ? 'Available' : 'Under Maintenance';
    const ops: any[] = [
      db.booking.update({ where: { id: bookingId }, data: { status: BookingStatus.COMPLETED, returnAt: new Date() } }),
      db.vehicle.update({ where: { id: booking.vehicleId }, data: { status: newVehicleStatus } })
    ];
    if (condition !== 'good' && reason) {
      ops.push(db.maintenanceTask.create({ data: { issue: reason, vehicleId: booking.vehicleId, status: 'Pending' } }));
    }
    await db.$transaction(ops);

    await logVehicleStatus(db, {
      vehicleId: booking.vehicleId, status: newVehicleStatus, changedBy: managerId,
      reason: condition === 'good'
        ? `Returned in good condition (booking ${bookingId})`
        : `Flagged for maintenance: ${reason}`
    });

    // ── Check milestone coupon ──
    const completedCount = await db.booking.count({
      where: { userId: booking.userId, status: BookingStatus.COMPLETED }
    });
    // issueMilestoneCoupon internally checks if completedCount is a multiple of 5
    await issueMilestoneCoupon(booking.userId, completedCount);

    // ── Expire unused Welcome coupons once first booking completes without using it ──
    if (completedCount === 1) {
      await db.userCoupon.updateMany({
        where: {
          userId: booking.userId,
          couponType: 'WELCOME',
          isUsed: false
        },
        data: { expiresAt: new Date() } // expire immediately
      });
    }

    // Notify user of milestone coupon (if earned)
    if (completedCount % 5 === 0 && completedCount > 0) {
      notifyUser(booking.userId, 'coupon:earned', {
        type: 'info',
        title: '🎉 You earned a reward coupon!',
        message: `Congratulations on ${completedCount} completed bookings! A 10% off coupon has been added to your account.`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({ message: 'Return processed successfully' });
  } catch (error) {
    console.error('Return Error:', error);
    res.status(500).json({ error: 'Failed to process return' });
  }
};

// 4. GET MAINTENANCE TASKS
export const getMaintenanceTasks = async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user?.id;
  try {
    const tasks = await db.maintenanceTask.findMany({
      where: { vehicle: { managerId } },
      include: { vehicle: true },
      orderBy: { reportedDate: 'desc' }
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance tasks' });
  }
};

// 5. UPDATE MAINTENANCE TASK
export const updateMaintenanceTask = async (req: AuthenticatedRequest, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const managerId = req.user?.id as string;
  try {
    const updateData: any = { status };
    if (status === 'Resolved') updateData.resolvedAt = new Date();

    const task = await db.maintenanceTask.update({ where: { id: taskId }, data: updateData });

    if (status === 'Resolved') {
      await db.vehicle.update({ where: { id: task.vehicleId }, data: { status: 'Available' } });
      await logVehicleStatus(db, {
        vehicleId: task.vehicleId, status: 'Available', changedBy: managerId,
        reason: `Maintenance task ${taskId} resolved`
      });
    }

    res.status(200).json({ message: `Task updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update maintenance task' });
  }
};
