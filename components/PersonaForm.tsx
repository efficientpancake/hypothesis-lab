"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { PersonaFields } from "@/lib/prompts";

export function PersonaForm() {
  const existing = useStore((s) => s.persona);
  const setPersona = useStore((s) => s.setPersona);
  const resetChat = useStore((s) => s.resetChat);

  const [fields, setFields] = useState<PersonaFields>(
    existing ?? {
      name: "",
      role: "",
      ageRange: "",
      context: "",
      goals: "",
      painPoints: "",
      personality: "",
      decisionMaking: "",
      additionalNotes: "",
    }
  );

  function update<K extends keyof PersonaFields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  const [copied, setCopied] = useState(false);
  const canStart = fields.name.trim().length > 0 && fields.role.trim().length > 0;

  function start() {
    if (!canStart) return;
    setPersona(fields);
    resetChat();
  }

  function copyForm() {
    const lines: string[] = [];
    if (fields.name.trim()) lines.push(`Name: ${fields.name.trim()}`);
    if (fields.role.trim()) lines.push(`Role: ${fields.role.trim()}`);
    if (fields.ageRange?.trim()) lines.push(`Age range: ${fields.ageRange.trim()}`);
    if (fields.context?.trim()) lines.push(`Context: ${fields.context.trim()}`);
    if (fields.goals?.trim()) lines.push(`Goals: ${fields.goals.trim()}`);
    if (fields.painPoints?.trim()) lines.push(`Pain points: ${fields.painPoints.trim()}`);
    if (fields.personality?.trim()) lines.push(`Personality: ${fields.personality.trim()}`);
    if (fields.decisionMaking?.trim()) lines.push(`Decision-making: ${fields.decisionMaking.trim()}`);
    if (fields.additionalNotes?.trim()) lines.push(`Additional notes: ${fields.additionalNotes.trim()}`);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const hasContent = fields.name.trim() || fields.role.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="font-lora text-xl font-semibold">Define your persona</h2>
          <p className="text-sm text-muted-foreground">
            The persona agent only knows what you tell it here. Name and role are
            required; everything else fills out the character.
          </p>
        </div>
        {hasContent && (
          <button
            onClick={copyForm}
            className="shrink-0 ml-3 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors"
          >
            {copied ? "Copied!" : "Copy persona"}
          </button>
        )}
      </div>

      <div className="grid gap-5">
        <Field
          label="Name"
          required
          value={fields.name}
          onChange={(v) => update("name", v)}
          placeholder="Jane Morrison"
        />
        <Field
          label="Role / occupation"
          required
          value={fields.role}
          onChange={(v) => update("role", v)}
          placeholder="Procurement manager at a mid-size fashion brand"
        />
        <Field
          label="Age range"
          value={fields.ageRange ?? ""}
          onChange={(v) => update("ageRange", v)}
          placeholder="35–45"
        />

        <TextField
          label="Context (what's going on in their life or work)"
          value={fields.context ?? ""}
          onChange={(v) => update("context", v)}
          placeholder="Based in London. Under pressure to hit sustainability targets before EU deadlines in 2027…"
        />
        <TextField
          label="Goals (what they're trying to achieve)"
          value={fields.goals ?? ""}
          onChange={(v) => update("goals", v)}
          placeholder="Keep procurement costs down while showing tangible ESG progress to internal stakeholders."
        />
        <TextField
          label="Pain points / frustrations"
          value={fields.painPoints ?? ""}
          onChange={(v) => update("painPoints", v)}
          placeholder="Gets pitched sustainability initiatives that never deliver commercial benefit. Has been burned by greenwashing accusations before."
        />
        <TextField
          label="Personality traits"
          value={fields.personality ?? ""}
          onChange={(v) => update("personality", v)}
          placeholder="Direct, data-driven, slightly sceptical but not hostile. Asks 'show me the numbers' style questions."
        />
        <TextField
          label="How they make decisions"
          value={fields.decisionMaking ?? ""}
          onChange={(v) => update("decisionMaking", v)}
          placeholder="Needs a clear business case. Defers to CFO on anything over £50K. Will champion something internally if it passes the ROI test."
        />
        <TextField
          label="Additional notes"
          value={fields.additionalNotes ?? ""}
          onChange={(v) => update("additionalNotes", v)}
          placeholder="Anything else — speech patterns, opinions, specific triggers, references they use."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={start} disabled={!canStart}>
          Start Interview →
        </Button>
        {!canStart && (
          <span className="text-sm text-muted-foreground">
            Name and role are required.
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      <Textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
