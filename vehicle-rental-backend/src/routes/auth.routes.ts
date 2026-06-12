import { Router } from 'express';
import { loginUser, registerUser, verifyOTP, logoutUser } from '../controllers/auth.controller';

const router = Router();

// NOTE: This file must only contain authentication routes.
// Cookie-based auth is handled by the backend controller + auth.middleware.

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/logout', logoutUser);

export default router;

