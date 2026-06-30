import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import { UserPayload } from '../types'; // Import the interface we created above

// 1. General Authentication (Checks if user is logged in)
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token || req.header('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ message: "Authentication required: Please log in" });
  }

  try {
    const decoded = verifyToken(token) as UserPayload;
    req.user = decoded; // Now properly typed
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

// 2. Role Authorization (Checks if user has the right role)
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access Denied: Requires one of these roles: [${allowedRoles.join(", ")}]` 
      });
    }

    next();
  };
};

// 3. Admin Shortcut (Specifically for your vehicle removal requirement)
export const isAdmin = authorize([Role.ADMIN]);