import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type InviteRole = "SalesRep" | "SalesManager" | "BusinessDevelopmentManager";

const ALLOWED_ROLES: InviteRole[] = [
  "SalesRep",
  "SalesManager",
  "BusinessDevelopmentManager",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const transporter = nodemailer.createTransport({
  host: process.env.ZEPTO_SMTP_HOST || "smtp.zeptomail.com",
  port: Number(process.env.ZEPTO_SMTP_PORT || 587),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.ZEPTO_SMTP_USER,
    pass: process.env.ZEPTO_SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email as string | undefined;
    const tenantId = body?.tenantId as string | undefined;
    const role = body?.role as InviteRole | undefined;

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Valid role is required" }, { status: 400 });
    }

    if (!process.env.ZEPTO_SMTP_USER || !process.env.ZEPTO_SMTP_PASS) {
      return NextResponse.json(
        { error: "Email provider credentials are not configured" },
        { status: 500 }
      );
    }

    const appBaseUrl = process.env.INVITE_APP_BASE_URL || "http://localhost:3000";
    const inviteUrl = `${appBaseUrl}/auth?view=register&tenantId=${encodeURIComponent(
      tenantId
    )}&role=${encodeURIComponent(role)}`;

    await transporter.sendMail({
      from: process.env.ZEPTO_SENDER || '"Revenue Assault" <noreply@unihub.co.za>',
      to: email,
      subject: "You're invited to join Revenue Assault",
      html: `
        <p>Hello,</p>
        <p>You have been invited to join an organisation on Revenue Assault.</p>
        <p><strong>Tenant ID:</strong> ${tenantId}</p>
        <p><strong>Assigned Role:</strong> ${role}</p>
        <p>
          Click here to register and join your organisation:
          <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
        <p>If you did not expect this invite, you can ignore this email.</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Invite email error:", error);
    return NextResponse.json(
      { error: "Failed to send invitation email" },
      { status: 500 }
    );
  }
}
