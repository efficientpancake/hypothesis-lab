"use client";

import { useStore } from "@/lib/store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import Link from "next/link";

export function HypothesisSidePanel({
  collapsible = false,
}: {
  collapsible?: boolean;
}) {
  const output = useStore((s) => s.hypothesisOutput);
  const [open, setOpen] = useState(!collapsible);

  if (!output) {
    return (
      <aside className="w-full rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">No hypotheses yet</div>
        <p className="mt-1">
          Run the hypothesis extractor first, then come back to interview a
          persona.
        </p>
        <Link
          href="/hypothesis"
          className="mt-3 inline-block text-xs font-medium underline underline-offset-2"
        >
          Go to Hypotheses →
        </Link>
      </aside>
    );
  }

  return (
    <aside className="w-full rounded-lg border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Hypotheses to test</h3>
            <p className="text-xs text-muted-foreground">
              The persona does not see these.
            </p>
          </div>
          {collapsible && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {open ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="prose-output max-h-[70vh] overflow-y-auto px-4 py-3 text-[13px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
        </div>
      )}
    </aside>
  );
}
