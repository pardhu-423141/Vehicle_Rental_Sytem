import { Router } from 'express';
import { submitKYC, getMyKYCStatus, updateKYCStatus } from '../controllers/kyc.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/kyc/submit
 * @desc    Submit KYC documents (ID type, Number, Image URL)
 * @access  Private (Authenticated Users)
 */
router.post('/submit', authenticate, submitKYC);

/**
 * @route   GET /api/kyc/status
 * @desc    Get the KYC submission status for the logged-in user
 * @access  Private
 */
router.get('/status', authenticate, getMyKYCStatus);

/**
 * @route   PATCH /api/kyc/review/:userId
 * @desc    Approve or Reject a user's KYC (Admin Only)
 * @access  Private (Admin)
 */
router.patch('/review/:userId', authenticate, isAdmin, updateKYCStatus);

export default router;