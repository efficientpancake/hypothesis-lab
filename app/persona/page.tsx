"use client";

import { useStore } from "@/lib/store";
import { PersonaForm } from "@/components/PersonaForm";
import { InterviewChat } from "@/components/InterviewChat";
import { HypothesisSidePanel } from "@/components/HypothesisSidePanel";

export default function PersonaPage() {
  const persona = useStore((s) => s.persona);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
        <HypothesisSidePanel collapsible={!persona} />
        <section>
          {persona ? <InterviewChat /> : <PersonaForm />}
        </section>
      </div>
    </main>
  );
}
