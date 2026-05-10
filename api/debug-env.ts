import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return Response.json({
    SMTP_HOST: Boolean(process.env.SMTP_HOST),
    SMTP_PORT: process.env.SMTP_PORT || null,
    SMTP_USER: Boolean(process.env.SMTP_USER),
    SMTP_PASS: Boolean(process.env.SMTP_PASS),
    MAIL_TO: Boolean(process.env.MAIL_TO),
  });
}
