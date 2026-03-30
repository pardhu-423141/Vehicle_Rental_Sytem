import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import { 
  getOperationsQueue, 
  processHandover, 
  processReturn,
  getMaintenanceTasks, // ⚡ ADD THIS
  updateMaintenanceTask // ⚡ ADD THIS
} from '../controllers/operations.controller';

const router = Router();

// Secure these routes so only Admins and Vehicle Managers can process keys!
router.get(
  '/queue', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  getOperationsQueue
);

router.put(
  '/handover/:bookingId', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  processHandover
);

router.put(
  '/return/:bookingId', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  processReturn
);

// --- Maintenance Routes ---
router.get(
  '/maintenance', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  getMaintenanceTasks
);

router.put(
  '/maintenance/:taskId', 
  authenticate, 
  authorize([Role.ADMIN, Role.VEHICLE_MANAGER]), 
  updateMaintenanceTask
);

export default router;