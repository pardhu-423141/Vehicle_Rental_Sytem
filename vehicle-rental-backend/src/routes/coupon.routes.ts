import { Router } from 'express';
import {
  getMyCoupons,
  getActiveCoupons,
  getEligibleCoupons,
  validateCoupon
} from '../controllers/coupon.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/my', getMyCoupons);           // all coupons with status (Active/Used/Expired)
router.get('/active', getActiveCoupons);   // only active coupons (for dashboard display)
router.get('/eligible', getEligibleCoupons); // active + eligible for a given amount
router.post('/validate', validateCoupon);  // validate a code + preview discount

export default router;
