import { Router } from 'express';
import { getStaff, createStaff } from '../controllers/staff.controller';
import { registerUser } from '../controllers/auth.controller';
// import { verifyAdmin } from '../middleware/auth'; // Optional: add auth middleware here

const router = Router();

router.get('/', getStaff);
router.post('/', createStaff);

export default router;