import { Request, Response } from 'express';
import { PrismaClient, Role, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

// Helper to map Type to Seating Capacity automatically
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

// 1. ADD VEHICLE (Updated to check for soft-deleted vehicles)
export const addVehicle = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { 
      make, model, year, licensePlate, color, 
      fuelType, transmission, rentalRate, imageUrl, type 
    } = req.body;

    // Check if the license plate already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate }
    });

    if (existingVehicle) {
      // If it exists but is soft-deleted, send a specific 409 status 
      // so the frontend knows to ask the user to restore it
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

    const newVehicle = await prisma.vehicle.create({
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
        seatingCapacity: seatingCapacity
      },
    });

    res.status(201).json(newVehicle);
  } catch (error: any) {
    console.error("Add vehicle error:", error);
    res.status(500).json({ error: "Could not add vehicle. Ensure data is valid." });
  }
};

// 2. UPDATE VEHICLE
export const updateVehicle = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // If status is coming back as Available, we ensure deletedAt is cleared
    if (updateData.status === 'Available') {
      updateData.deletedAt = null;
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Could not update vehicle. Ensure data types are correct." });
  }
};

// 3. REMOVE VEHICLE (Soft Delete)
export const removeVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.vehicle.update({
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
  const isAdmin = req.user?.role === 'ADMIN';
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: isAdmin 
        ? {
            OR: [
              { deletedAt: null },
              { deletedAt: { gte: sixMonthsAgo } }
            ]
          } 
        : { 
            deletedAt: null,
            status: 'Available' 
          },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(vehicles);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch vehicles." });
  }
};

// 5. RESTORE VEHICLE (NEW FUNCTION)
export const restoreVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const restoredVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        status: 'Available',
        deletedAt: null // Explicitly clear the soft-delete timestamp
      }
    });
    res.status(200).json({ message: "Vehicle successfully restored to the active fleet.", vehicle: restoredVehicle });
  } catch (error: any) {
    console.error("Restore error:", error);
    res.status(500).json({ error: "Failed to restore the vehicle." });
  }
};

// Add this function to your existing controller file (where addVehicle, getVehicles, etc. are defined)

export const getVehicleById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'ADMIN';

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    // Non‑admins can only see active, available vehicles
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