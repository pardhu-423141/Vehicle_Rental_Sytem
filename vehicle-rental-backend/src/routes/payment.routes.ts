import { Router } from 'express';
import {
  createRazorpayOrder,
  razorpayWebhook
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected: requires logged-in user for req.user.id ownership checks
router.post('/razorpay/create-order', authenticate, createRazorpayOrder);

// Webhook: Razorpay server-to-server callbacks, no user cookie
// Accept both POST (real webhook) and GET (ngrok/browser health/manual testing)
router.post('/razorpay/webhook', razorpayWebhook);
router.get('/razorpay/webhook', (_req, res) => res.status(200).json({ ok: true }));


export default router;


