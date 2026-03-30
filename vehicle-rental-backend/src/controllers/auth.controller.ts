import { Request, Response } from 'express';
import { db } from '../config/db';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-2026';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * REGISTER USER
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already in use and verified." });
      } else {
        // Delete the old unverified attempt to start fresh
        await db.user.delete({ where: { email } });
      }
    }

    // Generate 6-digit OTP and set 10-minute expiry
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const hashedPassword = await argon2.hash(password);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: false,
      },
    });

    await transporter.sendMail({
      from: '"Vehicle Rental" <noreply@rentalsystem.com>',
      to: email,
      subject: "Verify Your Email",
      html: `<h3>Welcome!</h3><p>Your verification code is: <b>${otp}</b></p><p>This code expires in 10 minutes.</p>`,
    });

    return res.status(201).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * VERIFY OTP
 */
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await db.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "Invalid request." });
    }

    // 1. Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP code." });
    }

    // 2. Check if OTP is expired
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    // 3. Mark as verified and clear OTP data
    await db.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpires: null,
      },
    });

    return res.json({ message: "Email verified! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Verification failed." });
  }
};

/**
 * LOGIN USER
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // GATEKEEPER: Check if verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Account not verified. Please verify your email before logging in." 
      });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false , //process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: false, //process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.json({ message: "Logged out successfully" });
};
