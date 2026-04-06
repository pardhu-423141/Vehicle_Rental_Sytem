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
        seatingCapacity: seatingCapacity,
        status: 'Available' // Ensuring capitalized default
      },
    });

    res.status(201).json(newVehicle);
  } catch (error: any) {
    console.error("Add vehicle error:", error);
    res.status(500).json({ error: "Could not add vehicle. Ensure data is valid." });
  }
};

// 2. UPDATE VEHICLE (Upgraded Security)
export const updateVehicle = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // 🚨 SECURITY GATE: If a Manager is trying to update, ensure they own the vehicle!
    if (userRole === 'VEHICLE_MANAGER') {
      const vehicle = await prisma.vehicle.findUnique({ where: { id } });
      
      if (!vehicle || vehicle.managerId !== userId) {
        return res.status(403).json({ error: "Unauthorized: You do not manage this vehicle." });
      }
      
      // Prevent managers from reassigning the vehicle to someone else
      delete updateData.managerId; 
    }

    if (updateData.status === 'Available') {
      updateData.deletedAt = null;
    }

    const updatedVehicle = await prisma.vehicle.update({
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

// 4. GET VEHICLES (Upgraded Visibility)
export const getVehicles = async (req: AuthenticatedRequest, res: Response) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    let whereClause: any = {};

    if (userRole === 'ADMIN') {
      // Admins see everything (including soft-deleted up to 6 months)
      whereClause = {
        OR: [
          { deletedAt: null },
          { deletedAt: { gte: sixMonthsAgo } }
        ]
      };
    } else if (userRole === 'VEHICLE_MANAGER') {
      // 🚨 THE FIX: Managers ONLY see vehicles assigned to their specific ID
      whereClause = {
        deletedAt: null,
        managerId: userId // Only fetch rows where managerId matches their login ID
      };
    } else {
      // Standard Users only see Available cars
      whereClause = { 
        deletedAt: null,
        status: 'Available' 
      };
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
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


// ⚡ UPDATED: getVehicleById NOW FETCHES BOOKINGS TO BLOCK DATES IN CALENDAR ⚡
export const getVehicleById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'ADMIN';

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      // 👇 This include block is required so the frontend knows what dates to block
      include: {
        bookings: {
          where: {
            endDate: { gte: new Date() }, // Only send future or current bookings
            status: { not: 'CANCELLED' }  // ⚡ Ensure cancelled bookings do NOT block the calendar
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

// 6. GET VEHICLE HISTORY
export const getVehicleHistory = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    // Fetch all bookings for this specific vehicle, including the User who booked it
    const bookings = await prisma.booking.findMany({
      where: { vehicleId: id },
      include: { 
        user: { select: { name: true } } // Get the renter's name!
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map the database data into a clean format for our frontend timeline
    const history = bookings.map((b: any) => ({
      id: b.id,
      type: 'BOOKING',
      date: new Date(b.createdAt).toLocaleDateString(), 
      desc: `Rented by ${b.user?.name || 'Unknown User'}`,
      duration: 'Standard', // If you have start/end dates in your DB, you can calculate days here!
      status: b.status || 'Completed' // 'Active', 'Completed', etc.
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ error: "Failed to fetch vehicle history." });
  }
};