import { Response } from 'express';
import { db } from '../config/db';

// 1. Add Review
export const addReview = async (req: any, res: Response) => {
  const { vehicleId, rating, comment } = req.body;

  // Check if they actually finished a booking for this car
  const hasRental = await db.booking.findFirst({
    where: { userId: req.user.id, vehicleId, status: 'COMPLETED' }
  });

  if (!hasRental) return res.status(403).json({ message: "Only completed rentals can be reviewed." });

  const review = await db.review.create({
    data: { userId: req.user.id, vehicleId, rating, comment }
  });
  res.status(201).json(review);
};

// 2. See All My Reviews (One place)
export const getMyReviews = async (req: any, res: Response) => {
  const reviews = await db.review.findMany({
    where: { userId: req.user.id },
    include: { vehicle: true }
  });
  res.json(reviews);
};