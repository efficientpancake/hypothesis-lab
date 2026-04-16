# Hypothesis Lab

A two-agent prototype for pressure-testing business ideas using the Lean Startup method.

- **Agent 1 — Hypothesis Engineer** extracts the 5 most critical assumptions from a business brief, ranks them by criticality, names the #1 business killer, and designs a 2-week test.
- **Agent 2 — Customer Persona** roleplays a persona you define yourself. You interview it like a real customer.

---

## Setup

```bash
npm install
cp .env.example .env.local
# open .env.local and paste your Anthropic API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Getting an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or sign in
3. Navigate to **API Keys** → **Create Key**
4. Paste the `sk-ant-...` value into `.env.local` as `ANTHROPIC_API_KEY`

---

## How it works

### Screen 1 — Hypothesis extraction (`/hypothesis`)

Paste a brief, click **Extract Hypotheses**. The server streams a structured markdown response from Claude using the Hypothesis Engineer system prompt (`prompts/hypothesis_engineer_agent.md`). Output is rendered in place as it streams.

When extraction finishes, a **Test with a Persona →** button appears. Clicking it navigates to `/persona` with the hypotheses held in memory for reference.

### Screen 2 — Persona interview (`/persona`)

Two states on this page:

**Setup state.** A form. You define the persona yourself — name, role, age, context, goals, pain points, personality, decision-making logic, and any additional notes. Only name and role are required. The persona agent **does not invent or auto-fill fields for you.** If the form is blank, the interview will be blank.

**Interview state.** A chat interface. You ask questions; the persona responds in character, using only the persona definition and the prior conversation. The previously-extracted hypotheses are shown in a sidebar as a reminder of what you're testing.

---

## Design decision worth preserving

**The persona agent does not see the hypotheses.** By design.

A real customer interview is only useful if the interviewee is blind to what you're trying to validate. If the persona agent knows which hypotheses you're testing, it will (unconsciously and consistently) tailor its answers to those hypotheses — defeating the point of the test. You'd be measuring the agent's helpfulness, not the persona's authentic reaction.

The hypotheses appear in the side panel **for the human interviewer's reference only.** They are never sent to the persona agent's API call. Do not "helpfully" wire them into the persona's system prompt later — that would silently break the methodology.

---

## Architecture

```
app/
  hypothesis/page.tsx      Screen 1 — brief input + streamed output
  persona/page.tsx         Screen 2 — persona form OR chat UI
  api/
    hypothesis/route.ts    POST — streams Agent 1 response
    persona/route.ts       POST — streams Agent 2 response
components/
  BriefInput.tsx           Screen 1 input form
  HypothesisOutput.tsx     Screen 1 streamed markdown output
  PersonaForm.tsx          Screen 2 persona definition form
  InterviewChat.tsx        Screen 2 chat interface
  HypothesisSidePanel.tsx  Left rail showing hypotheses on Screen 2
  TopNav.tsx               Top bar with tab navigation
  ui/                      Button, Input, Textarea, Card primitives
lib/
  anthropic.ts             Anthropic SDK client + MODEL constant
  prompts.ts               Loads Agent 1 prompt from disk; builds Agent 2 prompt from form fields
  store.ts                 Zustand store — in-memory only
  utils.ts                 cn() helper
prompts/
  hypothesis_engineer_agent.md   Agent 1's full system prompt
```

### Streaming

Both API routes return `text/plain` streams built from `client.messages.stream(...)`. The client reads with a `ReadableStreamDefaultReader` and pushes chunks into the Zustand store as they arrive. No SSE framing — plain UTF-8 text chunks.

### State

All state lives in a single Zustand store (`lib/store.ts`):

```ts
{
  brief: string
  hypothesisOutput: string
  hypothesisDone: boolean
  persona: PersonaFields | null
  chatHistory: ChatMessage[]
}
```

No database, no persistence, no auth. Refresh wipes everything. That is intentional for a prototype — the moment you add persistence you also need multi-brief management, rename-and-save, etc.

### Edit persona behaviour (while in an interview)

Clicking **Edit persona** during an active chat shows a `window.confirm()` dialog:

> *"Editing the persona will clear this chat history. Continue?"*

Rationale: a chat history is tied to the specific persona that produced it. Carrying it forward after you change the persona would produce incoherent replies (the new persona "remembering" things it never said). Wiping the chat is the honest behaviour.

If you haven't sent any messages yet, no confirm dialog fires — editing just reopens the form.

---

## Out of scope (deliberately not built)

- Accounts, auth, multi-user
- Database or persistence
- Saving multiple briefs or personas
- Export / share
- Rate limiting, billing
- Dark mode toggle
- Analytics

If you're tempted to add one of these — please first ask whether the core flow is actually good enough to justify the extra surface area.
