"use client";

import "@livekit/components-styles";
import { useEffect, useRef, useState } from "react";
import { LiveKitRoom, GridLayout, FocusLayoutContainer, FocusLayout, ParticipantTile, useTracks, useParticipants, RoomAudioRenderer, ConnectionState, ControlBar } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Grid3X3, LayoutTemplate, Rows3, Users } from "lucide-react";

type Mode = "grid" | "stage" | "sidebar";

function RoomView({ mode }: { mode: Mode }) {
  const participants = useParticipants();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ], { onlySubscribed: false });

  if (mode === "grid") {
    return <div className="h-[68vh] min-h-[520px] rounded-2xl overflow-hidden bg-slate-950"><GridLayout tracks={tracks}><ParticipantTile /></GridLayout></div>;
  }

  const primary = tracks.find((t) => t.source === Track.Source.ScreenShare) ?? tracks[0];
  const side = tracks.filter((t) => t !== primary);

  if (mode === "stage") {
    return <div className="h-[68vh] min-h-[520px] rounded-2xl overflow-hidden bg-slate-950"><FocusLayout trackRef={primary} /></div>;
  }

  return <div className="h-[68vh] min-h-[520px] rounded-2xl overflow-hidden bg-slate-950"><FocusLayoutContainer className="h-full">
    <div className="flex h-full flex-col gap-2 overflow-auto p-2">{side.map((track) => <div key={`${track.participant.identity}-${track.source}`} className="h-28 shrink-0 overflow-hidden rounded-xl"><ParticipantTile trackRef={track} /></div>)}<div className="px-2 pt-1 text-xs text-white/60">{participants.length} مشارك متصل</div></div>
    <FocusLayout trackRef={primary} />
  </FocusLayoutContainer></div>;
}

export function LiveMeetingRoom({ meetingId }: { meetingId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("stage");

  useEffect(() => {
    fetch(`/api/meetings/${meetingId}/token`, { cache: "no-store" })
      .then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.error || "Unable to join meeting"); return data; })
      .then((data) => { setToken(data.token); setServerUrl(data.serverUrl); })
      .catch((e) => setError(e.message));
  }, [meetingId]);

  if (error) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900"><strong>الاجتماع المباشر غير متاح حالياً.</strong><p className="mt-2 text-sm">{error}</p></div>;
  if (!token || !serverUrl) return <div className="grid h-[68vh] min-h-[520px] place-items-center rounded-2xl bg-slate-950 text-white/70">جاري الاتصال بغرفة الاجتماع…</div>;
  const participantsLabel = "إدارة الكاميرا والميكروفون ومشاركة الشاشة من عناصر الاجتماع القياسية.";

  return <LiveKitRoom token={token} serverUrl={serverUrl} connect video audio className="space-y-3">
    <RoomAudioRenderer />
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-emerald-700"/> المشاركون الحقيقيون يظهرون هنا عند اتصالهم</div>
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
        {([['stage',LayoutTemplate,'Stage'],['grid',Grid3X3,'Grid'],['sidebar',Rows3,'Sidebar']] as const).map(([key,Icon,label])=><button key={key} onClick={()=>setMode(key)} className={`rounded-lg px-3 py-2 text-xs font-bold ${mode===key?'bg-emerald-800 text-white':'text-slate-600 hover:bg-white'}`}><Icon className="mr-1 inline h-3.5 w-3.5"/>{label}</button>)}
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
        <ConnectionState />
        <span>{participantsLabel}</span>
      </div>
      <ControlBar variation="minimal" saveUserChoices />
    </div>
    <RoomView mode={mode}/>
  </LiveKitRoom>;
}
