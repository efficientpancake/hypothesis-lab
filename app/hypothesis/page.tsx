import { BriefInput } from "@/components/BriefInput";
import { HypothesisOutput } from "@/components/HypothesisOutput";

export default function HypothesisPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-10 space-y-3">
        <h1 className="font-lora text-[32px] font-bold tracking-tight">
          Extract your critical assumptions
        </h1>
        <p className="text-[17px] text-muted-foreground leading-relaxed max-w-xl">
          Paste a business brief. Get the 5 hypotheses that could kill your
          idea, ranked by criticality, plus a cheap 2-week test for the most
          dangerous one.
        </p>
      </div>

      <div className="space-y-10">
        <BriefInput />
        <HypothesisOutput />
      </div>

      <div className="mt-20 pt-16 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="rounded-[10px] border border-border bg-secondary p-6">
            <p className="eyebrow mb-3">Ask</p>
            <h3 className="font-lora text-[18px] font-semibold text-foreground leading-snug mb-2">
              Surface what could kill your idea
            </h3>
            <p className="text-[16px] text-muted-foreground leading-relaxed">
              5 critical assumptions ranked by how much risk they carry before you write a line of code.
            </p>
          </div>
          <div className="rounded-[10px] border border-border bg-secondary p-6">
            <p className="eyebrow mb-3">Test</p>
            <h3 className="font-lora text-[18px] font-semibold text-foreground leading-snug mb-2">
              Pressure-test with a persona
            </h3>
            <p className="text-[16px] text-muted-foreground leading-relaxed">
              Design a cheap 2-week experiment and run a live interview with a simulated customer.
            </p>
          </div>
          <div className="rounded-[10px] border border-border bg-secondary p-6">
            <p className="eyebrow mb-3">Learn</p>
            <h3 className="font-lora text-[18px] font-semibold text-foreground leading-snug mb-2">
              Know what you actually learned
            </h3>
            <p className="text-[16px] text-muted-foreground leading-relaxed">
              A structured Learning Card that turns raw interview signal into a decision.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
