import { Response } from "express";
import { db } from "../config/db";
import cloudinary from "../config/cloudinary";
import { time } from "console";

export const handleKYC = async (req: any, res: Response) => {
  try {
    // 1. Safety Check: Ensure files object and required front image exist
    if (!req.files || !req.files["idImageFront"]) {
      return res
        .status(400)
        .json({ message: "Please upload the Front ID image." });
    }

    const { idType, idNumber } = req.body;

    // 2. Define our files from the request
    const frontFile = req.files["idImageFront"][0];
    const backFile = req.files["idImageBack"]
      ? req.files["idImageBack"][0]
      : null;

    // 3. Helper function to upload to Cloudinary using buffers
    const uploadToCloudinary = (fileBuffer: Buffer): Promise<string> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "kyc_documents" },
          (error: any, result: any) => { 
            if (error) {
              return res.status(500).json({ message: "Upload failed" });
            }
            else {resolve(result?.secure_url || "")};
          },
        );
        uploadStream.end(fileBuffer);
      });
    };

    // 4. Perform the uploads using the buffers from frontFile and backFile
    const idImageFrontUrl = await uploadToCloudinary(frontFile.buffer);

    let idImageBackUrl = null;
    if (backFile) {
      idImageBackUrl = await uploadToCloudinary(backFile.buffer);
    }

    // 5. UPSERT into DB with Cloudinary URLs
    // Using a transaction ensures both the KYC data and User status update together
    await db.$transaction([
      db.kYCData.upsert({
        where: { userId: req.user.id },
        update: {
          idType,
          idNumber,
          idImageFront: idImageFrontUrl,
          idImageBack: idImageBackUrl,
        },
        create: {
          userId: req.user.id,
          idType,
          idNumber,
          idImageFront: idImageFrontUrl,
          idImageBack: idImageBackUrl,
        },
      }),
      db.user.update({
        where: { id: req.user.id },
        data: { kycStatus: "PENDING", isVerified: false },
      }),
    ]);

    res.json({
      message: "KYC submitted successfully. Status: PENDING",
      urls: { front: idImageFrontUrl, back: idImageBackUrl },
    });
  } catch (error) {
    console.error("KYC Upload Error:", error);
    res.status(500).json({ message: "Upload failed. Please try again." });
  }
};

// 1. See Profile & KYC Status
export const getProfile = async (req: any, res: Response) => {
  const user = await db.user.findUnique({
    where: { id: req.user.id },
    include: { kycData: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  
  const { password, ...safeUser } = user;
  
  // THE FIX: Wrap it in an object so the frontend can find 'res.data.user'
  res.json({ user: safeUser }); 
};
// 2. Update Profile Name
export const updateProfile = async (req: any, res: Response) => {
  const { name } = req.body;
  await db.user.update({
    where: { id: req.user.id },
    data: { name },
  });
  res.json({ message: "Name updated successfully" });
};
