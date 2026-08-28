import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await db.meeting.findUnique({ where: { id } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  if (!process.env.LIVEKIT_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    return NextResponse.json({ error: "Live meeting service is not configured." }, { status: 503 });
  }

  const session = await resolveMemberSession(req);
  if (!meeting.isPublic && !session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const identity = session ? `member:${session.memberId}` : `guest:${crypto.randomUUID()}`;
  const displayName = session ? "SACA Member" : "Guest";
  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name: displayName,
    ttl: "15m",
  });
  token.addGrant({ roomJoin: true, room: `saca-meeting-${meeting.id}`, canSubscribe: true, canPublish: Boolean(session), canPublishData: Boolean(session) });

  return NextResponse.json({ token: await token.toJwt(), serverUrl: process.env.LIVEKIT_URL, roomName: `saca-meeting-${meeting.id}`, identity });
}
