import { Request, Response } from 'express';
import { Role, VehicleType } from '@prisma/client';
import { db } from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

const getSeatingCapacity = (type: VehicleType): number => {
  switch (type) {
    case 'TWO_WHEELER': return 2;
    case 'FOUR_SEATER': return 4;
    case 'FIVE_SEATER': return 5;
    case 'SEVEN_SEATER': return 7;
    case 'LUXURY': return 4;
    default: return 5;
  }
};

// 1. ADD VEHICLE
export const addVehicle = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      make, model, year, licensePlate, color,
      fuelType, transmission, rentalRate, imageUrl, type, managerId
    } = req.body;

    const existingVehicle = await db.vehicle.findUnique({ where: { licensePlate } });

    if (existingVehicle) {
      if (existingVehicle.status === 'Unavailable' || existingVehicle.deletedAt !== null) {
        return res.status(409).json({
          error: "Vehicle with this license plate already exists in history. Do you want to restore it?",
          needsRestoration: true,
          existingVehicleId: existingVehicle.id
        });
      }
      return res.status(400).json({ error: "A vehicle with this license plate already exists." });
    }

    const vehicleType = type as VehicleType;
    const seatingCapacity = getSeatingCapacity(vehicleType);

    const newVehicle = await db.vehicle.create({
      data: {
        make,
        model,
        year: Number(year),
        licensePlate,
        color,
        fuelType,
        transmission,
        rentalRate: parseFloat(rentalRate.toString()),
        imageUrl,
        type: vehicleType,
        seatingCapacity,
        status: 'Available',
        managerId: managerId || null
      },
    });

    res.status(201).json(newVehicle);
  } catch (error: any) {
    console.error("Add vehicle error:", error);
    res.status(500).json({ error: "Could not add vehicle. Ensure data is valid." });
  }
};

// 2. UPDATE VEHICLE
export const updateVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    if (userRole === 'VEHICLE_MANAGER') {
      const vehicle = await db.vehicle.findUnique({ where: { id } });
      if (!vehicle || vehicle.managerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You do not manage this vehicle." });
      }
      delete updateData.managerId;
    }

    if (updateData.status === 'Available') {
      updateData.deletedAt = null;
    }

    const updatedVehicle = await db.vehicle.update({
      where: { id },
      data: updateData,
    });

    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ error: "Could not update vehicle." });
  }
};

// 3. REMOVE VEHICLE (Soft Delete)
export const removeVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await db.vehicle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'Unavailable'
      },
    });
    res.status(200).json({ message: "Vehicle moved to history." });
  } catch (error: any) {
    res.status(500).json({ error: "Removal failed." });
  }
};

// 4. GET VEHICLES
export const getVehicles = async (req: AuthenticatedRequest, res: Response) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    let whereClause: any = {};

    if (userRole === 'ADMIN') {
      whereClause = {
        OR: [
          { deletedAt: null },
          { deletedAt: { gte: sixMonthsAgo } }
        ]
      };
    } else if (userRole === 'VEHICLE_MANAGER') {
      whereClause = {
        deletedAt: null,
        managerId: userId
      };
    } else {
      whereClause = {
        deletedAt: null,
        status: 'Available'
      };
    }

    const vehicles = await db.vehicle.findMany({
      where: whereClause,
      include: {
        manager: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(vehicles);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch vehicles." });
  }
};

// 5. RESTORE VEHICLE
export const restoreVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const restoredVehicle = await db.vehicle.update({
      where: { id },
      data: {
        status: 'Available',
        deletedAt: null
      }
    });
    res.status(200).json({ message: "Vehicle successfully restored to the active fleet.", vehicle: restoredVehicle });
  } catch (error: any) {
    console.error("Restore error:", error);
    res.status(500).json({ error: "Failed to restore the vehicle." });
  }
};

// 6. GET VEHICLE BY ID
export const getVehicleById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'ADMIN';

  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            endDate: { gte: new Date() },
            status: { not: 'CANCELLED' }
          },
          select: {
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    if (!isAdmin) {
      if (vehicle.deletedAt !== null || vehicle.status !== 'Available') {
        return res.status(404).json({ error: "Vehicle not found or not available." });
      }
    }

    res.status(200).json(vehicle);
  } catch (error) {
    console.error("Get vehicle by id error:", error);
    res.status(500).json({ error: "Failed to fetch vehicle." });
  }
};

// 7. GET VEHICLE HISTORY
export const getVehicleHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const bookings = await db.booking.findMany({
      where: { vehicleId: id },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const history = bookings.map((b: any) => ({
      id: b.id,
      type: 'BOOKING',
      date: new Date(b.createdAt).toLocaleDateString(),
      desc: `Rented by ${b.user?.name || 'Unknown User'}`,
      duration: 'Standard',
      status: b.status || 'Completed'
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ error: "Failed to fetch vehicle history." });
  }
};
