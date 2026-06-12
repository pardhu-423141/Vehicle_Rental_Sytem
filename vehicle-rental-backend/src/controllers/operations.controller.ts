import { Request, Response } from 'express';
import { PrismaClient, Role, BookingStatus } from '@prisma/client';
import { logVehicleStatus } from '../utils/vehicleStatusLogger';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

// 1. GET DAILY OPERATIONS QUEUE
export const getOperationsQueue = async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user?.id;

  try {
    const handovers = await prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        vehicle: { managerId: managerId }
      },
      include: { user: true, vehicle: true },
      orderBy: { startDate: 'asc' }
    });

    const returns = await prisma.booking.findMany({
      where: {
        status: BookingStatus.ONGOING,
        vehicle: { managerId: managerId }
      },
      include: { user: true, vehicle: true },
      orderBy: { endDate: 'asc' }
    });

    res.status(200).json({ handovers, returns });
  } catch (error) {
    console.error("Queue Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch operations queue" });
  }
};

// 2. PROCESS HANDOVER (Give keys to customer)
export const processHandover = async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  const managerId = req.user?.id as string;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const now = new Date();

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.ONGOING,
          handoverAt: now
        }
      }),
      prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'In Use' }
      })
    ]);

    await logVehicleStatus(prisma, {
      vehicleId: booking.vehicleId,
      status: 'In Use',
      changedBy: managerId,
      reason: `Keys handed over for booking ${bookingId}`
    });

    res.status(200).json({ message: "Handover processed successfully" });
  } catch (error) {
    console.error("Handover Error:", error);
    res.status(500).json({ error: "Failed to process handover" });
  }
};

// 3. PROCESS RETURN (Take keys back & Handle Issues)
export const processReturn = async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  const { condition, reason } = req.body;
  const managerId = req.user?.id as string;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const now = new Date();
    const newVehicleStatus = condition === 'good' ? 'Available' : 'Under Maintenance';

    const operations: any[] = [
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          returnAt: now
        }
      }),
      prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: newVehicleStatus }
      })
    ];

    if (condition === 'maintenance' && reason) {
      operations.push(
        prisma.maintenanceTask.create({
          data: {
            issue: reason,
            vehicleId: booking.vehicleId,
            status: 'Pending'
          }
        })
      );
    }

    await prisma.$transaction(operations);

    await logVehicleStatus(prisma, {
      vehicleId: booking.vehicleId,
      status: newVehicleStatus,
      changedBy: managerId,
      reason: condition === 'good'
        ? `Vehicle returned in good condition (booking ${bookingId})`
        : `Vehicle flagged for maintenance: ${reason}`
    });

    res.status(200).json({ message: "Return processed successfully" });
  } catch (error) {
    console.error("Return Process Error:", error);
    res.status(500).json({ error: "Failed to process return" });
  }
};

// 4. GET MAINTENANCE TASKS
export const getMaintenanceTasks = async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user?.id;

  try {
    const tasks = await prisma.maintenanceTask.findMany({
      where: { vehicle: { managerId: managerId } },
      include: { vehicle: true },
      orderBy: { reportedDate: 'desc' }
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Fetch Tasks Error:", error);
    res.status(500).json({ error: "Failed to fetch maintenance tasks" });
  }
};

// 5. UPDATE MAINTENANCE TASK STATUS
export const updateMaintenanceTask = async (req: AuthenticatedRequest, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const managerId = req.user?.id as string;

  try {
    const updateData: any = { status };
    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
    }

    const task = await prisma.maintenanceTask.update({
      where: { id: taskId },
      data: updateData
    });

    if (status === 'Resolved') {
      await prisma.vehicle.update({
        where: { id: task.vehicleId },
        data: { status: 'Available' }
      });

      await logVehicleStatus(prisma, {
        vehicleId: task.vehicleId,
        status: 'Available',
        changedBy: managerId,
        reason: `Maintenance task ${taskId} resolved`
      });
    }

    res.status(200).json({ message: `Task successfully updated to ${status}` });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ error: "Failed to update maintenance task" });
  }
};
