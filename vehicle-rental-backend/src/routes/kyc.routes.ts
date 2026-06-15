import { Router } from 'express';
import { submitKYC, getMyKYCStatus, updateKYCStatus, getAllKYCSubmissions } from '../controllers/kyc.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

const kycFields = upload.fields([
  { name: 'idImageFront', maxCount: 1 },
  { name: 'idImageBack', maxCount: 1 }
]);

// Submit KYC documents (authenticated users only)
router.post('/submit', authenticate, kycFields, submitKYC);

// Get own KYC status
router.get('/status', authenticate, getMyKYCStatus);

// Admin: approve or reject a user's KYC
router.patch('/review/:userId', authenticate, isAdmin, updateKYCStatus);

// Admin: get all KYC submissions
router.get('/submissions', authenticate, isAdmin, getAllKYCSubmissions);

export default router;
