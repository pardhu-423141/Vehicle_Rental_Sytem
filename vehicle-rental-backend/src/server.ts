import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// 1. Import Routes
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicleRoutes';
import bookingRoutes from './routes/booking.routes';
import reviewRoutes from './routes/review.routes';
import kycRoutes from './routes/kyc.routes';
import adminRoutes from './routes/admin.routes'; // ✅ NEW

// 2. Import Database Connection and Cron Tasks
import './config/db';   // Ensures DB connection is tested on startup
import './config/cron'; // Starts the 6-month auto-delete background task

const app = express();

// 3. Middlewares
app.use(cors({ 
  origin: 'http://localhost:5173', // Your Vite/React frontend port
  credentials: true                // Required to allow auth_token cookies
}));
app.use(express.json());
app.use(cookieParser());

// 4. Register API Routes
app.use('/api/auth', authRoutes);         // Login & Registration
app.use('/api/vehicles', vehicleRoutes);  // Vehicle Inventory (Admin/User)
app.use('/api/bookings', bookingRoutes);  // Rental & Availability Logic
app.use('/api/reviews', reviewRoutes);    // Feedback & Ratings
app.use('/api/kyc', kycRoutes);           // Identity Verification
app.use('/api/admin', adminRoutes);

// 5. Global Error Handler (Optional but Recommended)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🚀 Server is flying at http://localhost:${PORT}
  🛠  Environment: ${process.env.NODE_ENV || 'development'}
  📅 Cron tasks initialized
  `);
});