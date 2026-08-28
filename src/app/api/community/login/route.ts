import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createMemberSession, setMemberSessionCookie } from "@/lib/security/member-session";
import { randomUUID, createHash } from "node:crypto";
import { rateLimit } from "@/lib/security/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_REGEX = /^\+?[1-9]\d{6,14}$/;

function generateOtp(): string {
  const buf = new Uint32Array(1);
  if (globalThis.crypto) {
    globalThis.crypto.getRandomValues(buf);
  } else {
    buf[0] = Math.floor(Math.random() * 0xffffffff);
  }
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

async function hashOtp(otp: string): Promise<string> {
  return createHash("sha256").update(`saca-otp:${otp}`).digest("hex");
}

function hashDestination(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * POST /api/community/login
 * Body: { action: "send" | "verify", contact, channel, otp?, verificationId? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contact = String(body?.contact ?? "").trim();
    const channel = body?.channel === "phone" ? "phone" : "email";
    const action = body?.action || "send";
    const otp = body?.otp ? String(body.otp).trim() : "";

    if (!contact) {
      return NextResponse.json({ error: "contact is required" }, { status: 400 });
    }
    const rl = await rateLimit(`member-login:${channel}:${hashDestination(contact)}:${req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`, action === "verify" ? 8 : 4, 300);
    if (!rl.allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
    if (channel === "email" && !EMAIL_REGEX.test(contact)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    if (channel === "phone" && !E164_REGEX.test(contact)) {
      return NextResponse.json({ error: "Invalid phone format. Must be E.164" }, { status: 400 });
    }

    const existing = await db.member.findFirst({
      where: channel === "email" ? { email: contact } : { phoneE164: contact },
    });

    if (action === "send") {
      const otpCode = generateOtp();
      const codeHash = await hashOtp(otpCode);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const challengeId = randomUUID();
      const twilioConfigured = Boolean(process.env.TWILIO_VERIFY_SERVICE_SID && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
      const deliveryProvider = channel === "phone" && twilioConfigured ? "TWILIO_VERIFY" : "LOCAL";
      const storedCodeHash = deliveryProvider === "LOCAL" ? codeHash : `twilio:${challengeId}`;
      await db.verificationChallenge.create({
        data: {
          id: challengeId,
          channel,
          deliveryProvider,
          destinationHash: hashDestination(contact),
          codeHash: storedCodeHash,
          purpose: existing ? "LOGIN" : "REGISTRATION",
          expiresAt,
          maxAttempts: 5,
          ipHash: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        },
      });
      await db.auditLog.create({
        data: {
          actor: contact,
          action: existing ? "login-otp-request" : "register-otp-request",
          entity: "verification_challenge",
          entityId: challengeId,
          details: JSON.stringify({ channel, expiresAt: expiresAt.toISOString() }),
        },
      });

      // Send OTP via email
      if (channel === "email") {
        if (process.env.RESEND_API_KEY) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM || "SACA <noreply@saca-md.org>",
                to: [contact],
                subject: "رمز التحقق — SACA",
                html: `<div dir="rtl" style="font-family:sans-serif;text-align:center;padding:40px;"><h1 style="color:#047857;">SACA</h1><p style="color:#4B5563;font-size:14px;">رمز التحقق الخاص بك:</p><div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#047857;font-family:monospace;margin:20px 0;">${otpCode}</div><p style="color:#6B7280;font-size:12px;">صالح لمدة 5 دقائق فقط</p></div>`,
              }),
            });
          } catch (e) {
            console.error("[Email] Failed to send OTP:", e);
          }
        } else if (process.env.NODE_ENV === "development" && process.env.DEV_OTP_ENABLED === "true") {
          console.warn(`[DEV OTP] ${contact}: ${otpCode}`);
        } else {
          return NextResponse.json({ error: "Verification delivery is not configured." }, { status: 503 });
        }
      } else {
        if (process.env.TWILIO_VERIFY_SERVICE_SID && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          await fetch(`https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/Verifications`, {
            method: "POST",
            headers: { Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ To: contact, Channel: "sms" }).toString(),
          });
        } else if (process.env.NODE_ENV === "development" && process.env.DEV_OTP_ENABLED === "true") {
          console.warn(`[DEV OTP] ${contact}: ${otpCode}`);
        } else {
          return NextResponse.json({ error: "Verification delivery is not configured." }, { status: 503 });
        }
      }

      return NextResponse.json({
        ok: true,
        verificationId: challengeId,
        channel,
        destination: contact,
        maskedDestination:
          channel === "email"
            ? contact.replace(/^(.).*(@.*)$/, "$1***$2")
            : contact.replace(/(\+?\d{2})\d+(\d{2})$/, "$1****$2"),
        expiresAt: expiresAt.toISOString(),
        isLogin: !!existing,
        message: channel === "email"
          ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
          : "تم إرسال رمز التحقق إلى هاتفك",
        // NO devOtp — code is sent via email/SMS only
      });
    }

    if (action === "verify") {
      if (!otp || !body.verificationId) {
        return NextResponse.json({ error: "otp and verificationId required" }, { status: 400 });
      }

      const challenge = await db.verificationChallenge.findUnique({ where: { id: String(body.verificationId) } });
      if (!challenge || challenge.destinationHash !== hashDestination(contact) || challenge.consumedAt || challenge.expiresAt.getTime() <= Date.now()) {
        return NextResponse.json({ error: "Invalid or expired verification" }, { status: 400 });
      }
      if (challenge.attempts >= challenge.maxAttempts) {
        return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });
      }
      let verified = false;
      if (challenge.deliveryProvider === "TWILIO_VERIFY") {
        if (!process.env.TWILIO_VERIFY_SERVICE_SID || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
          return NextResponse.json({ error: "SMS verification is not configured." }, { status: 503 });
        }
        const twilioResponse = await fetch(`https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`, {
          method: "POST",
          headers: { Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ To: contact, Code: otp }).toString(),
        });
        const twilioJson = await twilioResponse.json().catch(() => ({}));
        verified = twilioResponse.ok && twilioJson.status === "approved";
      } else {
        verified = (await hashOtp(otp)) === challenge.codeHash;
      }
      if (!verified) {
        await db.verificationChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
        await db.auditLog.create({ data: { actor: contact, action: "otp-failed", entity: "verification_challenge", entityId: challenge.id } });
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      }
      await db.verificationChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date(), attempts: { increment: 1 } } });
      await db.auditLog.create({
        data: { actor: contact, action: "otp-consumed", entity: "verification_challenge", entityId: challenge.id },
      });

      let member = existing;
      if (!member) {
        member = await db.member.create({
          data: {
            ...(channel === "email" ? { email: contact } : { phoneE164: contact }),
            name: "New Member",
            accountState: "PendingVerification",
          },
        });
      }

      const verifiedAt = new Date();
      if (channel === "email") {
        await db.member.update({
          where: { id: member.id },
          data: { emailVerifiedAt: verifiedAt, accountState: "Active" },
        });
      } else {
        await db.member.update({
          where: { id: member.id },
          data: { phoneVerifiedAt: verifiedAt, accountState: "Active" },
        });
      }

      const session = await createMemberSession(member.id, {
        ipHash: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgentHash: req.headers.get("user-agent") ?? undefined,
      });

      await db.auditLog.create({
        data: {
          actor: member.id,
          action: "member-logged-in",
          entity: "member",
          entityId: member.id,
          details: JSON.stringify({ channel, contact }),
        },
      });

      const response = NextResponse.json({
        ok: true,
        memberName: member.name,
        accountState: "Active",
        isLogin: !!existing,
        next: existing ? "/my-community" : "/onboarding",
      });
      setMemberSessionCookie(response, session.token);
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("login error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
