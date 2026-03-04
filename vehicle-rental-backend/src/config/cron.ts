import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This runs every day at 12:00 AM
cron.schedule('0 0 * * *', async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const deleted = await prisma.Vehicle.deleteMany({
      where: {
        deletedAt: {
          lte: sixMonthsAgo, // "Less than or equal to" 6 months ago
        },
      },
    });
    if (deleted.count > 0) {
      console.log(`Cron: Permanently deleted ${deleted.count} old vehicle records.`);
    }
  } catch (error) {
    console.error("Cron Cleanup Error:", error);
  }
});