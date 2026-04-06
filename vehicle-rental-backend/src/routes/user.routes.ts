import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { 
  getProfile, 
  updateProfile, 
  handleKYC 
} from '../controllers/user.controller';

import { 
  addReview, 
  getMyReviews 
} from '../controllers/review.controller';


const router = Router();


// Cast the multer middleware to any or RequestHandler to bypass the version mismatch
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
/**
 * IDENTITY & KYC
 * These routes allow the user to manage their own personal data.
 */
// 1. See profile (including KYC status)
router.get('/profile', authenticate, getProfile);

// 2. Update profile name
router.patch('/profile', authenticate, updateProfile);

// 3. Upload or Re-upload KYC (Uses upsert logic in controller)
router.post('/kyc', authenticate, authorize(['USER']),upload.fields([
    { name: 'idImageFront', maxCount: 1 }, 
    { name: 'idImageBack', maxCount: 1 }
  ]), handleKYC);


/**
 * VEHICLES & BOOKINGS
 * Discovery and rental lifecycle.
 */



/**
 * FEEDBACK
 * User reviews and history of reviews.
 */
// 7. Add a review for a completed rental
router.post('/reviews', authenticate, authorize(['USER']), addReview);

// 8. See all my reviews in one place
router.get('/reviews/all', authenticate, authorize(['USER']), getMyReviews);

export default router;