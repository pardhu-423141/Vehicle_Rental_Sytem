import { Response } from 'express';
import { db } from '../config/db'; // Using your Prisma 7 adapter
import { Role } from '@prisma/client';

/**
 * Handles the logic for vehicle ratings and feedback.
 */

// 1. ADD A REVIEW
export const addReview = async (req: any, res: Response) => {
  const { vehicleId, rating, comment } = req.body;
  const userId = req.user?.id; // Set by your authenticate middleware

  try {
    // Check if the user has a COMPLETED booking for this vehicle
    // This prevents fake reviews
    const hasCompletedBooking = await db.booking.findFirst({
      where: {
        userId,
        vehicleId,
        status: 'COMPLETED'
      }
    });

    if (!hasCompletedBooking) {
      return res.status(403).json({ 
        message: "You can only review a vehicle after completing a rental." 
      });
    }

    // Check if user already reviewed this vehicle
    const existingReview = await db.review.findFirst({
      where: { userId, vehicleId }
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this vehicle." });
    }

    const newReview = await db.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId,
        vehicleId
      }
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: "Failed to submit review." });
  }
};

// 2. GET ALL REVIEWS FOR A VEHICLE
export const getVehicleReviews = async (req: any, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const reviews = await db.review.findMany({
      where: { vehicleId },
      include: {
        user: {
          select: { name: true } // Only send the reviewer's name
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
};

// 3. DELETE A REVIEW (Admin or Author Only)
export const deleteReview = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const review = await db.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Authorization: Author of the review or an ADMIN
    if (review.userId !== userId && userRole !== Role.ADMIN) {
      return res.status(403).json({ message: "Unauthorized to delete this review." });
    }

    await db.review.delete({ where: { id } });

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed." });
  }
};