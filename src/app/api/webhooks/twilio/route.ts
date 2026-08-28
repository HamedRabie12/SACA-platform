import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * POST /api/webhooks/twilio
 *
 * Twilio Verify webhook callbacks.
 * Used to track verification status changes.
 *
 * Security: Must verify Twilio signature in production.
 *   const twilioSignature = req.headers.get("x-twilio-signature");
 *   Validate using TWILIO_AUTH_TOKEN
 *
 * Idempotency: Check if we've already processed this callback.
 */
function verifyTwilioSignature(url: string, params: URLSearchParams, signature: string | null, authToken: string | undefined) {
  if (!signature || !authToken) return false;
  const data = url + [...params.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([key, value]) => key + value).join("");
  const expected = createHmac("sha1", authToken).update(data).digest("base64");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const verificationSid = params.get("VerificationSid");
    const status = params.get("Status"); // approved, canceled, pending
    const to = params.get("To");

    if (!verificationSid || !status) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const signature = req.headers.get("x-twilio-signature");
    const requestUrl = process.env.TWILIO_WEBHOOK_PUBLIC_URL ?? req.url;
    if (!verifyTwilioSignature(requestUrl, params, signature, process.env.TWILIO_AUTH_TOKEN)) {
      return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 403 });
    }

    // Idempotency check
    const existing = await db.auditLog.findFirst({
      where: {
        action: "twilio-webhook-processed",
        entityId: verificationSid,
      },
    });

    if (existing) {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    // Log the webhook
    await db.auditLog.create({
      data: {
        actor: "twilio-webhook",
        action: "twilio-webhook-processed",
        entity: "verification",
        entityId: verificationSid,
        details: JSON.stringify({ status, to }),
      },
    });

    // If approved, update member verification status
    if (status === "approved" && to) {
      const isEmail = to.includes("@");
      if (isEmail) {
        await db.member.updateMany({
          where: { email: to },
          data: { emailVerifiedAt: new Date(), accountState: "Active" },
        });
      } else {
        await db.member.updateMany({
          where: { phoneE164: to },
          data: { phoneVerifiedAt: new Date(), accountState: "Active" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("twilio webhook error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
