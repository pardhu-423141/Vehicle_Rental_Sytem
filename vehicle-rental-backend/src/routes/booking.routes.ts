import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking, getBookingHistory } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isVerifiedUser } from '../middleware/kyc.middleware';

const router = Router();

router.post('/', authenticate, isVerifiedUser, createBooking);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/history', authenticate, getBookingHistory);
router.patch('/cancel/:id', authenticate, cancelBooking);

export default router;
