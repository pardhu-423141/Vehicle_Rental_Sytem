import { Request, Response } from 'express';
import { PrismaClient, Role, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ FIX 1: Added email and exact Role type to match your global types
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
        status: BookingStatus.PENDING, // Using the strict Prisma Enum
        vehicle: { managerId: managerId } 
      },
      include: { user: true, vehicle: true },
      orderBy: { startDate: 'asc' }
    });

    const returns = await prisma.booking.findMany({
      where: { 
        // ✅ FIX 2: Changed to ACTIVE (Update this if your schema uses a different word like ONGOING)
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

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.ONGOING } // ✅ FIX 2 applied here
      }),
      prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'In Use' }
      })
    ]);

    res.status(200).json({ message: "Handover processed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to process handover" });
  }
};

// 3. PROCESS RETURN (Take keys back & Handle Issues)
export const processReturn = async (req: AuthenticatedRequest, res: Response) => {
  const { bookingId } = req.params;
  const { condition, reason } = req.body; // ⚡ Added 'reason'

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const newVehicleStatus = condition === 'good' ? 'Available' : 'Under Maintenance';

    // We will build an array of database operations to execute in a transaction
    const operations: any[] = [
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED }
      }),
      prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: newVehicleStatus }
      })
    ];

    // ⚡ If there's an issue, create a Maintenance Task
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
      where: { vehicle: { managerId: managerId } }, // Only fetch tasks for cars this manager owns
      include: { vehicle: true }, // Pull in the car details (Make, Model, Plate)
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
  const { status } = req.body; // 'In Progress' or 'Resolved'

  try {
    // Update the task itself
    const task = await prisma.maintenanceTask.update({
      where: { id: taskId },
      data: { status }
    });

    // ⚡ If the mechanic marked it resolved, put the car back in the active fleet!
    if (status === 'Resolved') {
      await prisma.vehicle.update({
        where: { id: task.vehicleId },
        data: { status: 'Available' }
      });
    }

    res.status(200).json({ message: `Task successfully updated to ${status}` });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ error: "Failed to update maintenance task" });
  }
};