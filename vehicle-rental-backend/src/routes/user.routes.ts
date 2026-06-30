import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { getProfile, updateProfile, handleKYC } from '../controllers/user.controller';
import { addReview, getMyReviews } from '../controllers/review.controller';

const router = Router();

// Profile
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);

// KYC upload (single route — no duplicate)
router.post(
  '/kyc',
  authenticate,
  authorize(['USER']),
  (upload.fields([
    { name: 'idImageFront', maxCount: 1 },
    { name: 'idImageBack', maxCount: 1 }
  ]) as any),
  handleKYC
);

// Reviews
router.post('/reviews', authenticate, authorize(['USER']), addReview);
router.get('/reviews/all', authenticate, authorize(['USER']), getMyReviews);

export default router;
