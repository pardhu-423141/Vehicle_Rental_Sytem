import { Router } from 'express';
import { 
  addReview, 
  getVehicleReviews, 
  deleteReview 
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/reviews/:vehicleId
 * @desc    Get all reviews for a specific vehicle
 * @access  Public (No authentication required to view reviews)
 */
router.get('/:vehicleId', getVehicleReviews);

/**
 * @route   POST /api/reviews
 * @desc    Add a new review for a vehicle
 * @access  Private (Requires authentication)
 */
router.post('/', authenticate, addReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (Handled in controller: Author or Admin only)
 */
router.delete('/:id', authenticate, deleteReview);

export default router;