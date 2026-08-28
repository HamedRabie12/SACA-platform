"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, MessageCircle, Bot, User, Shield } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; type: string }>;
};

export function AIAssistantWidget() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("ai.greeting") },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  // Sync greeting when language changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: t("ai.greeting") }]);
  }, [lang, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setLoading(true);
    const userMsg: Message = { role: "user", content: question };
    setMessages((p) => [...p, userMsg]);

    try {
      const res = await fetch("/api/community/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: data.answer || "...",
          sources: data.sources || [],
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            lang === "ar"
              ? "تعذر الوصول إلى الخدمة. حاول مرة أخرى."
              : "Could not reach the service. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button (floating) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 end-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-deep text-white shadow-premium-lg hover:scale-105 transition-premium"
        aria-label={t("ai.title")}
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -end-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold text-emerald-deep text-[10px] font-bold">
          AI
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full md:max-w-2xl h-[85vh] md:h-[640px] bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-deep text-white">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -end-0.5 inline-flex h-3 w-3 rounded-full bg-emerald-400 border-2 border-emerald-deep" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{t("ai.title")}</h3>
                  <p className="text-[10px] text-white/70">{t("ai.subtitle")}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      m.role === "user"
                        ? "bg-emerald-700 text-white"
                        : "bg-gradient-to-br from-gold to-amber-700 text-white"
                    }`}
                  >
                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-emerald-700 text-white rounded-se-sm"
                        : "bg-card border border-border text-foreground rounded-ss-sm shadow-premium"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/40">
                        <div className="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {t("ai.sources")}
                        </div>
                        <div className="space-y-0.5">
                          {m.sources.map((s, j) => (
                            <div key={j} className="text-[10px] text-muted-foreground">
                              • {s.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-gold to-amber-700 text-white flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-card border border-border px-4 py-3 shadow-premium">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 live-dot" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 live-dot" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 live-dot" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border/60 bg-card p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={t("ai.placeholder")}
                  className="flex-1 h-10 rounded-full bg-secondary/60 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-emerald-700/40"
                />
                <Button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-deep text-white p-0"
                  aria-label={t("ai.send")}
                >
                  <Send className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/70 mt-2 text-center inline-flex items-center justify-center gap-1 w-full">
                <Shield className="h-2.5 w-2.5" />
                {t("ai.disclaimer")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
