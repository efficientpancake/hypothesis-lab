"use client";

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

  if (!output) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
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
