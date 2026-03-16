import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // React port
app.use(express.json());
app.use(cookieParser());

// Use the Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));