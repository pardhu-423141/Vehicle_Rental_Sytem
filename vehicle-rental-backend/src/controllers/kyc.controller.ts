import { Response } from 'express';
import { db } from '../config/db'; // Using your Prisma 7 adapter

/**
 * Handles the logic for User Identity Verification (KYC)
 */

// 1. SUBMIT KYC DATA

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Helper to upload buffer to Cloudinary
// Cloudinary Stream Helper
const streamUpload = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "kyc_documents" },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const submitKYC = async (req: any, res: Response) => {
  const { idType, idNumber } = req.body;
  const userId = req.user?.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  try {
    // 1. Validation: Front image is mandatory in your schema
    if (!files?.idImageFront?.[0]) {
      return res.status(400).json({ message: "Front ID image is required." });
    }

    // 2. Check if ID Number is already taken by ANOTHER user (Since it's @unique)
    const duplicateId = await db.kYCData.findFirst({
      where: { 
        idNumber,
        NOT: { userId } // Check if someone else owns this ID number
      }
    });

    if (duplicateId) {
      return res.status(400).json({ message: "This ID number is already registered to another account." });
    }

    // 3. Upload to Cloudinary
    const [frontUrl, backUrl] = await Promise.all([
      streamUpload(files.idImageFront[0]),
      files.idImageBack ? streamUpload(files.idImageBack[0]) : Promise.resolve(null)
    ]);

    // 4. Update or Create (Upsert) based on your Model
    await db.kYCData.upsert({
      where: { userId },
      update: {
        idType,
        idNumber,
        idImageFront: frontUrl,
        idImageBack: backUrl,
      },
      create: {
        userId,
        idType,
        idNumber,
        idImageFront: frontUrl,
        idImageBack: backUrl,
      }
    });

    // 5. Update User Status
    await db.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' }
    });

    res.status(201).json({ message: "KYC documents submitted successfully." });

  } catch (error: any) {
    console.error("KYC Error:", error);
    res.status(500).json({ message: "Submission failed. Please try again." });
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

export const getAllKYCSubmissions = async (req: any, res: Response) => {
  try {
    const submissions = await db.user.findMany({
      where: {
        // Fetch everyone who has at least attempted KYC
        kycStatus: { in: ['PENDING', 'APPROVED', 'REJECTED'] }
      },
      include: { kycData: true } // Important: Include the relation!
    });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching KYC data" });
  }
};