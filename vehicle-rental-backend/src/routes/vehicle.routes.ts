import { Router } from 'express';
import { authenticate, authorize, isAdmin } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import { addVehicle, updateVehicle, removeVehicle, getVehicles, getVehicleById, getVehicleHistory } from '../controllers/vehicle.controller';

const router = Router();

// ANY logged-in user can see available vehicles (Filtered in controller)
router.get('/', authenticate, getVehicles);

// 🚨 THE FIX: ONLY Admin can add vehicles now!
router.post(
  '/add', 
  authenticate, 
  authorize([Role.ADMIN]), // <-- Removed VEHICLE_MANAGER
  addVehicle
);

// Both can update, BUT we will add a security check in the controller!
router.put(
  '/update/:id', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  updateVehicle
);

router.delete('/remove/:id', authenticate, isAdmin, removeVehicle);
router.get('/:id', authenticate, getVehicleById);
router.get('/:id/history', authenticate, getVehicleHistory);
export default router;