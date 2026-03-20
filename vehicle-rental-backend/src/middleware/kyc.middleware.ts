import { Response, NextFunction } from 'express';

/**
 * Prevents access to booking routes if user is not KYC verified.
 */
export const isVerifiedUser = (req: any, res: Response, next: NextFunction) => {
  if (!req.user?.isVerified) {
    return res.status(403).json({ 
      message: "Access Denied. Please complete your KYC verification to rent vehicles." 
    });
  }
  next();
};