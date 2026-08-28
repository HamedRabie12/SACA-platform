import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

function hashOtp(otp: string): string {
  return createHash("sha256").update(`saca-otp:${otp}`).digest("hex");
}
function hashDestination(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const verificationId = String(body?.verificationId ?? "");
    const otp = String(body?.otp ?? "").trim();
    const contact = String(body?.contact ?? "").trim();
    const channel = body?.channel === "phone" ? "phone" : "email";
    if (!verificationId || !otp || !contact) return NextResponse.json({ error: "verificationId, otp, and contact are required" }, { status: 400 });

    const challenge = await db.verificationChallenge.findUnique({ where: { id: verificationId } });
    if (!challenge || challenge.purpose !== "REGISTRATION" || challenge.channel !== channel || challenge.destinationHash !== hashDestination(contact) || challenge.consumedAt || challenge.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Invalid or expired verification" }, { status: 400 });
    }
    if (challenge.attempts >= challenge.maxAttempts) return NextResponse.json({ error: "Too many attempts. Request a new code." }, { status: 429 });

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
      verified = hashOtp(otp) === challenge.codeHash;
    }
    if (!verified) {
      await db.verificationChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
      await db.auditLog.create({ data: { actor: contact, action: "registration-otp-failed", entity: "verification_challenge", entityId: challenge.id } });
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const member = await db.$transaction(async (tx) => {
      await tx.verificationChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date(), attempts: { increment: 1 } } });
      let current = await tx.member.findFirst({ where: channel === "email" ? { email: contact } : { phoneE164: contact } });
      if (!current) {
        current = await tx.member.create({ data: { ...(channel === "email" ? { email: contact } : { phoneE164: contact }), name: "New Member", accountState: "PendingVerification" } });
      }
      const verifiedAt = new Date();
      current = await tx.member.update({
        where: { id: current.id },
        data: channel === "email" ? { emailVerifiedAt: verifiedAt, accountState: "Verified" } : { phoneVerifiedAt: verifiedAt, accountState: "Verified" },
      });
      await tx.auditLog.create({ data: { actor: current.id, action: "registration-otp-consumed", entity: "member", entityId: current.id, details: JSON.stringify({ channel }) } });
      return current;
    });

    return NextResponse.json({ ok: true, memberId: member.id, accountState: member.accountState, verifiedAt: (channel === "email" ? member.emailVerifiedAt : member.phoneVerifiedAt)?.toISOString() ?? null, next: "POST /api/community/onboarding" });
  } catch (error) {
    console.error("verify error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
