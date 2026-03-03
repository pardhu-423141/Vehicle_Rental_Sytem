import { Request, Response } from 'express';
import { db } from '../config/db'; // This is your PrismaClient instance
import argon2 from 'argon2';

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
        role: role || 'USER', // Prisma uses the Enum we defined in schema.prisma
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