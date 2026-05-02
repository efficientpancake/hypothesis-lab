"use client";

import { useStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function BriefInput() {
  const brief = useStore((s) => s.brief);
  const setBrief = useStore((s) => s.setBrief);
  const [copied, setCopied] = useState(false);
  const setHypothesisOutput = useStore((s) => s.setHypothesisOutput);
  const appendHypothesisOutput = useStore((s) => s.appendHypothesisOutput);
  const setHypothesisDone = useStore((s) => s.setHypothesisDone);
  const resetHypothesisChat = useStore((s) => s.resetHypothesisChat);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function extract() {
    if (!brief.trim() || loading) return;
    setLoading(true);
    setError(null);
    setHypothesisOutput("");
    setHypothesisDone(false);
    resetHypothesisChat();

    try {
      const res = await fetch("/api/hypothesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
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
        appendHypothesisOutput(chunk);
      }
      setHypothesisDone(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Paste your product or business brief here
        </label>
        {brief.trim() && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(brief).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      <Textarea
        rows={8}
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="E.g. A marketplace for peer-to-peer power tool rental. Homeowners list tools; neighbours book by the day; platform takes 15% commission…"
        disabled={loading}
        className="min-h-[12rem]"
      />
      <div className="flex items-center gap-3">
        <Button onClick={extract} disabled={!brief.trim() || loading}>
          {loading ? "Extracting…" : "Extract Hypotheses"}
        </Button>
        {error && (
          <span className="text-sm text-destructive">{error}</span>
        )}
      </div>
    </div>
  );
}
