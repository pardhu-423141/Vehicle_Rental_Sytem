import { Response } from 'express';
import { db } from '../config/db'; // Using your Prisma 7 adapter instance
import { Role } from '@prisma/client';

/**
 * Interface to handle the extended Express Request 
 * established in your index.ts
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email: string;
  };
}

// 1. CREATE A NEW BOOKING
export const createBooking = async (req: any, res: Response) => {
  const { vehicleId, startDate, endDate } = req.body;
  const userId = req.user?.id; // Set by your authenticate middleware

  try {
    // Check if vehicle exists and hasn't been soft-deleted
    const vehicle = await db.vehicle.findUnique({
      where: { 
        id: vehicleId,
        deletedAt: null // Only active vehicles can be booked
      }
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found or no longer available." });
    }

    // Date Validation: Check for overlapping confirmed bookings
    const overlappingBooking = await db.booking.findFirst({
      where: {
        vehicleId: vehicleId,
        status: { in: ['CONFIRMED', 'ONGOING'] },
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: "Vehicle is already booked for these dates." });
    }

    // Logic: Calculate total price based on rentalRate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day
    const totalPrice = diffDays * vehicle.rentalRate;

    const newBooking = await db.booking.create({
      data: {
        userId,
        vehicleId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'PENDING',
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Internal Server Error during booking." });
  }
};

// 2. GET USER BOOKINGS
export const getUserBookings = async (req: any, res: Response) => {
  try {
    const bookings = await db.booking.findMany({
      where: { userId: req.user.id },
      include: { vehicle: true } // Include vehicle details for the UI
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings." });
  }
};

// 3. CANCEL BOOKING
export const cancelBooking = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const booking = await db.booking.findUnique({ where: { id } });

    if (!booking || booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking." });
    }

    const updated = await db.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.status(200).json({ message: "Booking cancelled successfully", updated });
  } catch (error) {
    res.status(500).json({ message: "Cancellation failed." });
  }
};