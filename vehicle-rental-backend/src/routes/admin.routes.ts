import { Router } from 'express';
import { 
  getAllUsers, 
  getStaff, // ⚡ ADDED: Imported getStaff
  updateUserRole, 
  getDashboardStats,
  toggleMaintenance,  
  getVehicleArchive,  
  restoreVehicle,     
  getAllBookings,
  getRevenueReports, 
  getRecentTransactions  ,
  getMaintenanceTasks, resolveMaintenance, 
  deactivateUser,reactivateUser
} from '../controllers/admin.controller';

import { getVehicles, addVehicle, removeVehicle, updateVehicle } from '../controllers/vehicle.controller';

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
 * @route   GET /api/admin/staff
 * @desc    Get list of all staff members (Admins, Managers)
 */
// ⚡ ADDED: The route your frontend is trying to call
router.get('/staff', getStaff);

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

router.get('/vehicles', getVehicles);
router.post('/vehicles', addVehicle);
router.delete('/vehicles/:id', removeVehicle); 
router.put('/vehicles/:id', updateVehicle);

// 1. Add the GET route for the Hub to fetch vehicles
router.get('/maintenance', getMaintenanceTasks); 

// 2. Add the PUT route for the "Mark as Available" button
router.put('/maintenance/:id/resolve', resolveMaintenance);

// This is your existing one (keep it if you use it for bulk updates)
router.patch('/vehicles/maintenance', toggleMaintenance);
router.patch('/users/:id/deactivate', deactivateUser);
router.patch('/users/:id/reactivate', reactivateUser);
export default router;