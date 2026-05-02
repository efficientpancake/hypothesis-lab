"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function InterviewChat() {
  const persona = useStore((s) => s.persona);
  const chat = useStore((s) => s.chatHistory);
  const appendChatMessage = useStore((s) => s.appendChatMessage);
  const appendAssistantChunk = useStore((s) => s.appendAssistantChunk);
  const setPersona = useStore((s) => s.setPersona);
  const resetChat = useStore((s) => s.resetChat);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  if (!persona) return null;

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setSending(true);

    const nextHistory = [...chat, { role: "user" as const, content: text }];
    appendChatMessage({ role: "user", content: text });

    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, messages: nextHistory }),
      });

      if (!res.ok || !res.body) {
        let msg = "Request failed";
        try {
          const text = await res.text();
          const parsed = JSON.parse(text);
          msg = parsed.error || parsed.errorMessage || msg;
        } catch {
          // not JSON — use default
        }
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        appendAssistantChunk(chunk);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function editPersona() {
    if (chat.length > 0) {
      const ok = window.confirm(
        "Editing the persona will clear this chat history. Continue?"
      );
      if (!ok) return;
    }
    resetChat();
    setPersona(null);
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col rounded-lg border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <div className="text-sm font-semibold">{persona.name}</div>
          <div className="text-xs text-muted-foreground">{persona.role}</div>
        </div>
        <div className="flex items-center gap-3">
          {chat.length > 0 && (
            <button
              onClick={() => {
                const transcript = chat
                  .map((m) => `${m.role === "user" ? "You" : persona!.name}: ${m.content}`)
                  .join("\n\n");
                navigator.clipboard.writeText(transcript).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
              className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors"
            >
              {copied ? "Copied!" : "Copy chat"}
            </button>
          )}
          {chat.length > 0 && (
            <button
              onClick={() => router.push("/learning")}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              End interview →
            </button>
          )}
          <button
            onClick={editPersona}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Edit persona
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {chat.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Ask your first question. Treat this like a real customer interview —
              open-ended questions get better signal than leading ones.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chat.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} personaName={persona.name} />
            ))}
            {sending && chat[chat.length - 1]?.role === "user" && (
              <Bubble role="assistant" content="…" personaName={persona.name} />
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="border-t border-border bg-destructive/5 px-5 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question…"
            disabled={sending}
            className="flex-1 min-h-[2.75rem]"
          />
          <Button onClick={send} disabled={!input.trim() || sending}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  personaName,
}: {
  role: "user" | "assistant";
  content: string;
  personaName: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[75%] space-y-1">
        <div className="text-xs text-muted-foreground">
          {isUser ? "You" : personaName}
        </div>
        <div
          className={`rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
