import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false'; // true for 465, false for 587
const SMTP_USER = process.env.SMTP_USER || 'fluentarisee@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'KJMotivational2026';
export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || 'fluentarisee@gmail.com';
export const SITE_URL =
  process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://fluentarise.com';

let transporterInstance: nodemailer.Transporter | null = null;

export function getMailTransporter(): nodemailer.Transporter {
  if (transporterInstance) return transporterInstance;

  transporterInstance = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporterInstance;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: string;
}

/**
 * Safely send an email without throwing uncaught exceptions.
 * Diagnoses Google App Password requirements if 535-5.7.8 occurs.
 */
export async function sendMailSafe(options: {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
  replyTo?: string;
}): Promise<SendMailResult> {
  try {
    const transporter = getMailTransporter();
    const mailOptions = {
      from: `"FluentaRise Academy" <${SMTP_USER}>`,
      to: options.to,
      replyTo: options.replyTo || SMTP_USER,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] "${options.subject}" sent to ${options.to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    const isBadCredentials =
      err.code === 'EAUTH' ||
      (err.message && err.message.includes('535-5.7.8')) ||
      (err.response && err.response.includes('BadCredentials'));

    if (isBadCredentials) {
      console.warn(
        `[EMAIL AUTH NOTICE] Gmail SMTP rejected credentials for "${SMTP_USER}". ` +
        `Google requires an App Password (16 letters generated from Google Account > Security > 2-Step Verification > App Passwords) ` +
        `instead of your regular login password. Please configure SMTP_PASS in .env with your Google App Password.`
      );
    } else {
      console.error(`[EMAIL ERROR] Failed to send email to ${options.to}:`, err.message || err);
    }

    return {
      success: false,
      error: err.message || 'Failed to dispatch email',
      code: isBadCredentials ? 'GOOGLE_APP_PASSWORD_REQUIRED' : err.code || 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Clean RWF currency formatter for email HTML
 */
export function formatRwfEmail(val: number): string {
  try {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(val);
  } catch {
    return `${val.toLocaleString()} RWF`;
  }
}

/**
 * Generates a unified, beautiful, responsive HTML email wrapper with FluentaRise branding
 */
export function renderEmailLayout(params: {
  title: string;
  badge?: string;
  badgeColor?: string;
  contentHtml: string;
  cta?: { label: string; url: string };
  footerNote?: string;
}): string {
  const { title, badge, badgeColor = '#0284c7', contentHtml, cta, footerNote } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    a { color: #0284c7; text-decoration: none; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
    .email-header { background: linear-gradient(135deg, #002B49 0%, #001A2C 100%); padding: 36px 30px; text-align: center; border-bottom: 3px solid #00A3E0; }
    .email-body { padding: 36px 32px; color: #334155; line-height: 1.65; font-size: 15px; }
    .email-footer { background-color: #f8fafc; padding: 26px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    .btn { display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-align: center; text-decoration: none; margin: 18px 0; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); }
    .badge { display: inline-block; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .card-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .table-details { width: 100%; font-size: 14px; }
    .table-details td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .table-details tr:last-child td { border-bottom: none; }
    .td-label { color: #64748b; font-weight: 500; }
    .td-val { color: #0f172a; font-weight: 600; text-align: right; }
  </style>
</head>
<body>
  <div style="background-color: #f1f5f9; padding: 40px 15px;">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">
          Fluenta<span style="color: #00A3E0;">Rise</span> Academy
        </div>
        <div style="color: #94a3b8; font-size: 13px; margin-top: 6px; font-weight: 500;">
          Elevate Your Language & Professional Excellence
        </div>
      </div>

      <!-- Main Body -->
      <div class="email-body">
        ${badge ? `<div style="text-align: left;"><span class="badge" style="background-color: ${badgeColor}18; color: ${badgeColor}; border: 1px solid ${badgeColor}40;">${badge}</span></div>` : ''}
        <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 16px 0; line-height: 1.3;">
          ${title}
        </h1>

        ${contentHtml}

        ${cta ? `
          <div style="text-align: center; margin: 28px 0 16px 0;">
            <a href="${cta.url}" class="btn" target="_blank">
              ${cta.label} &rarr;
            </a>
          </div>
        ` : ''}

        ${footerNote ? `
          <div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #e2e8f0; font-size: 13px; color: #64748b;">
            ${footerNote}
          </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">FluentaRise Academy Rwanda</p>
        <p style="margin: 0 0 6px 0;">Opposite MIC Building, KN 2 Ave, Kigali, Rwanda</p>
        <p style="margin: 0 0 12px 0;">
          Phone: <a href="tel:+250795041000" style="color: #0284c7;">+250 795 041 000</a> &bull;
          Email: <a href="mailto:fluentarisee@gmail.com" style="color: #0284c7;">fluentarisee@gmail.com</a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} FluentaRise Academy. All rights reserved. You received this email regarding your account or order activities on FluentaRise.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
