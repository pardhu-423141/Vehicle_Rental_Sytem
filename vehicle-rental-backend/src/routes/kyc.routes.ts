import { Router } from 'express';
import { submitKYC, getMyKYCStatus, updateKYCStatus,getAllKYCSubmissions } from '../controllers/kyc.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';


const kycFields = upload.fields([
  { name: 'idImageFront', maxCount: 1 },
  { name: 'idImageBack', maxCount: 1 }
]);
const router = Router();

/**
 * @route   POST /api/kyc/submit
 * @desc    Submit KYC documents (ID type, Number, Image URL)
 * @access  Private (Authenticated Users)
 */
router.post('/submit', authenticate, kycFields, submitKYC);

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
// This makes the full URL: PATCH /api/admin/kyc/review/:userId
router.patch('/review/:userId', authenticate, isAdmin, updateKYCStatus);
// TEMPORARY: Remove 'authenticate' and 'isAdmin' to test connectivity
router.get('/submissions', getAllKYCSubmissions);
export default router;