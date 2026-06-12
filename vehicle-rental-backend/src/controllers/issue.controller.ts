import { Request, Response } from 'express';
import { PrismaClient, Role, IssueStatus } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendIssueEmail = async (
  toEmail: string,
  toName: string,
  subject: string,
  bodyHtml: string
) => {
  try {
    await transporter.sendMail({
      from: '"DriveAdmin System" <noreply@rentalsystem.com>',
      to: toEmail,
      subject,
      html: bodyHtml
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
};

// 1. CREATE ISSUE (Admin only)
export const createIssue = async (req: AuthenticatedRequest, res: Response) => {
  const adminId = req.user?.id as string;
  const { title, description, vehicleId, assignedManagerId } = req.body;

  try {
    const [vehicle, manager] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { make: true, model: true, licensePlate: true } }),
      prisma.user.findUnique({ where: { id: assignedManagerId }, select: { name: true, email: true } })
    ]);

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    if (!manager) return res.status(404).json({ message: "Manager not found." });

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        vehicleId,
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

    await sendIssueEmail(
      manager.email,
      manager.name,
      `[Action Required] New Issue: ${title}`,
      `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #ef4444;">New Issue Assigned to You</h2>
          <p>Hello <strong>${manager.name}</strong>,</p>
          <p>A new issue has been raised for a vehicle under your management:</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding:8px; font-weight:bold; color:#666;">Issue</td><td style="padding:8px;">${title}</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#666;">Vehicle</td><td style="padding:8px;">${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})</td></tr>
            <tr><td style="padding:8px; font-weight:bold; color:#666;">Details</td><td style="padding:8px;">${description}</td></tr>
          </table>
          <p>Please log in to your dashboard and acknowledge this issue as soon as possible.</p>
          <p style="color:#999; font-size:12px;">This is an automated notification from DriveAdmin System.</p>
        </div>
      `
    );

    res.status(201).json(issue);
  } catch (error) {
    console.error("Create Issue Error:", error);
    res.status(500).json({ message: "Failed to create issue." });
  }
};

// 2. GET ALL ISSUES (Admin view — all issues)
export const getAllIssues = async (req: AuthenticatedRequest, res: Response) => {
  const { status, vehicleId } = req.query;

  try {
    const where: any = {};
    if (status) where.status = status as IssueStatus;
    if (vehicleId) where.vehicleId = vehicleId as string;

    const issues = await prisma.issue.findMany({
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
    console.error("Fetch Issues Error:", error);
    res.status(500).json({ message: "Failed to fetch issues." });
  }
};

// 3. GET ISSUES FOR MANAGER (Manager's inbox)
export const getManagerIssues = async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user?.id;

  try {
    const issues = await prisma.issue.findMany({
      where: { assignedManagerId: managerId },
      include: {
        vehicle: { select: { make: true, model: true, licensePlate: true } },
        reportedByAdmin: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(issues);
  } catch (error) {
    console.error("Fetch Manager Issues Error:", error);
    res.status(500).json({ message: "Failed to fetch your issues." });
  }
};

// 4. UPDATE ISSUE STATUS + RESPONSE (Manager action)
export const updateIssue = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, response } = req.body;
  const managerId = req.user?.id;

  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        reportedByAdmin: { select: { name: true, email: true } },
        vehicle: { select: { make: true, model: true, licensePlate: true } }
      }
    });

    if (!issue) return res.status(404).json({ message: "Issue not found." });

    if (issue.assignedManagerId !== managerId && req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ message: "You are not authorized to update this issue." });
    }

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        status: status as IssueStatus,
        response: response || issue.response
      },
      include: {
        vehicle: { select: { make: true, model: true, licensePlate: true } },
        reportedByAdmin: { select: { name: true } },
        assignedManager: { select: { name: true } }
      }
    });

    if (status === IssueStatus.ACKNOWLEDGED || status === IssueStatus.RESOLVED) {
      await sendIssueEmail(
        issue.reportedByAdmin.email,
        issue.reportedByAdmin.name,
        `Issue ${status === IssueStatus.RESOLVED ? 'Resolved' : 'Acknowledged'}: ${issue.title}`,
        `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: ${status === IssueStatus.RESOLVED ? '#22c55e' : '#3b82f6'};">
              Issue ${status === IssueStatus.RESOLVED ? 'Resolved' : 'Acknowledged'}
            </h2>
            <p>Hello <strong>${issue.reportedByAdmin.name}</strong>,</p>
            <p>The manager has updated the status of your issue:</p>
            <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding:8px; font-weight:bold; color:#666;">Issue</td><td style="padding:8px;">${issue.title}</td></tr>
              <tr><td style="padding:8px; font-weight:bold; color:#666;">Vehicle</td><td style="padding:8px;">${issue.vehicle.make} ${issue.vehicle.model} (${issue.vehicle.licensePlate})</td></tr>
              <tr><td style="padding:8px; font-weight:bold; color:#666;">New Status</td><td style="padding:8px; font-weight:bold;">${status}</td></tr>
              ${response ? `<tr><td style="padding:8px; font-weight:bold; color:#666;">Manager Response</td><td style="padding:8px;">${response}</td></tr>` : ''}
            </table>
          </div>
        `
      );
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Issue Error:", error);
    res.status(500).json({ message: "Failed to update issue." });
  }
};

// 5. DELETE ISSUE (Admin only)
export const deleteIssue = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.issue.delete({ where: { id } });
    res.status(200).json({ message: "Issue deleted." });
  } catch (error) {
    console.error("Delete Issue Error:", error);
    res.status(500).json({ message: "Failed to delete issue." });
  }
};
