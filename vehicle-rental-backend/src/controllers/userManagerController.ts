import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/email';

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
      take: 3,
    });

    res.json({ stats: { totalUsers, pendingKyc }, recentRequests });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

// 2. Get the full KYC Queue (PENDING only)
export const getKycQueue = async (req: Request, res: Response) => {
  try {
    const queue = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      include: { kycData: true },
    });
    res.json(queue);
  } catch (error) {
    console.error('Queue Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch KYC queue' });
  }
};

// 3. Approve KYC — sends approval email (Tasks 3)
export const approveKyc = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'APPROVED', isVerified: true },
    });

    // Send approval email
    try {
      await sendEmail({
        to: user.email,
        subject: 'KYC Approved — You\'re Verified!',
        html: `
          <h2>🎉 KYC Approved</h2>
          <p>Hi ${user.name},</p>
          <p>Your identity verification has been <strong>approved</strong>. 
             You can now book vehicles on our platform.</p>
          <p>Happy driving!</p>
        `,
      });
    } catch (emailErr) {
      console.error('Approval email failed (non-critical):', emailErr);
    }

    res.json({ message: 'User KYC Approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve KYC' });
  }
};

// 4. Reject KYC — saves reason + sends rejection email (Tasks 4, 6)
export const rejectKyc = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'REJECTED' },
    });

    // Save rejection reason in KYCData
    await prisma.kYCData.updateMany({
      where: { userId },
      data: { rejectionReason: reason },
    });

    // Send rejection email
    try {
      await sendEmail({
        to: user.email,
        subject: 'KYC Rejected — Action Required',
        html: `
          <h2>KYC Verification Rejected</h2>
          <p>Hi ${user.name},</p>
          <p>Unfortunately your KYC submission has been <strong>rejected</strong>.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please re-submit corrected documents to continue using the platform.</p>
        `,
      });
    } catch (emailErr) {
      console.error('Rejection email failed (non-critical):', emailErr);
    }

    res.json({ message: 'User KYC Rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject KYC' });
  }
};

// 5. Get all regular users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        kycStatus: true,
        isActive: true,
        createdAt: true,
        kycData: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};