import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import 'dotenv/config';
import { initSocket } from './utils/socket';

// Routes
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import bookingRoutes from './routes/booking.routes';
import reviewRoutes from './routes/review.routes';
import kycRoutes from './routes/kyc.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import userManagerRoutes from './routes/userManagerRoutes';
import operationsRoutes from './routes/operationsRoutes';
import issueRoutes from './routes/issue.routes';
import staffRoutes from './routes/staff.routes';
import couponRoutes from './routes/coupon.routes';
import paymentRoutes from './routes/payment.routes';

import './config/db';
import './config/cron';

const app = express();
const httpServer = http.createServer(app);

// Init Socket.io
initSocket(httpServer);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString(); // Saves the raw string for Razorpay webhooks
  }
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/staff', staffRoutes);
app.use('/api/user-manager', userManagerRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
