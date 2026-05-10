import dotenv from "dotenv";
import type { IncomingMessage, ServerResponse } from "node:http";

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

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed." }));
    return;
  }

  const response = await GET();

  res.statusCode = response.status;
  res.setHeader("Content-Type", "application/json");
  res.end(await response.text());
}
