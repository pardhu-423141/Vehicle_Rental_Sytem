import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const protect = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;

    if (!token) return res.status(401).json({ message: "Not logged in" });

    try {
      const decoded = verifyToken(token) as any;
      
      // Check if user's role is allowed for this specific route
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
      }

      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid session" });
    }
  };
};