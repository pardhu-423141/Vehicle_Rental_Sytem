import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// 1. Import Routes
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

// 2. Import Database Connection and Cron Tasks
import './config/db';
import './config/cron';

const app = express();

// 3. Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// 4. Register API Routes
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

// 5. Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
