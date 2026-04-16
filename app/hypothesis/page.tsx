import { BriefInput } from "@/components/BriefInput";
import { HypothesisOutput } from "@/components/HypothesisOutput";

export default function HypothesisPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          🧪 Extract your critical assumptions
        </h1>
        <p className="text-muted-foreground">
          Paste a business brief. Get the 5 hypotheses that could kill your
          idea, ranked by criticality, plus a cheap 2-week test for the most
          dangerous one.
        </p>
      </div>
      <div className="space-y-8">
        <BriefInput />
        <HypothesisOutput />
      </div>
    </main>
  );
}
