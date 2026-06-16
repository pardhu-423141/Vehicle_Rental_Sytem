import { Request, Response } from 'express';
import { Role, IssueStatus } from '@prisma/client';
import { db } from '../config/db';
import { notifyUser } from '../utils/socket';
import nodemailer from 'nodemailer';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: Role };
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendIssueEmail = async (toEmail: string, toName: string, subject: string, bodyHtml: string) => {
  try {
    await transporter.sendMail({
      from: '"DriveAdmin System" <noreply@rentalsystem.com>',
      to: toEmail, subject, html: bodyHtml
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

// 1. CREATE ISSUE (Admin only)
export const createIssue = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?.id as string;
  const { title, description, vehicleId, assignedManagerId } = req.body;

  try {
    const [vehicle, manager] = await Promise.all([
      db.vehicle.findUnique({ where: { id: vehicleId }, select: { make: true, model: true, licensePlate: true } }),
      db.user.findUnique({ where: { id: assignedManagerId }, select: { name: true, email: true } })
    ]);

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
    if (!manager) return res.status(404).json({ message: 'Manager not found.' });

    const issue = await db.issue.create({
      data: {
        title, description, vehicleId,
        reportedByAdminId: adminId,
        assignedManagerId,
        status: IssueStatus.OPEN
      },
      include: {
        vehicle: { select: { make: true, model: true, licensePlate: true } },
        reportedByAdmin: { select: { name: true } },
        assignedManager: { select: { name: true, email: true } }
      }
    });

    // ── Real-time notification to the assigned manager ──
    notifyUser(assignedManagerId, 'issue:assigned', {
      type: 'issue',
      title: `New Issue: ${title}`,
      message: `You've been assigned an issue for ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}).`,
      issueId: issue.id,
      vehicle: `${vehicle.make} ${vehicle.model}`,
      plate: vehicle.licensePlate,
      timestamp: new Date().toISOString()
    });

    // Email notification
    await sendIssueEmail(
      manager.email, manager.name,
      `[Action Required] New Issue: ${title}`,
      `<div style="font-family:sans-serif;max-width:600px;"><h2 style="color:#ef4444;">New Issue Assigned</h2><p>Hello <strong>${manager.name}</strong>,</p><p>Issue: <strong>${title}</strong></p><p>Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})</p><p>Details: ${description}</p></div>`
    );

    res.status(201).json(issue);
  } catch (error) {
    console.error('Create Issue Error:', error);
    res.status(500).json({ message: 'Failed to create issue.' });
  }
};

// 2. GET ALL ISSUES (Admin)
export const getAllIssues = async (req: AuthenticatedRequest, res: Response) => {
  const { status, vehicleId } = req.query;
  try {
    const where: any = {};
    if (status) where.status = status as IssueStatus;
    if (vehicleId) where.vehicleId = vehicleId as string;

    const issues = await db.issue.findMany({
      where,
      include: {
        vehicle: { select: { make: true, model: true, licensePlate: true } },
        reportedByAdmin: { select: { name: true } },
        assignedManager: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch issues.' });
  }
};

// 3. GET ISSUES FOR MANAGER
export const getManagerIssues = async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user?.id;
  try {
    const issues = await db.issue.findMany({
      where: { assignedManagerId: managerId },
      include: {
        vehicle: { select: { make: true, model: true, licensePlate: true } },
        reportedByAdmin: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your issues.' });
  }
};

// 4. UPDATE ISSUE STATUS (Manager)
export const updateIssue = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, response } = req.body;
  const managerId = req.user?.id;

  try {
    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        reportedByAdmin: { select: { name: true, email: true } },
        vehicle: { select: { make: true, model: true, licensePlate: true } }
      }
    });

    if (!issue) return res.status(404).json({ message: 'Issue not found.' });

    if (issue.assignedManagerId !== managerId && req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'Not authorized to update this issue.' });
    }

    const updated = await db.issue.update({
      where: { id },
      data: { status: status as IssueStatus, response: response || issue.response },
      include: {
        vehicle: { select: { make: true, model: true, licensePlate: true } },
        reportedByAdmin: { select: { name: true } },
        assignedManager: { select: { name: true } }
      }
    });

    if (status === IssueStatus.ACKNOWLEDGED || status === IssueStatus.RESOLVED) {
      await sendIssueEmail(
        issue.reportedByAdmin.email, issue.reportedByAdmin.name,
        `Issue ${status === IssueStatus.RESOLVED ? 'Resolved' : 'Acknowledged'}: ${issue.title}`,
        `<div style="font-family:sans-serif;"><h2>Issue ${status}</h2><p>Issue: ${issue.title}</p><p>Vehicle: ${issue.vehicle.make} ${issue.vehicle.model}</p>${response ? `<p>Manager response: ${response}</p>` : ''}</div>`
      );
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update issue.' });
  }
};

// 5. DELETE ISSUE
export const deleteIssue = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    await db.issue.delete({ where: { id } });
    res.status(200).json({ message: 'Issue deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete issue.' });
  }
};
