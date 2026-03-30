import { Router } from 'express';
import { Role } from '@prisma/client'; 
import { authenticate, authorize } from '../middleware/auth.middleware';

// Clean, single import statement!
import { 
  getDashboardStats, 
  getKycQueue, 
  approveKyc, 
  rejectKyc,
  getAllUsers 
} from '../controllers/userManagerController';

const router = Router();

// 🚨 Apply the team's middleware to SECURE ALL routes in this file
router.use(authenticate); 
router.use(authorize([Role.USER_MANAGER, Role.ADMIN])); 

// Define the endpoints
router.get('/dashboard', getDashboardStats);
router.get('/kyc-queue', getKycQueue);
router.put('/kyc-approve/:userId', approveKyc);
router.put('/kyc-reject/:userId', rejectKyc);
router.get('/users', getAllUsers);

export default router;