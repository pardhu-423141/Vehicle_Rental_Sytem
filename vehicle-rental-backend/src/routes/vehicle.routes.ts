import { Router } from 'express';
import { 
  addVehicle, 
  updateVehicle, 
  removeVehicle, 
  getVehicles 
} from '../controllers/vehicle.controller';
import { authenticate, authorize, isAdmin } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// ANY logged-in user can see available vehicles
router.get('/', authenticate, getVehicles);

// Only ADMIN or VEHICLE_MANAGER can add or update
router.post(
  '/add', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  addVehicle
);

router.put(
  '/update/:id', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  updateVehicle
);

// Only ADMIN can remove (Soft Delete) as per your requirement
router.delete('/remove/:id', authenticate, isAdmin, removeVehicle);


export default router;