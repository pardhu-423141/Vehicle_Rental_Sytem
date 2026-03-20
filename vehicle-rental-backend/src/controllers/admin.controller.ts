import { Request, Response } from 'express';
import { db } from '../config/db';

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
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [userCount, vehicleCount, pendingKYC, activeBookings] = await Promise.all([
      db.user.count(),
      db.vehicle.count({ where: { deletedAt: null } }),
      db.user.count({ where: { kycStatus: 'PENDING' } }),
      db.booking.count({ where: { status: 'ONGOING' } })
    ]);

    res.status(200).json({
      stats: {
        totalUsers: userCount,
        activeVehicles: vehicleCount,
        pendingVerifications: pendingKYC,
        currentRentals: activeBookings
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// 4. BULK MAINTENANCE TOGGLE
// Useful for taking multiple cars off the market for a fleet-wide service
export const toggleMaintenance = async (req: Request, res: Response) => {
  const { vehicleIds, status } = req.body; // status should be 'maintenance' or 'available'

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
// Admins can see cars that were soft-deleted
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
// Admins see everyone's bookings to resolve disputes
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
    // 1. Total Revenue from Completed Bookings
    const totalRevenue = await db.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' }
    });

    // 2. Revenue grouped by month (Last 6 months)
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

    // 3. Top Earning Vehicles
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

    // Fetch vehicle names for the top earners
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