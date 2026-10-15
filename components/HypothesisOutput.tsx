"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HypothesisChat } from "@/components/HypothesisChat";

export function HypothesisOutput() {
  const output = useStore((s) => s.hypothesisOutput);
  const done = useStore((s) => s.hypothesisDone);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!output) return null;

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-lg border border-border bg-secondary p-6">
        <button
          onClick={copyOutput}
          className="absolute top-3 right-3 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <div className="prose-output">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
        </div>
      </div>
      {done && <HypothesisChat />}
      {done && (
        <div className="flex justify-end">
          <Button onClick={() => router.push("/persona")}>
            Test with a Persona →
          </Button>
        </div>
      )}
    </div>
  );
}
