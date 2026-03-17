import { Router } from 'express';
import { 
  getAllUsers, 
  updateUserRole, 
  getDashboardStats,
  toggleMaintenance,  
  getVehicleArchive,  
  restoreVehicle,     
  getAllBookings,
  getRevenueReports, 
  getRecentTransactions    
} from '../controllers/admin.controller';

import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Apply global protection: Only Admins can access any route in this file
router.use(authenticate, isAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get high-level system statistics
 */
router.get('/stats', getDashboardStats);

// Fleet & Maintenance Management (NEW)
router.patch('/vehicles/maintenance', toggleMaintenance); // Bulk status update
router.get('/vehicles/archive', getVehicleArchive);       // See soft-deleted cars
router.patch('/vehicles/restore/:id', restoreVehicle);    // Restore soft-deleted car

/**
 * @route   GET /api/admin/users
 * @desc    Get list of all users
 */
router.get('/users', getAllUsers);

/**
 * @route   PATCH /api/admin/users/role/:id
 * @desc    Change a user's role
 */
router.patch('/users/role/:id', updateUserRole);

// Global Booking Oversight (NEW)
router.get('/bookings', getAllBookings);

// Financial & Revenue Reports (NEW)
router.get('/reports/revenue', getRevenueReports);
router.get('/reports/transactions', getRecentTransactions);

export default router;