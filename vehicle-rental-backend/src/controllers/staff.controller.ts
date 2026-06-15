import { Request, Response } from 'express';
import { db } from '../config/db';
import argon2 from 'argon2';

// GET /api/admin/staff
export const getStaff = async (req: Request, res: Response): Promise<any> => {
  try {
    const staff = await db.user.findMany({
      where: {
        role: { in: ['USER_MANAGER', 'VEHICLE_MANAGER'] }
      },
      include: {
        _count: { select: { managedVehicles: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const pendingKycs = await db.user.count({
      where: { kycStatus: 'PENDING' }
    });

    const formattedStaff = staff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      status: 'Active',
      assignedTasks: s.role === 'VEHICLE_MANAGER' ? s._count.managedVehicles : pendingKycs
    }));

    return res.status(200).json(formattedStaff);
  } catch (error) {
    console.error("Get Staff Error:", error);
    return res.status(500).json({ error: "Failed to fetch staff" });
  }
};

// POST /api/admin/staff
export const createStaff = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await db.user.findUnique({ where: { email: cleanEmail } });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already in use and verified." });
      } else {
        await db.user.delete({ where: { email: cleanEmail } });
      }
    }

    const assignedRole = role === 'user-manager' ? 'USER_MANAGER' : 'VEHICLE_MANAGER';
    const hashedPassword = await argon2.hash(password);

    await db.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        isVerified: true,
      },
    });

    return res.status(201).json({ message: "Staff created successfully." });
  } catch (error) {
    console.error("Create Staff Error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};
