import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password too short"),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(["USER", "USER_MANAGER", "VEHICLE_MANAGER", "ADMIN"]).default("USER"),
  
});

export type RegisterInput = z.infer<typeof RegisterSchema>;