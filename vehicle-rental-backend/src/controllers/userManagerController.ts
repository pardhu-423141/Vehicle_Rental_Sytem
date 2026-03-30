import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Get Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const pendingKyc = await prisma.user.count({ where: { kycStatus: 'PENDING' } });
    
    const recentRequests = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      select: { id: true, name: true, kycStatus: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 3
    });

    res.json({ stats: { totalUsers, pendingKyc }, recentRequests });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// 2. Get the full KYC Queue
export const getKycQueue = async (req: Request, res: Response) => {
  try {
    const queue = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      include: { kycData: true } // Fetches their Aadhaar/DL info
    });
    res.json(queue);
  } catch (error) {
    console.error("Queue Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch KYC queue" });
  }
};

// 3. Approve KYC
export const approveKyc = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'APPROVED', isVerified: true }
    });
    res.json({ message: "User KYC Approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve KYC" });
  }
};

// 4. Reject KYC
export const rejectKyc = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'REJECTED' }
    });
    // Note: If you have an email service, you would trigger a "KYC Rejected" email here
    res.json({ message: "User KYC Rejected" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject KYC" });
  }
};
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        kycStatus: true, 
        createdAt: true,
        kycData: true // <--- ⚡ ADD THIS LINE SO WE GET THE IMAGES
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};