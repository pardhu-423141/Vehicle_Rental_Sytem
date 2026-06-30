import { Router } from 'express';
import {
  getAllUsers,
  getStaff,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getDashboardStats,
  toggleMaintenance,
  getVehicleArchive,
  restoreVehicle,
  getAllBookings,
  getRevenueReports, 
  getRecentTransactions  ,
  getMaintenanceTasks, resolveMaintenance  
} from '../controllers/admin.controller';

import { getVehicles, addVehicle, removeVehicle, updateVehicle } from '../controllers/vehicle.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes protected: Admin only
router.use(authenticate, isAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Fleet management
router.get('/vehicles', getVehicles);
router.post('/vehicles', addVehicle);
router.delete('/vehicles/:id', removeVehicle);
router.put('/vehicles/:id', updateVehicle);
router.patch('/vehicles/maintenance', toggleMaintenance);
router.get('/vehicles/archive', getVehicleArchive);
router.patch('/vehicles/restore/:id', restoreVehicle);

// User management
router.get('/users', getAllUsers);
router.get('/staff', getStaff);
router.patch('/users/role/:id', updateUserRole);
router.patch('/users/:id/deactivate', deactivateUser);
router.patch('/users/:id/reactivate', reactivateUser);

// Booking oversight
router.get('/bookings', getAllBookings);

// Revenue & reports
router.get('/reports/revenue', getRevenueReports);
router.get('/reports/transactions', getRecentTransactions);

// Maintenance
router.get('/maintenance', getMaintenanceTasks);
router.put('/maintenance/:id/resolve', resolveMaintenance);

// This is your existing one (keep it if you use it for bulk updates)
router.patch('/vehicles/maintenance', toggleMaintenance);

export default router;
