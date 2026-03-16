import { Request, Response } from 'express';
import { db } from '../config/db'; 
import argon2 from 'argon2';
import jwt from 'jsonwebtoken'; // You'll need to install this: npm install jsonwebtoken

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-2026';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // 2. Verify password
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 3. Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Set Cookie
    res.cookie('auth_token', token, {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ... keep your registerUser function here as well ...
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    // Prisma uses 'findUnique' which is very fast for @unique fields like email
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 2. Hash the password
    const hashedPassword = await argon2.hash(password);

    // 3. Insert into Database
    // Prisma's 'create' handles the insertion and returns the object
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER', // Prisma uses the Enum we defined in schema.prisma.hardcoded to 'USER' for all new registrations
      },
      // We 'select' only what we want to send back (safety first, no password!)
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      }
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};