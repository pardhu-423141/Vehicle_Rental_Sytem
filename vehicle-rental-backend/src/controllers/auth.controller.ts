import { Request, Response } from 'express';
import { db } from '../config/db';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET env var is required. Set it in your .env file.');
}
const JWT_SECRET = process.env.JWT_SECRET;

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
        await db.user.delete({ where: { email } });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
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

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP code." });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired. Please register again." });
    }

    await db.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpires: null },
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

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your email before logging in."
      });
    }

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, kycStatus: user.kycStatus }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
};

/**
 * LOGOUT USER
 */
export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.json({ message: "Logged out successfully" });
};

/**
 * FORGOT PASSWORD — Enumeration-safe: always returns 200
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const SAFE_RESPONSE = { message: "If that email is registered, a reset link has been sent." };

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.isVerified) {
      return res.status(200).json(SAFE_RESPONSE);
    }

    // Generate a secure token (SHA-256 of random bytes)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: '"Vehicle Rental" <noreply@rentalsystem.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family:sans-serif;max-width:600px;">
          <h2>Password Reset</h2>
          <p>You requested a password reset for your Vehicle Rental account.</p>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
          <p style="color:#999;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    return res.status(200).json(SAFE_RESPONSE);
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(200).json(SAFE_RESPONSE);
  }
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { email, token, password } = req.body;

  try {
    if (!email || !token || !password) {
      return res.status(400).json({ message: "Invalid request. All fields are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await db.user.findFirst({
      where: {
        email,
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired. Please request a new one." });
    }

    const hashedPassword = await argon2.hash(password);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Failed to reset password." });
  }
};
