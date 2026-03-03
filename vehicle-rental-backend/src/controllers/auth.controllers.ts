import { Request, Response } from 'express';
import argon2 from 'argon2';
import { signToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  const { email, password, role, name } = req.body;

  // 1. Hash the password
  const hashedPassword = await argon2.hash(password);

  // 2. SAVE TO DB 
  // const newUser = await db.user.create({ data: { email, password: hashedPassword, role, name } });

  res.status(201).json({ message: "User registered successfully" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Find user in DB & Verify password
  // const user = await db.user.findUnique({ where: { email } });
  // const isValid = await argon2.verify(user.password, password);

  // 2. Generate Token
  const token = signToken({ id: "user_id_here", role: "ADMIN" }); // Use real user data here

  // 3. Set Cookie (The Secure Way)
  res.cookie('auth_token', token, {
    httpOnly: true,     // Protects against XSS (Frontend JS can't touch this)
    secure: false,      // Set to true in production (HTTPS only)
    sameSite: 'lax',    // Protects against CSRF
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.json({ message: "Logged in successfully", role: "ADMIN" });
};