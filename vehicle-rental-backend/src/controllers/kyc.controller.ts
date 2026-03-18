import { Response } from 'express';
import { db } from '../config/db'; // Using your Prisma 7 adapter

/**
 * Handles the logic for User Identity Verification (KYC)
 */

// 1. SUBMIT KYC DATA
export const submitKYC = async (req: any, res: Response) => {
  const { idType, idNumber, idImageFront } = req.body;
  const userId = req.user?.id; // Set by your authenticate middleware

  try {
    // Check if user already has a KYC record
    const existingKYC = await db.kYCData.findUnique({
      where: { userId }
    });

    if (existingKYC) {
      return res.status(400).json({ message: "KYC already submitted for this account." });
    }

    // Create the KYC data record
    await db.kYCData.create({
      data: {
        userId,
        idType,
        idNumber,
        idImageFront
      }
    });

    // Update the User's overall kycStatus to PENDING
    await db.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' }
    });

    res.status(201).json({ message: "KYC documents submitted successfully." });
  } catch (error) {
    console.error("KYC Submission Error:", error);
    res.status(500).json({ message: "Failed to submit KYC data." });
  }
};

// 2. GET MY KYC STATUS
export const getMyKYCStatus = async (req: any, res: Response) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { kycStatus: true, isVerified: true }
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch KYC status." });
  }
};

// 3. UPDATE KYC STATUS (Admin Only)
export const updateKYCStatus = async (req: any, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body; // Expects 'APPROVED' or 'REJECTED'

  try {
    // Validate the status input
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        kycStatus: status,
        isVerified: status === 'APPROVED' // Auto-verify if approved
      }
    });

    res.status(200).json({ 
      message: `KYC status updated to ${status}`, 
      isVerified: updatedUser.isVerified 
    });
  } catch (error) {
    console.error("KYC Review Error:", error);
    res.status(500).json({ message: "Failed to update KYC status." });
  }
};