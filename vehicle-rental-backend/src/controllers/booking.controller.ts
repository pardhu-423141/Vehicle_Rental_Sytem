import { Response } from 'express';
import { db } from '../config/db'; 

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

// 1. CREATE A NEW BOOKING
export const createBooking = async (req: any, res: Response) => {
  const { vehicleId, startDate, endDate } = req.body;
  const userId = req.user?.id; 

  try {
    const vehicle = await db.vehicle.findUnique({
      where: { 
        id: vehicleId,
        deletedAt: null 
      }
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found or no longer available." });
    }

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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
    const totalPrice = diffDays * vehicle.rentalRate;

    const newBooking = await db.booking.create({
      data: {
        userId,
        vehicleId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'CONFIRMED' // Initial status,
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
      include: { 
        // Just include the whole vehicle to guarantee we don't miss fields!
        vehicle: true,
        review: true 
      },
      orderBy: { startDate: 'desc' }
    });

    const formattedBookings = bookings.map(b => ({
      ...b,
      vehicle: {
        id: b.vehicle.id,
        name: `${b.vehicle.make} ${b.vehicle.model}`,
        type: b.vehicle.type,
        // ⚡ MAP IT TO 'image' AND ADD A GUARANTEED FALLBACK
        image: b.vehicle.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'
      }
    }));

    res.status(200).json(formattedBookings);
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

// 4. GET BOOKING HISTORY
export const getBookingHistory = async (req: any, res: Response) => {
  try {
    const history = await db.booking.findMany({
      where: { userId: req.user.id },
      include: { 
        vehicle: true, 
        review: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedHistory = history.map(b => ({
      ...b,
      vehicle: {
        id: b.vehicle.id,
        name: `${b.vehicle.make} ${b.vehicle.model}`,
        type: b.vehicle.type,
        // ⚡ MAP IT TO 'image' AND ADD A GUARANTEED FALLBACK
        image: b.vehicle.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'
      }
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking history" });
  }
};
// 4. COMPLETE BOOKING (End of Ride)
export const completeBooking = async (req: any, res: Response) => {
  const { id } = req.params; // The Booking ID
  const { issueReported } = req.body; // Optional: Did the user report a broken mirror, flat tire, etc.?

  try {
    // 1. Find the booking to get the vehicleId
    const booking = await db.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. Mark the booking as COMPLETED
    await db.booking.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    // 3. Determine the vehicle's next status
    if (issueReported) {
      // If the car needs fixing, take it off the market and create a Maintenance Task
      await db.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'under maintenance' }
      });

      await db.maintenanceTask.create({
        data: {
          vehicleId: booking.vehicleId,
          issue: issueReported,
          status: 'Pending'
        }
      });
      
      return res.status(200).json({ message: "Ride completed. Vehicle flagged for maintenance." });
    } else {
      // If the car is fine, put it back on the market for the next user
      await db.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'Available' }
      });
      
      return res.status(200).json({ message: "Ride completed successfully. Vehicle is available." });
    }

  } catch (error) {
    console.error("Completion Error:", error);
    res.status(500).json({ message: "Failed to complete the ride." });
  }
};