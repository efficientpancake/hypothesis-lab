"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function HypothesisChat() {
  const brief = useStore((s) => s.brief);
  const output = useStore((s) => s.hypothesisOutput);
  const chat = useStore((s) => s.hypothesisChat);
  const appendChatMessage = useStore((s) => s.appendHypothesisChatMessage);
  const appendAssistantChunk = useStore((s) => s.appendHypothesisAssistantChunk);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setSending(true);

    // Build full history to send: initial brief + initial extraction + prior chat + new user message
    const historyToSend = [
      { role: "user" as const, content: brief },
      { role: "assistant" as const, content: output },
      ...chat,
      { role: "user" as const, content: text },
    ];

    appendChatMessage({ role: "user", content: text });

    try {
      const res = await fetch("/api/hypothesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend }),
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

  return (
    <div className="rounded-lg border border-border bg-background shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">💬 Tweak with the Hypothesis Engineer</h3>
        <p className="text-xs text-muted-foreground">
          Ask follow-ups — "make #2 more specific," "reconsider #4," "rewrite
          the test card for a lower budget."
        </p>
      </div>

      {chat.length > 0 && (
        <div ref={scrollRef} className="max-h-[50vh] overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            {chat.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && chat[chat.length - 1]?.role === "user" && (
              <Bubble role="assistant" content="…" />
            )}
          </div>
        </div>
      )}

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
            placeholder="Ask a follow-up…"
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
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] space-y-1">
        <div className="text-xs text-muted-foreground">
          {isUser ? "You" : "Hypothesis Engineer"}
        </div>
        <div
          className={`rounded-lg px-3.5 py-2.5 text-sm ${
            isUser
              ? "bg-primary text-primary-foreground whitespace-pre-wrap"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isUser ? (
            content
          ) : (
            <div className="prose-output prose-output-sm text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
