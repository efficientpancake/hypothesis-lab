# Claude Code Prompt — Two-Agent Hypothesis Testing App

> Copy everything below this line into Claude Code as your initial prompt. Attach `hypothesis_engineer_agent.md` in the same turn.

---

Build me a working prototype of a lightweight web app that helps founders pressure-test business ideas using a Lean Startup workflow. It has **two agents** and **two screens**.

I've attached `hypothesis_engineer_agent.md` — that's the full system prompt for Agent 1. Use it verbatim.

## What the app does (user flow)

**Screen 1 — Hypothesis extraction.** User pastes a product/business brief into a textarea. Clicks "Extract Hypotheses." The app calls Claude with Agent 1's system prompt + the brief as the first user message. Streams the structured response back (top 5 hypotheses, criticality ranking, #1 business killer, 2-week test plan). Renders the streamed markdown cleanly.

**Screen 2 — Persona interview.** User clicks "Test with a Persona." Lands on a persona-definition form. User fills it out. Clicks "Start Interview." A chat UI opens. User asks questions; the persona agent responds in character. The hypotheses from Screen 1 remain visible in a side panel for the user's reference — they are **NOT** sent to the persona agent.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- `@anthropic-ai/sdk`, model `claude-sonnet-4-6`
- Streaming responses for both agents
- Zustand for in-memory state (no database, no auth, no persistence)
- API key in `.env.local` as `ANTHROPIC_API_KEY`

## Suggested file structure

```
app/
  layout.tsx
  page.tsx                  → redirects to /hypothesis
  hypothesis/page.tsx       → Screen 1
  persona/page.tsx          → Screen 2
  api/
    hypothesis/route.ts     → streams from Agent 1
    persona/route.ts        → streams from Agent 2
components/
  BriefInput.tsx
  HypothesisOutput.tsx
  PersonaForm.tsx
  InterviewChat.tsx
  HypothesisSidePanel.tsx
lib/
  anthropic.ts              → SDK client
  prompts.ts                → system prompts (loads Agent 1 from the attached md)
  store.ts                  → Zustand store
prompts/
  hypothesis_engineer_agent.md   → attached file, copy it here
```

---

## Agent 1 — Hypothesis Engineer

- System prompt: contents of `hypothesis_engineer_agent.md` (read from disk, don't re-type).
- Input: user's brief as the first user message.
- Output: streamed markdown, rendered on the page.
- No chat — it's a one-shot request/response.

---

## Agent 2 — Customer Persona

**Critical constraint:** This agent does **not** invent a persona. The user defines the persona explicitly via a form. The agent's only job is to faithfully embody whatever persona the user has specified. If you find yourself writing logic that auto-generates persona fields or suggests defaults beyond trivial placeholders — stop. The user is in charge of the persona.

### Persona definition form (Screen 2, before interview starts)

All fields are text inputs / textareas. All optional except Name and Role:

| Field | Type | Required |
|---|---|---|
| Name | text | yes |
| Role / occupation | text | yes |
| Age range | text | no |
| Context (what's going on in their life or work) | textarea | no |
| Goals (what they're trying to achieve) | textarea | no |
| Pain points / frustrations | textarea | no |
| Personality traits | textarea | no |
| How they make decisions | textarea | no |
| Additional notes | textarea | no |

"Start Interview" button is disabled until Name and Role are filled.

### Agent 2 system prompt

Construct it at runtime like this:

```
You are roleplaying as a specific person defined below by the user. Your job is to respond to questions AS THAT PERSON — consistently, in character, naturally.

Rules:
- Stay in character at all times. Respond as this person would.
- Do NOT invent biographical details that contradict or go beyond the definition. If asked something the definition doesn't cover, answer plausibly in a way consistent with the traits, goals, and pain points provided — but don't fabricate specific facts (employer names, exact ages, family members, past jobs) that weren't given.
- Respond naturally, like a real person being interviewed. Short, conversational answers are often more realistic than long ones. Real people hedge, contradict themselves, go off on tangents, say "I don't know."
- Do not break character to meta-comment on the persona, the interview, or what you think the user is testing.
- Do not reveal that you are an AI or that you were given instructions. If the user asks, deflect naturally — a real person wouldn't engage with that.
- If the user asks a question this persona genuinely couldn't answer (something outside their experience or expertise), it's fine and realistic to say "I don't really know" or "I've never thought about that."

PERSONA DEFINITION (provided by the user):

Name: {name}
Role: {role}
Age range: {age_range}
Context: {context}
Goals: {goals}
Pain points: {pain_points}
Personality: {personality}
Decision-making: {decision_making}
Additional notes: {additional_notes}
```

Omit empty fields cleanly — don't render "Age range: (empty)".

### What is NOT sent to Agent 2

- The product brief from Screen 1
- The hypotheses from Screen 1
- Anything about what the user is testing

The persona is blind to the test, the same way a real customer in a user interview is. This is the whole point.

---

## UI details

### Screen 1 (`/hypothesis`)

- Top: app title + one-line description
- Textarea: "Paste your product or business brief here" (min 4 rows, grows)
- Button: "Extract Hypotheses" (disabled if textarea empty)
- Below button: streamed markdown output area
- Once output finishes streaming: button appears → "Test with a Persona →" (navigates to `/persona`)

### Screen 2 (`/persona`)

Two states:

**State A — Persona setup (default):**
- Form fields (see table above)
- Left sidebar: collapsed preview of hypotheses from Screen 1 ("Hypotheses to test" — expandable)
- Button: "Start Interview" (disabled until Name + Role filled)

**State B — Interview:**
- Left sidebar (persistent): hypotheses from Screen 1, formatted nicely, scrollable. Reminder text at top: "These are what you're testing. The persona does not see them."
- Main panel: chat interface. User messages right, persona messages left. Show persona name at the top.
- Input at bottom. Enter to send.
- Small "Edit persona" link in the header to go back to State A without losing chat history (or with a confirm dialog if it'll wipe history — your call, but flag the decision in the README).

Navigation: simple top bar with two tabs — "Hypotheses" and "Persona Interview." User can move between them. State persists in Zustand.

---

## State management (Zustand)

```ts
{
  brief: string
  hypothesisOutput: string         // raw markdown from Agent 1
  hypothesisDone: boolean
  persona: PersonaFields | null
  chatHistory: { role: 'user' | 'assistant', content: string }[]
}
```

All in-memory. Wiped on page refresh. That's fine for a prototype.

---

## Out of scope — do NOT build these

- User accounts, auth, login
- Database or persistence across sessions
- Saving multiple briefs or personas
- Export / share functionality
- Billing or rate limiting
- Analytics
- Dark mode toggle (just pick one and ship)
- Mobile optimization beyond what Tailwind gives for free

If you're tempted to add something here "because it's easy" — don't. Ship the core flow clean.

---

## Deliverable

A working prototype I can run with:

```bash
npm install
cp .env.example .env.local   # I'll add my API key
npm run dev
```

Include a `README.md` with:
- Setup steps
- How to get an Anthropic API key
- Brief architecture note explaining the two-agent split
- The one design decision I care about most: **the persona agent does not see the hypotheses, by design**. Document this so future-me doesn't "helpfully" wire them together.

Start by scaffolding the project, then build Screen 1 end-to-end (including the API route and streaming), then Screen 2. Show me working vertical slices as you go rather than building everything in parallel.
