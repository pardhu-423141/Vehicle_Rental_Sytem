import cron from 'node-cron';
import { db } from './db'; // Pointing to your db.ts in the same config folder

/**
 * TASK 1: Daily Legacy Cleanup
 * Runs every day at 12:00 AM.
 * Permanently deletes vehicle records that were soft-deleted more than 6 months ago.
 */
cron.schedule('0 0 * * *', async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const deleted = await db.vehicle.deleteMany({
      where: {
        deletedAt: {
          lte: sixMonthsAgo,
        },
      },
    });
    
    if (deleted.count > 0) {
      console.log(`[Cron] Permanently deleted ${deleted.count} vehicle records older than 6 months.`);
    }
  } catch (error) {
    console.error("[Cron] Daily Cleanup Error:", error);
  }
});

/**
 * TASK 2: Stale Booking Reaper
 * Runs every 15 minutes.
 * Cancels bookings that remained in 'PENDING' status for more than 30 minutes.
 * This releases locked vehicles back into the available pool.
 */
cron.schedule('*/15 * * * *', async () => {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

  try {
    const stale = await db.booking.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lte: thirtyMinsAgo },
      },
      data: { status: 'CANCELLED' },
    });

    if (stale.count > 0) {
      console.log(`[Cron] Auto-cancelled ${stale.count} stale pending bookings.`);
    }
  } catch (error) {
    console.error("[Cron] Stale Booking Reaper Error:", error);
  }
});

/**
 * TASK 3: Overdue Rental Monitor
 * Runs every hour.
 * Identifies 'ONGOING' rentals where the current time has passed the 'endDate'.
 */
cron.schedule('0 * * * *', async () => {
  const now = new Date();

  try {
    const overdue = await db.booking.findMany({
      where: {
        status: 'ONGOING',
        endDate: { lt: now },
      },
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { make: true, model: true, licensePlate: true } }
      }
    });

    if (overdue.length > 0) {
      console.warn(`[Alert] ${overdue.length} active rentals are currently OVERDUE.`);
      // Optional: Logic to send automated emails to users or admins would go here.
    }
  } catch (error) {
    console.error("[Cron] Overdue Check Error:", error);
  }
});