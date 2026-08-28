import { NextRequest, NextResponse } from "next/server";
import { randomUUID, createHash } from "node:crypto";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_REGEX = /^\+?[1-9]\d{6,14}$/;

function generateOtp(): string {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(`saca-otp:${otp}`).digest("hex");
}

function hashDestination(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return process.env.NODE_ENV === "development" && process.env.DEV_OTP_ENABLED === "true";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "SACA <noreply@saca-md.org>",
        to: [email],
        subject: "رمز التحقق — SACA",
        html: `<div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px"><h1 style="color:#047857">SACA</h1><p>رمز التحقق الخاص بك صالح لمدة 5 دقائق.</p><div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#047857;font-family:monospace;text-align:center">${otp}</div></div>`,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contact = String(body?.contact ?? "").trim();
    const channel = body?.channel === "phone" ? "phone" : "email";
    const displayName = String(body?.displayName ?? "").trim().slice(0, 80);
    if (!contact) return NextResponse.json({ error: "contact is required" }, { status: 400 });
    if (channel === "email" && !EMAIL_REGEX.test(contact)) return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    if (channel === "phone" && !E164_REGEX.test(contact)) return NextResponse.json({ error: "Invalid phone format. Must be E.164" }, { status: 400 });

    const rate = await rateLimit(`register:${channel}:${hashDestination(contact)}:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`, 3, 300);
    if (!rate.allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const challengeId = randomUUID();
    const twilioConfigured = Boolean(process.env.TWILIO_VERIFY_SERVICE_SID && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const provider = channel === "phone" && twilioConfigured ? "TWILIO_VERIFY" : "LOCAL";
    const codeHash = provider === "LOCAL" ? hashOtp(otp) : `twilio:${challengeId}`;

    await db.verificationChallenge.create({
      data: {
        id: challengeId,
        channel,
        deliveryProvider: provider,
        destinationHash: hashDestination(contact),
        codeHash,
        purpose: "REGISTRATION",
        expiresAt,
        maxAttempts: 5,
        ipHash: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      },
    });

    const delivered = channel === "email"
      ? await sendOtpEmail(contact, otp)
      : twilioConfigured;

    if (channel === "phone" && delivered) {
      try {
        const response = await fetch(`https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/Verifications`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: contact, Channel: "sms" }).toString(),
        });
        if (!response.ok) throw new Error("TWILIO_DELIVERY_FAILED");
      } catch {
        await db.verificationChallenge.delete({ where: { id: challengeId } }).catch(() => undefined);
        return NextResponse.json({ error: "Failed to send verification SMS." }, { status: 502 });
      }
    } else if (!delivered) {
      await db.verificationChallenge.delete({ where: { id: challengeId } }).catch(() => undefined);
      return NextResponse.json({ error: "Verification delivery is not configured." }, { status: 503 });
    }

    await db.auditLog.create({
      data: {
        actor: displayName || contact,
        action: "registration-otp-issued",
        entity: "verification_challenge",
        entityId: challengeId,
        details: JSON.stringify({ channel, expiresAt: expiresAt.toISOString() }),
      },
    });

    return NextResponse.json({
      ok: true,
      verificationId: challengeId,
      channel,
      maskedDestination: channel === "email" ? contact.replace(/^(.).*(@.*)$/, "$1***$2") : contact.replace(/(\+?\d{2})\d+(\d{2})$/, "$1****$2"),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("registration error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
