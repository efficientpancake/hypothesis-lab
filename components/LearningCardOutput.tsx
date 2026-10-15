"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LearningCardOutput() {
  const output = useStore((s) => s.learningOutput);
  const [copied, setCopied] = useState(false);

  if (!output) return null;

  function copyOutput() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
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
  );
}
