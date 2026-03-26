import { Response, NextFunction } from 'express';
import { db } from '../config/db'; // Adjust this path to your Prisma client instance

/**
 * Prevents access to booking routes if user is not KYC verified in the Database.
 */
export const isVerifiedUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID missing." });
    }

    // 1. Fetch the latest status directly from the Database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        isVerified: true, 
        kycStatus: true 
      }
    });

    // 2. Safety check if user was deleted but token is still active
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Logic check: Block if not verified or if status isn't APPROVED
    if (!user.isVerified || user.kycStatus !== 'APPROVED') {
      return res.status(403).json({ 
        message: "Access Denied. Your KYC is not approved yet.",
        kycStatus: user.kycStatus // Helpful for frontend to redirect accordingly
      });
    }

    // 4. Everything is good, proceed to the controller
    next();
  } catch (error) {
    console.error('KYC Middleware Error:', error);
    return res.status(500).json({ message: "Internal Server Error during KYC check." });
  }
};