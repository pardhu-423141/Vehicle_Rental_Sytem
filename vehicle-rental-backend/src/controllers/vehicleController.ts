import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

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

    const newVehicle = await prisma.Vehicle.create({
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
    res.status(500).json({ error: "Could not add vehicle. Check if License Plate is unique." });
  }
};

// 2. UPDATE VEHICLE
export const updateVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.Vehicle.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed. Vehicle not found." });
  }
};

// 3. REMOVE VEHICLE (Soft Delete)
export const removeVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    // We don't delete from DB, we just set the deletedAt timestamp
    await prisma.Vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(200).json({ message: "Vehicle removed and moved to history." });
  } catch (error) {
    res.status(500).json({ error: "Removal failed." });
  }
};

// 4. GET VEHICLES (Conditional Visibility)
export const getVehicles = async (req: AuthenticatedRequest, res: Response) => {
  // Check if the requester is an Admin using the Enum from Prisma
  const isAdmin = req.user?.role === Role.ADMIN;
  
  try {
    const vehicles = await prisma.Vehicle.findMany({
      where: isAdmin 
        ? {} // Admins see everything (Past history included)
        : { deletedAt: null } // Users see only those NOT removed
    });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicles." });
  }
};