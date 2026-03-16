import { Response } from 'express';
import { db } from '../config/db';

// 1. See Vehicles (Public/User)
export const getAvailableVehicles = async (req: any, res: Response) => {
  const vehicles = await db.vehicle.findMany({
    where: { status: 'available', deletedAt: null }
  });
  res.json(vehicles);
};

// 2. Book a Vehicle
export const createBooking = async (req: any, res: Response) => {
  const { vehicleId, startDate, endDate } = req.body;

  // Verify KYC first
  const user = await db.user.findUnique({ where: { id: req.user.id } });
  if (!user?.isVerified) return res.status(403).json({ message: "Account not verified. Please complete KYC." });

  const booking = await db.booking.create({
    data: {
      userId: req.user.id,
      vehicleId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPrice: 0, // TODO: Calculate this based on the vehicle's rental rate and duration
      status: 'PENDING'
    }
  });
  res.status(201).json(booking);
};

// 3. See History of Bookings
export const getBookingHistory = async (req: any, res: Response) => {
  const bookings = await db.booking.findMany({
    where: { userId: req.user.id },
    include: { vehicle: true, payment: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(bookings);
};