import { Request, Response } from 'express';
import { db } from '../config/db';
import { PrismaClient } from '@prisma/client';

// 1. GET ALL USERS (with Pagination)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          kycStatus: true,
          isVerified: true,
          createdAt: true,
        }
      }),
      db.user.count()
    ]);

    res.status(200).json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ⚡ NEW: GET ALL STAFF MEMBERS
export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'VEHICLE_MANAGER', 'USER_MANAGER'] // Add or change roles as needed based on your schema
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(staff);
  } catch (error) {
    console.error("Fetch Staff Error:", error);
    res.status(500).json({ message: "Failed to fetch staff members." });
  }
};

// 2. UPDATE USER ROLE (Promotion/Demotion)
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body; // Expects USER, USER_MANAGER, VEHICLE_MANAGER, or ADMIN
  const validRoles = ['USER', 'USER_MANAGER', 'VEHICLE_MANAGER', 'ADMIN'];

  try {
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, role: true }
    });

    res.status(200).json({ message: "User role updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

// 3. GET ADMIN DASHBOARD STATS
// 3. GET ADMIN DASHBOARD STATS
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Fetch all counts in parallel for maximum speed
    const [
      userCount, 
      vehicleCount, 
      totalVehicles,
      pendingKYC, 
      activeBookings,
      totalBookings,
      pendingMaintenance
    ] = await Promise.all([
      db.user.count(),
      db.vehicle.count({ where: { status: 'available', deletedAt: null } }), // Active
      db.vehicle.count({ where: { deletedAt: null } }), // Total
      db.user.count({ where: { kycStatus: 'PENDING' } }),
      db.booking.count({ where: { status: 'ONGOING' } }),
      db.booking.count(), // Total lifetime bookings
      db.maintenanceTask.count({ where: { status: 'Pending' } }) // Assuming 'Pending' based on your schema
    ]);

    // 2. Calculate Total Revenue (Sum of all COMPLETED bookings)
    const revenueCalc = await db.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' }
    });
    const totalRevenue = revenueCalc._sum.totalPrice || 0;

    // ⚡ 3. Fetch the 5 most recent bookings with User and Vehicle info included
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        vehicle: { select: { make: true, model: true } }
      }
    });

    // 4. Send it all back in the structure React expects
    res.status(200).json({
      stats: {
        totalUsers: userCount,
        activeVehicles: vehicleCount,
        totalVehicles: totalVehicles,
        pendingVerifications: pendingKYC,
        currentRentals: activeBookings,
        totalBookings: totalBookings,
        pendingMaintenance: pendingMaintenance,
        totalRevenue: totalRevenue
      },
      recentBookings: recentBookings // ⚡ This populates the table!
    });
    
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// 4. BULK MAINTENANCE TOGGLE
export const toggleMaintenance = async (req: Request, res: Response) => {
  const { vehicleIds, status } = req.body; 

  try {
    const updated = await db.vehicle.updateMany({
      where: {
        id: { in: vehicleIds }
      },
      data: { status }
    });

    res.status(200).json({ 
      message: `Updated ${updated.count} vehicles to ${status}.` 
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk update failed." });
  }
};

// 5. GET DELETED VEHICLES (Archive)
export const getVehicleArchive = async (req: Request, res: Response) => {
  try {
    const archived = await db.vehicle.findMany({
      where: {
        deletedAt: { not: null }
      },
      orderBy: { deletedAt: 'desc' }
    });
    res.status(200).json(archived);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch archive." });
  }
}

// 6. RESTORE VEHICLE (Undo Soft Delete)
export const restoreVehicle = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const restored = await db.vehicle.update({
      where: { id },
      data: { 
        deletedAt: null,
        status: 'available' 
      }
    });

    res.status(200).json({ message: "Vehicle restored to inventory.", restored });
  } catch (error) {
    res.status(500).json({ message: "Restoration failed. Vehicle might not exist." });
  }
};

// 7. GET ALL BOOKINGS (Global Oversight)
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await db.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { make: true, model: true, licensePlate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch global bookings." });
  }
};


// 8. GET REVENUE REPORTS
export const getRevenueReports = async (req: Request, res: Response) => {
  try {
    const totalRevenue = await db.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' }
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await db.booking.groupBy({
      by: ['createdAt'],
      _sum: { totalPrice: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
    });

    const topVehicles = await db.booking.groupBy({
      by: ['vehicleId'],
      _sum: { totalPrice: true },
      _count: { id: true },
      orderBy: {
        _sum: { totalPrice: 'desc' }
      },
      take: 5,
      where: { status: 'COMPLETED' }
    });

    const vehicleDetails = await Promise.all(
      topVehicles.map(async (item: { vehicleId: any; _sum: { totalPrice: any; }; _count: { id: any; }; }) => {
        const vehicle = await db.vehicle.findUnique({
          where: { id: item.vehicleId },
          select: { make: true, model: true }
        });
        return {
          ...vehicle,
          totalEarned: item._sum.totalPrice,
          rentalCount: item._count.id
        };
      })
    );

    res.status(200).json({
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyBreakdown: monthlyRevenue,
      topPerformingVehicles: vehicleDetails
    });
  } catch (error) {
    console.error("Revenue report error:", error);
    res.status(500).json({ message: "Failed to generate revenue reports." });
  }
};

// 9. GET RECENT TRANSACTIONS
export const getRecentTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await db.booking.findMany({
      where: { status: 'COMPLETED' },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        totalPrice: true,
        updatedAt: true,
        user: { select: { name: true } },
        vehicle: { select: { make: true, model: true } }
      }
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions." });
  }
};

const prisma = new PrismaClient();

export const getMaintenanceTasks = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: "under maintenance",
        deletedAt: null 
      }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resolveMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    
    await prisma.vehicle.update({
      where: { id: id },
      data: { status: "Available" }
    });

    res.json({ message: "Vehicle restored to Available status" });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve maintenance" });
  }
};