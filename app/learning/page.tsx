"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LearningCardOutput } from "@/components/LearningCardOutput";

export default function LearningPage() {
  const brief = useStore((s) => s.brief);
  const hypotheses = useStore((s) => s.hypothesisOutput);
  const persona = useStore((s) => s.persona);
  const transcript = useStore((s) => s.chatHistory);
  const learningOutput = useStore((s) => s.learningOutput);
  const setLearningOutput = useStore((s) => s.setLearningOutput);
  const appendLearningOutput = useStore((s) => s.appendLearningOutput);
  const setLearningDone = useStore((s) => s.setLearningDone);
  const learningDone = useStore((s) => s.learningDone);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready =
    !!hypotheses.trim() &&
    !!persona?.name?.trim() &&
    !!persona?.role?.trim() &&
    transcript.length > 0;

  async function synthesize() {
    if (!ready || loading) return;
    setLoading(true);
    setError(null);
    setLearningOutput("");
    setLearningDone(false);

    try {
      const res = await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          hypotheses,
          persona,
          transcript,
        }),
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
        appendLearningOutput(chunk);
      }
      setLearningDone(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-8 space-y-2">
        <h1 className="font-lora text-[32px] font-bold tracking-tight">
          Synthesize what you learned
        </h1>
        <p className="text-muted-foreground">
          Read your interview transcript against your hypotheses. Get a
          Learning Card per hypothesis with Observed, Learned, and a Decision.
        </p>
      </div>

      {!ready ? (
        <div className="rounded-lg border border-border bg-secondary p-6">
          <p className="text-sm text-muted-foreground">
            You need a brief, extracted hypotheses, a defined persona, and at
            least one interview message before you can synthesize.
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => router.push("/persona")}>
              Back to Persona
            </Button>
            <Button
              onClick={() => router.push("/hypothesis")}
              variant="secondary"
            >
              Back to Hypotheses
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!learningOutput && (
            <div className="flex items-center gap-3">
              <Button onClick={synthesize} disabled={loading}>
                {loading ? "Synthesizing…" : "Synthesize Learning Card"}
              </Button>
              {error && (
                <span className="text-sm text-destructive">{error}</span>
              )}
            </div>
          )}

          <LearningCardOutput />

          {learningDone && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setLearningOutput("");
                  setLearningDone(false);
                }}
              >
                Re-synthesize
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
