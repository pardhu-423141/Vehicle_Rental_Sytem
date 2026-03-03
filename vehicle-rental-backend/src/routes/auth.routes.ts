import { Router } from 'express';
import { registerUser } from '../controllers/auth.controller';

const router = Router();

// Endpoint: POST /api/auth/register
router.post('/register', registerUser);

export default router;