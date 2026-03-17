import { Router } from 'express';
import { 
  createBooking, 
  getUserBookings, 
  cancelBooking 
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isVerifiedUser } from '../middleware/kyc.middleware';

const router = Router();

router.post('/', authenticate, isVerifiedUser, createBooking);
/**
 * @route   POST /api/bookings
 * @desc    Create a new vehicle booking
 * @access  Private (Registered users only)
 */
router.post('/', authenticate, createBooking);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get all bookings for the logged-in user
 * @access  Private
 */
router.get('/my-bookings', authenticate, getUserBookings);

/**
 * @route   PATCH /api/bookings/cancel/:id
 * @desc    Cancel a specific booking
 * @access  Private (Owner or Admin only)
 */
router.patch('/cancel/:id', authenticate, cancelBooking);

export default router;