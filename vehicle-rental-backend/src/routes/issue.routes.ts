import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createIssue,
  getAllIssues,
  getManagerIssues,
  updateIssue,
  deleteIssue
} from '../controllers/issue.controller';

const router = Router();

// Admin: create and view all issues
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN]),
  createIssue
);

router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN]),
  getAllIssues
);

router.delete(
  '/:id',
  authenticate,
  authorize([Role.ADMIN]),
  deleteIssue
);

// Manager: view own inbox and respond
router.get(
  '/inbox',
  authenticate,
  authorize([Role.VEHICLE_MANAGER, Role.ADMIN]),
  getManagerIssues
);

router.put(
  '/:id',
  authenticate,
  authorize([Role.VEHICLE_MANAGER, Role.ADMIN]),
  updateIssue
);

export default router;
