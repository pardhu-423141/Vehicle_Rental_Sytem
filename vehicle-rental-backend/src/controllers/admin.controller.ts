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
          createdAt: true
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

// 2. GET ALL STAFF MEMBERS
export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await db.user.findMany({
      where: {
        role: { in: ['ADMIN', 'VEHICLE_MANAGER', 'USER_MANAGER'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(staff);
  } catch (error) {
    console.error("Fetch Staff Error:", error);
    res.status(500).json({ message: "Failed to fetch staff members." });
  }
};

// 3. UPDATE USER ROLE
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
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

// 4. GET ADMIN DASHBOARD STATS
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
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
      db.vehicle.count({ where: { status: 'Available', deletedAt: null } }),
      db.vehicle.count({ where: { deletedAt: null } }),
      db.user.count({ where: { kycStatus: 'PENDING' } }),
      db.booking.count({ where: { status: 'ONGOING' } }),
      db.booking.count(),
      db.maintenanceTask.count({ where: { status: 'Pending' } })
    ]);

    const revenueCalc = await db.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' }
    });
    const totalRevenue = revenueCalc._sum.totalPrice || 0;

    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        vehicle: { select: { make: true, model: true } }
      }
    });

    res.status(200).json({
      stats: {
        totalUsers: userCount,
        activeVehicles: vehicleCount,
        totalVehicles,
        pendingVerifications: pendingKYC,
        currentRentals: activeBookings,
        totalBookings,
        pendingMaintenance,
        totalRevenue
      },
      recentBookings
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// 5. BULK MAINTENANCE TOGGLE
export const toggleMaintenance = async (req: Request, res: Response) => {
  const { vehicleIds, status } = req.body;

  try {
    const updated = await db.vehicle.updateMany({
      where: { id: { in: vehicleIds } },
      data: { status }
    });

    res.status(200).json({ message: `Updated ${updated.count} vehicles to ${status}.` });
  } catch (error) {
    res.status(500).json({ message: "Bulk update failed." });
  }
};

// 6. GET DELETED VEHICLES (Archive)
export const getVehicleArchive = async (req: Request, res: Response) => {
  try {
    const archived = await db.vehicle.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' }
    });
    res.status(200).json(archived);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch archive." });
  }
};

// 7. RESTORE VEHICLE
export const restoreVehicle = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const restored = await db.vehicle.update({
      where: { id },
      data: { deletedAt: null, status: 'Available' }
    });

    res.status(200).json({ message: "Vehicle restored to inventory.", restored });
  } catch (error) {
    res.status(500).json({ message: "Restoration failed." });
  }
};

// 8. GET ALL BOOKINGS
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

// 9. GET REVENUE REPORTS (improved monthly grouping)
export const getRevenueReports = async (req: Request, res: Response) => {
  try {
    const totalRevenueAgg = await db.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' }
    });
    const totalRevenue = totalRevenueAgg._sum.totalPrice || 0;

    const completedBookings = await db.booking.findMany({
      where: { status: 'COMPLETED' },
      select: { totalPrice: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    // Group by year-month manually
    const monthlyMap: Record<string, number> = {};
    for (const b of completedBookings) {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + (b.totalPrice || 0);
    }

    const monthlyBreakdown = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, revenue]) => ({ month, revenue }));

    const topVehicles = await db.booking.groupBy({
      by: ['vehicleId'],
      _sum: { totalPrice: true },
      _count: { id: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 5,
      where: { status: 'COMPLETED' }
    });

    const topPerformingVehicles = await Promise.all(
      topVehicles.map(async (item) => {
        const vehicle = await db.vehicle.findUnique({
          where: { id: item.vehicleId },
          select: { make: true, model: true, licensePlate: true }
        });
        return {
          ...vehicle,
          totalEarned: item._sum.totalPrice || 0,
          rentalCount: item._count.id
        };
      })
    );

    const bookingStatusBreakdown = await db.booking.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.status(200).json({
      totalRevenue,
      monthlyBreakdown,
      topPerformingVehicles,
      bookingStatusBreakdown: bookingStatusBreakdown.map(s => ({
        status: s.status,
        count: s._count.id
      }))
    });
  } catch (error) {
    console.error("Revenue report error:", error);
    res.status(500).json({ message: "Failed to generate revenue reports." });
  }
};

// 10. GET RECENT TRANSACTIONS
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

// 11. GET MAINTENANCE TASKS (Admin view)
export const getMaintenanceTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await db.maintenanceTask.findMany({
      where: { vehicle: { deletedAt: null } },
      include: { vehicle: true },
      orderBy: { reportedDate: 'desc' }
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 12. RESOLVE MAINTENANCE (Admin shortcut - id is vehicle id for backward compatibility)
export const resolveMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // vehicle id

    await db.vehicle.update({
      where: { id },
      data: { status: 'Available' }
    });

    // Also mark any pending maintenance tasks for this vehicle as resolved
    await db.maintenanceTask.updateMany({
      where: { vehicleId: id, status: { not: 'Resolved' } },
      data: { status: 'Resolved', resolvedAt: new Date() }
    });

    res.json({ message: "Vehicle restored to Available. Maintenance tasks resolved." });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve maintenance" });
  }
};

// 13. GET VEHICLE STATUS LOGS
export const getVehicleStatusLogs = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  try {
    const logs = await db.vehicleStatusLog.findMany({
      where: vehicleId ? { vehicleId } : {},
      include: {
        vehicle: { select: { make: true, model: true, licensePlate: true } },
        changer: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch status logs." });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.user.update({ where: { id }, data: { isActive: false } });
    res.status(200).json({ message: 'User deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to deactivate user.' });
  }
};

export const reactivateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.user.update({ where: { id }, data: { isActive: true } });
    res.status(200).json({ message: 'User reactivated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reactivate user.' });
  }
};