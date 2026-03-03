import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Everyone can see vehicles
router.get('/available', (req, res) => { /* ... */ });

// Only ADMIN can add a new vehicle
router.post('/add', protect(['ADMIN']), (req, res) => {
  res.json({ message: "Vehicle added by Admin" });
});

// Only VEHICLE_MANAGER or ADMIN can update maintenance status
router.patch('/status/:id', protect(['VEHICLE_MANAGER', 'ADMIN']), (req, res) => {
  res.json({ message: "Status updated" });
});

export default router;