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

const getRoleLabel = (role: InviteRole) => {
  switch (role) {
    case "SalesManager":
      return "Sales Manager";
    case "BusinessDevelopmentManager":
      return "Business Development Manager";
    default:
      return "Sales Rep";
  }
};

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
    const roleLabel = getRoleLabel(role);

    const inviteHtml = `
      <div style="margin:0;padding:0;background-color: #ffffff00;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff00;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px;width:100%;background-color:#050505;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:22px 28px;border-bottom:1px solid #1f1f1f;background-color:#000000;">
                    <div style="font-size:12px;letter-spacing:2px;color:#8c8c8c;text-transform:uppercase;margin-bottom:6px;">Revenue Assault</div>
                    <div style="font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;">You're Invited</div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:26px 28px 8px 28px;">
                    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#d9d9d9;">
                      You’ve been invited to join your organisation workspace on <strong style="color:#ffffff;">Revenue Assault</strong>.
                    </p>
                    <p style="margin:0 0 22px 0;font-size:14px;line-height:1.7;color:#a6a6a6;">
                      Use the secure link below to register and be automatically assigned to the correct tenant and role.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 28px 12px 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #2f2f2f;border-radius:8px;background-color:#0b0b0b;">
                      <tr>
                        <td style="padding:14px 16px;">
                          <div style="font-size:11px;letter-spacing:1px;color:#8c8c8c;text-transform:uppercase;margin-bottom:4px;">Assigned Role</div>
                          <div style="font-size:14px;color:#52c41a;font-weight:700;line-height:1.5;">${roleLabel}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 28px 4px 28px;" align="left">
                    <a href="${inviteUrl}" style="display:inline-block;padding:12px 22px;background-color:#52c41a;color:#000000;text-decoration:none;font-size:14px;font-weight:700;border-radius:6px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>


                <tr>
                  <td style="padding:16px 28px;border-top:1px solid #1f1f1f;background-color:#030303;">
                    <p style="margin:0;font-size:11px;line-height:1.7;color:#666666;">
                      If you weren’t expecting this email, you can safely ignore it.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const inviteText = `
You're invited to join Revenue Assault.

Assigned Role: ${roleLabel}

Register using this link:
${inviteUrl}

If you did not expect this invite, please ignore this email.
    `.trim();

    await transporter.sendMail({
      from: process.env.ZEPTO_SENDER || '"Revenue Assault" <noreply@unihub.co.za>',
      to: email,
      subject: "You're invited to join Revenue Assault",
      text: inviteText,
      html: inviteHtml,
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
