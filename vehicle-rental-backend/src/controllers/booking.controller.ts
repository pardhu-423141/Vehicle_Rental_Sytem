import { Response } from 'express';
import { db } from '../config/db';
import { sendEmail } from '../utils/email';

export const createBooking = async (req: any, res: Response) => {
  const { vehicleId, startDate, endDate } = req.body;
  const userId = req.user?.id;
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId, deletedAt: null },
      include: { manager: true },  
    });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found or no longer available." });
    }
    const overlappingBooking = await db.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ONGOING'] },
        OR: [{ startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }],
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
      data: { userId, vehicleId, startDate: start, endDate: end, totalPrice, status: 'CONFIRMED' },
    });
    // Fetch the renter's name for the notification email
    const renter = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    if (vehicle.manager?.email) {
      try {
        await sendEmail({
          to: vehicle.manager.email,
          subject: `New Booking for ${vehicle.make} ${vehicle.model}`,
          html: `
            <h2>New Booking Notification</h2>
            <p>Hi ${vehicle.manager.name},</p>
            <p>A new booking has been made for your vehicle:</p>
            <ul>
              <li><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})</li>
              <li><strong>Booked by:</strong> ${renter?.name || 'A user'} (${renter?.email || ''})</li>
              <li><strong>From:</strong> ${start.toDateString()}</li>
              <li><strong>To:</strong> ${end.toDateString()}</li>
              <li><strong>Total:</strong> ₹${totalPrice.toFixed(2)}</li>
            </ul>
          `,
        });
      } catch (emailErr) {
        console.error('Manager notification email failed (non-critical):', emailErr);
      }
    }
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
        image: b.vehicle.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf'
      }
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking history" });
  }
};
