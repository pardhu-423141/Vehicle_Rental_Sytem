import { Router } from 'express';
import { registerUser,loginUser,verifyOTP , logoutUser} from '../controllers/auth.controller';

const router = Router();

// Endpoint: POST /api/auth/register
router.post('/register', registerUser);

// Endpoint: POST /api/auth/login
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/logout', logoutUser);
export default router;