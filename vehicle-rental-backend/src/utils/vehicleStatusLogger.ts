import { PrismaClient } from '@prisma/client';

interface StatusLogInput {
  vehicleId: string;
  status: string;
  changedBy: string;
  reason?: string;
}

export const logVehicleStatus = async (
  prisma: PrismaClient,
  data: StatusLogInput
): Promise<void> => {
  try {
    await prisma.vehicleStatusLog.create({
      data: {
        vehicleId: data.vehicleId,
        status: data.status,
        changedBy: data.changedBy,
        reason: data.reason
      }
    });
  } catch (err) {
    console.error("Failed to log vehicle status change:", err);
  }
};

export const getVehicleStatusHistory = async (
  prisma: PrismaClient,
  vehicleId: string
) => {
  return prisma.vehicleStatusLog.findMany({
    where: { vehicleId },
    include: {
      changer: { select: { name: true, role: true } }
    },
    orderBy: { createdAt : 'desc' }
  });
};
