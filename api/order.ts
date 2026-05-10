import dotenv from "dotenv";
import type { IncomingMessage, ServerResponse } from "node:http";
import nodemailer from "nodemailer";
import transferPrices from "../src/data/transferPrices.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+()\s/-]{6,}$/;

type OrderBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  from?: unknown;
  to?: unknown;
  date?: unknown;
  time?: unknown;
  passengers?: unknown;
  note?: unknown;
};
type TransferRoute = (typeof transferPrices.routes)[number];

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: OrderBody;

  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return Response.json({ error: "Neispravan format zahtjeva." }, { status: 400 });
  }

  const clean = {
    name: getString(body.name),
    email: getString(body.email),
    phone: getString(body.phone),
    from: getString(body.from),
    to: getString(body.to),
    date: getString(body.date),
    time: getString(body.time),
    passengers: getString(body.passengers),
    note: getString(body.note),
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

  if (!clean.date) {
    return Response.json({ error: "Izaberite datum voznje." }, { status: 400 });
  }

  if (!clean.time) {
    return Response.json({ error: "Izaberite vrijeme voznje." }, { status: 400 });
  }

  const passengerCount = Number(clean.passengers);

  if (!Number.isInteger(passengerCount) || passengerCount < 1) {
    return Response.json({ error: "Unesite broj putnika." }, { status: 400 });
  }

  const route = getRoutePrice(clean.from, clean.to);

  if (!route) {
    return Response.json({ error: "Izaberite validnu rutu." }, { status: 400 });
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
    console.log(`TransferGo order email recipient: ${maskEmail(process.env.MAIL_TO || process.env.SMTP_USER)}`);

    await transporter.sendMail({
      from: `"TransferGo" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      replyTo: clean.email,
      subject: `Nova narudzbina voznje - ${clean.from} do ${clean.to}`,
      text: [
        "Nova narudzbina voznje sa TransferGo sajta",
        "",
        `Ruta: ${clean.from} -> ${clean.to}`,
        `Cijena: ${route.price} ${transferPrices.currency}`,
        `Datum: ${clean.date}`,
        `Vrijeme: ${clean.time}`,
        `Putnici: ${passengerCount}`,
        "",
        `Ime i prezime: ${clean.name}`,
        `Email: ${clean.email}`,
        `Telefon: ${clean.phone}`,
        "",
        "Napomena:",
        clean.note || "-",
      ].join("\n"),
      html: `
        <h2>Nova narudzbina voznje</h2>
        <p><strong>Ruta:</strong> ${escapeHtml(clean.from)} &rarr; ${escapeHtml(clean.to)}</p>
        <p><strong>Cijena:</strong> ${route.price} ${escapeHtml(transferPrices.currency)}</p>
        <p><strong>Datum:</strong> ${escapeHtml(clean.date)}</p>
        <p><strong>Vrijeme:</strong> ${escapeHtml(clean.time)}</p>
        <p><strong>Putnici:</strong> ${passengerCount}</p>
        <hr />
        <p><strong>Ime i prezime:</strong> ${escapeHtml(clean.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(clean.email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(clean.phone)}</p>
        <p><strong>Napomena:</strong></p>
        <p>${escapeHtml(clean.note || "-").replace(/\n/g, "<br />")}</p>
      `,
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("TransferGo order email failed", error);
    return Response.json({ error: "Greska pri slanju emaila." }, { status: 500 });
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
      new Request("https://transfergo.me/api/order", {
        method: "POST",
        headers: {
          "Content-Type": req.headers["content-type"] || "application/json",
        },
        body,
      })
    );

    sendJsonText(res, response.status, await response.text());
  } catch (error) {
    console.error("TransferGo order handler failed", error);
    sendJson(res, 500, { error: "Greska pri obradi zahtjeva." });
  }
}

function getRoutePrice(from: string, to: string): TransferRoute | null {
  if (!from || !to || from === to) {
    return null;
  }

  const selectedFrom = normalizeRouteValue(from);
  const selectedTo = normalizeRouteValue(to);

  return transferPrices.routes.find((route) => {
    const routeFrom = normalizeRouteValue(route.from);
    const routeTo = normalizeRouteValue(route.to);

    return (
      (routeFrom === selectedFrom && routeTo === selectedTo) ||
      (routeFrom === selectedTo && routeTo === selectedFrom)
    );
  }) ?? null;
}

function normalizeRouteValue(value: string): string {
  return value.trim().toLowerCase();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function maskEmail(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const atIndex = value.indexOf("@");

  if (atIndex === -1) {
    return `${value.slice(0, 2)}***`;
  }

  return `${value.slice(0, 2)}***${value.slice(atIndex)}`;
}

function getString(value: unknown): string {
  return String(value || "").trim();
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
  const status = res.status;
  const json = res.json;

  if (typeof status === "function" && typeof json === "function") {
    status.call(res, statusCode).json?.(body);
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
