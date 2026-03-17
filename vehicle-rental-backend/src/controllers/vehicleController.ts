import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { db } from '../config/db'; // Import the shared instance

// Extend Request type to include the user object from your auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

// 1. ADD VEHICLE (Admin/Vehicle Manager Only)
export const addVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      make, model, year, licensePlate, color, 
      fuelType, transmission, rentalRate, imageUrl 
    } = req.body;

    // Use 'db' instead of 'prisma'
    const newVehicle = await db.vehicle.create({
      data: {
        make,
        model,
        year: Number(year),
        licensePlate,
        color,
        fuelType,
        transmission,
        rentalRate: parseFloat(rentalRate),
        imageUrl,
      },
    });

    res.status(201).json(newVehicle);
  } catch (error: any) {
    console.error("Add vehicle error:", error);
    res.status(500).json({ error: "Could not add vehicle. Check if License Plate is unique." });
  }
};

// 2. UPDATE VEHICLE
export const updateVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    // Use 'db' instead of 'prisma'
    const updated = await db.vehicle.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(updated);
  } catch (error: any) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ error: "Update failed. Vehicle not found." });
  }
};

// 3. REMOVE VEHICLE (Soft Delete)
export const removeVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    // Use 'db' instead of 'prisma'
    await db.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(200).json({ message: "Vehicle removed and moved to history." });
  } catch (error: any) {
    console.error("Remove vehicle error:", error);
    res.status(500).json({ error: "Removal failed." });
  }
};

// 4. GET VEHICLES (Conditional Visibility)
export const getVehicles = async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === Role.ADMIN;
  
  try {
    // Use 'db' instead of 'prisma'
    const vehicles = await db.vehicle.findMany({
      where: isAdmin 
        ? {} 
        : { deletedAt: null } 
    });
    res.status(200).json(vehicles);
  } catch (error: any) {
    console.error("Get vehicles error:", error);
    res.status(500).json({ error: "Failed to fetch vehicles." });
  }
};