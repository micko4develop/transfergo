import dotenv from "dotenv";
import type { IncomingMessage, ServerResponse } from "node:http";
import nodemailer from "nodemailer";

dotenv.config({ path: ".env.local" });
dotenv.config();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+()\s/-]{6,}$/;

export const runtime = "nodejs";

type ContactBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return Response.json({ error: "Neispravan format zahtjeva." }, { status: 400 });
  }

  const { name = "", email = "", phone = "", message = "" } = body || {};
  const clean = {
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    message: String(message).trim(),
  };

  if (clean.name.length < 2) {
    return Response.json({ error: "Unesite ime i prezime." }, { status: 400 });
  }

  if (!emailRegex.test(clean.email)) {
    return Response.json({ error: "Unesite ispravnu email adresu." }, { status: 400 });
  }

  if (!phoneRegex.test(clean.phone)) {
    return Response.json({ error: "Unesite ispravan broj telefona." }, { status: 400 });
  }

  if (clean.message.length < 10) {
    return Response.json({ error: "Poruka mora imati najmanje 10 karaktera." }, { status: 400 });
  }

  const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return Response.json(
      { error: `SMTP nije podešen. Nedostaje: ${missing.join(", ")}` },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"TransferGo" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      replyTo: clean.email,
      subject: `Novi upit sa TransferGo sajta - ${clean.name}`,
      text: [
        "Novi upit sa sajta TransferGo",
        "",
        `Ime i prezime: ${clean.name}`,
        `Email: ${clean.email}`,
        `Telefon: ${clean.phone}`,
        "",
        "Poruka:",
        clean.message,
      ].join("\n"),
      html: `
        <h2>Novi upit sa sajta TransferGo</h2>
        <p><strong>Ime i prezime:</strong> ${escapeHtml(clean.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(clean.email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(clean.phone)}</p>
        <p><strong>Poruka:</strong></p>
        <p>${escapeHtml(clean.message).replace(/\n/g, "<br />")}</p>
      `,
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ error: "Greška pri slanju emaila." }, { status: 500 });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const body = await readRequestBody(req);
    const response = await POST(
      new Request("https://transfergo.me/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": req.headers["content-type"] || "application/json",
        },
        body,
      })
    );

    sendJsonText(res, response.status, await response.text());
  } catch (error) {
    console.error("TransferGo contact handler failed", error);
    sendJson(res, 500, { error: "Greska pri obradi zahtjeva." });
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type VercelRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
  headers: IncomingMessage["headers"];
};

type VercelResponse = ServerResponse & {
  status?: (statusCode: number) => VercelResponse;
  json?: (body: unknown) => void;
};

function sendJson(res: VercelResponse, statusCode: number, body: unknown): void {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(statusCode).json(body);
    return;
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function sendJsonText(res: VercelResponse, statusCode: number, body: string): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(body);
}

async function readRequestBody(req: VercelRequest): Promise<string> {
  if (typeof req.body === "string") {
    return req.body;
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }

  if (req.body && typeof req.body === "object") {
    return JSON.stringify(req.body);
  }

  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}
