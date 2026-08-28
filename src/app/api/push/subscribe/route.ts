import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";

/**
 * POST /api/push/subscribe
 * Body: { subscription: PushSubscription, memberId?: string }
 *
 * Stores the push subscription for the user.
 * When VAPID keys are configured, the server can send Web Push notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await resolveMemberSession(req);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const body = await req.json();
    const subscription = body?.subscription;
    const memberId = session.memberId;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Valid subscription required" },
        { status: 400 }
      );
    }

    const endpoint = String(subscription.endpoint);
    const keys = subscription.keys ?? {};
    const push = await db.pushSubscription.upsert({
      where: { endpoint },
      update: {
        memberId,
        p256dh: String(keys.p256dh ?? ""),
        auth: String(keys.auth ?? ""),
        revokedAt: null,
        deviceLabel: String(body?.deviceLabel ?? "").slice(0, 120) || null,
      },
      create: {
        memberId,
        endpoint,
        p256dh: String(keys.p256dh ?? ""),
        auth: String(keys.auth ?? ""),
        deviceLabel: String(body?.deviceLabel ?? "").slice(0, 120) || null,
      },
    });

    await db.auditLog.create({
      data: {
        actor: memberId,
        action: "push-subscribed",
        entity: "push_subscription",
        entityId: push.id,
        details: JSON.stringify({ endpoint }),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Push subscription stored.",
    });
  } catch (e) {
    console.error("push subscribe error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key for the browser to use in subscribe()
 */
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json({
      configured: false,
      message: "Web Push not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars.",
    });
  }

  return NextResponse.json({
    configured: true,
    publicKey,
  });
}
