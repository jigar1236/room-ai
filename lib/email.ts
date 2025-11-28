import sgMail from "@sendgrid/mail";
import { logger } from "./logger";

if (!process.env.SENDGRID_API_KEY) {
  logger.warn("SENDGRID_API_KEY is not set. Email functionality will be disabled.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@roomai.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.error("Cannot send email: SENDGRID_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  if (!FROM_EMAIL || FROM_EMAIL === "noreply@roomai.com") {
    logger.warn("SENDGRID_FROM_EMAIL is not set or using default. Make sure to set a verified sender email in SendGrid.");
  }

  try {
    await sgMail.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    logger.info("Email sent successfully", { to, subject });
    return { success: true };
  } catch (error: any) {
    logger.error("Failed to send email", JSON.stringify(error, null, 2));
    
    // Extract more detailed error information from SendGrid
    let errorMessage = "Failed to send email";
    if (error?.response) {
      const { body, statusCode } = error.response;
      if (statusCode === 401) {
        errorMessage = "SendGrid authentication failed. Please check your SENDGRID_API_KEY and ensure it's valid.";
      } else if (statusCode === 403) {
        errorMessage = "SendGrid API key doesn't have permission to send emails. Please check API key permissions.";
      } else if (body?.errors && Array.isArray(body.errors)) {
        errorMessage = body.errors.map((e: any) => e.message || e).join(", ");
      } else {
        errorMessage = body?.message || `SendGrid error (${statusCode})`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export function getAppUrl(path: string = "") {
  return `${APP_URL}${path}`;
}

