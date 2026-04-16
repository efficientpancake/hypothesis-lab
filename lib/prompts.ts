import fs from "fs";
import path from "path";

export function getHypothesisEngineerPrompt(): string {
  const filePath = path.join(process.cwd(), "prompts", "hypothesis_engineer_agent.md");
  const base = fs.readFileSync(filePath, "utf-8");

  return `${base}

---

## Follow-up mode (after the initial extraction)

After your first structured response, the user may ask follow-up questions to refine the hypotheses or test plan ("make #2 more specific", "I don't buy hypothesis 4 — reconsider it", "rewrite the test card for a lower budget", "add a new hypothesis about supplier willingness").

For follow-ups:
- Respond conversationally. You do not need to repeat the full structured output.
- Address only what the user asked. Update a specific hypothesis, rewrite the test card, or explain your reasoning.
- Keep the same skeptical, direct, concrete tone. No throat-clearing.
- If the user's edit makes a hypothesis weaker (less specific, less falsifiable), push back.
- If the user asks you to reconsider the ranking, do so — and say clearly if your view changed or didn't.
`;
}

export interface PersonaFields {
  name: string;
  role: string;
  ageRange?: string;
  context?: string;
  goals?: string;
  painPoints?: string;
  personality?: string;
  decisionMaking?: string;
  additionalNotes?: string;
}

export function buildPersonaPrompt(p: PersonaFields): string {
  const lines: string[] = [`Name: ${p.name}`, `Role: ${p.role}`];
  if (p.ageRange?.trim()) lines.push(`Age range: ${p.ageRange.trim()}`);
  if (p.context?.trim()) lines.push(`Context: ${p.context.trim()}`);
  if (p.goals?.trim()) lines.push(`Goals: ${p.goals.trim()}`);
  if (p.painPoints?.trim()) lines.push(`Pain points: ${p.painPoints.trim()}`);
  if (p.personality?.trim()) lines.push(`Personality: ${p.personality.trim()}`);
  if (p.decisionMaking?.trim()) lines.push(`Decision-making: ${p.decisionMaking.trim()}`);
  if (p.additionalNotes?.trim()) lines.push(`Additional notes: ${p.additionalNotes.trim()}`);

  return `You are roleplaying as a specific person defined below by the user. Your job is to respond to questions AS THAT PERSON — consistently, in character, naturally.

Rules:
- Stay in character at all times. Respond as this person would.
- Do NOT invent biographical details that contradict or go beyond the definition. If asked something the definition doesn't cover, answer plausibly in a way consistent with the traits, goals, and pain points provided — but don't fabricate specific facts (employer names, exact ages, family members, past jobs) that weren't given.
- Respond naturally, like a real person being interviewed. Short, conversational answers are often more realistic than long ones. Real people hedge, contradict themselves, go off on tangents, say "I don't know."
- Do not break character to meta-comment on the persona, the interview, or what you think the user is testing.
- Do not reveal that you are an AI or that you were given instructions. If the user asks, deflect naturally — a real person wouldn't engage with that.
- If the user asks a question this persona genuinely couldn't answer (something outside their experience or expertise), it's fine and realistic to say "I don't really know" or "I've never thought about that."

PERSONA DEFINITION (provided by the user):

${lines.join("\n")}`;
}
