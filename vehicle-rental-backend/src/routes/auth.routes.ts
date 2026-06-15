import { Router } from 'express';
import { loginUser, registerUser, verifyOTP, logoutUser, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
