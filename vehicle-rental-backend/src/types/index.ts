import { Role } from '@prisma/client';



export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

// This extends the global Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}