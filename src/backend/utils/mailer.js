// backend/utils/mailer.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transport = smtpUser && smtpPass
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export const sendMail = async ({ to, subject, html }) => {
  try {
    if (!transport) {
      const errMessage = "SMTP credentials are missing. Add SMTP_USER and SMTP_PASS in src/backend/.env with a valid Gmail app password.";
      console.error(`❌ ${errMessage}`);
      throw new Error(errMessage);
    }

    const info = await transport.sendMail({
      from: smtpUser,
      to,
      subject,
      html,
    });

    console.log(`✅ Real email sent to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
};

