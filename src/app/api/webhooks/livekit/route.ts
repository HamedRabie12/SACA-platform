import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { WebhookReceiver } from "livekit-server-sdk";
import { db } from "@/lib/db";

/**
 * LiveKit webhook endpoint.
 *
 * Security:
 * - verifies the Authorization header + raw request body with WebhookReceiver
 * - rejects unsigned/invalid requests
 * - uses a SHA-256 idempotency key derived from the exact raw payload
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "LiveKit webhook is not configured." }, { status: 503 });
  }

  try {
    const rawBody = await req.text();
    const authorization = req.headers.get("authorization") ?? undefined;
    const receiver = new WebhookReceiver(apiKey, apiSecret);
    const event = await receiver.receive(rawBody, authorization);

    const webhookId = crypto.createHash("sha256").update(rawBody).digest("hex");
    const existing = await db.auditLog.findFirst({
      where: { action: "livekit-webhook-processed", entityId: webhookId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const roomName = event.room?.name ?? null;
    const participantIdentity = event.participant?.identity ?? null;
    const meetingId = roomName?.startsWith("saca-meeting-")
      ? roomName.slice("saca-meeting-".length)
      : null;

    if (meetingId) {
      if (event.event === "room_started") {
        await db.meeting.update({
          where: { id: meetingId },
          data: { isLive: true, viewerCount: 0 },
        });
      }

      if (event.event === "room_finished") {
        await db.meeting.update({
          where: { id: meetingId },
          data: { isLive: false, viewerCount: 0 },
        });
      }

      if (participantIdentity && ["participant_joined", "participant_left"].includes(event.event)) {
        const memberId = participantIdentity.startsWith("member:")
          ? participantIdentity.slice("member:".length)
          : null;

        if (event.event === "participant_joined") {
          await db.meetingParticipant.upsert({
            where: { meetingId_identity: { meetingId, identity: participantIdentity } },
            create: {
              meetingId,
              identity: participantIdentity,
              memberId,
              displayName: event.participant?.name ?? null,
              status: "CONNECTED",
              joinedAt: new Date(),
              lastSeenAt: new Date(),
            },
            update: {
              memberId,
              displayName: event.participant?.name ?? null,
              status: "CONNECTED",
              leftAt: null,
              lastSeenAt: new Date(),
            },
          });
        }

        if (event.event === "participant_left") {
          await db.meetingParticipant.updateMany({
            where: { meetingId, identity: participantIdentity },
            data: { status: "LEFT", leftAt: new Date(), lastSeenAt: new Date() },
          });
        }

        const connectedCount = await db.meetingParticipant.count({
          where: { meetingId, status: "CONNECTED" },
        });

        await db.meeting.update({
          where: { id: meetingId },
          data: { viewerCount: connectedCount },
        });
      }
    }

    await db.auditLog.create({
      data: {
        actor: "livekit-webhook",
        action: "livekit-webhook-processed",
        entity: "meeting",
        entityId: webhookId,
        details: JSON.stringify({
          event: event.event,
          room: roomName,
          participant: participantIdentity,
          meetingId,
        }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("livekit webhook verification/processing failed:", error);
    return NextResponse.json({ error: "Invalid or unprocessable LiveKit webhook." }, { status: 401 });
  }
}
