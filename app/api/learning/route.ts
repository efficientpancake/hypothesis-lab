import { client, LEARNING_MODEL } from "@/lib/anthropic";
import { getLearningCardPrompt } from "@/lib/learning-prompt";
import type { PersonaFields } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body", 400);
  }

  const brief = (body.brief as string | undefined) ?? "";
  const hypotheses = (body.hypotheses as string | undefined) ?? "";
  const persona = body.persona as PersonaFields | undefined;
  const transcript = body.transcript as IncomingMessage[] | undefined;

  if (!hypotheses.trim()) {
    return errorResponse("Hypotheses are required", 400);
  }
  if (!persona?.name?.trim() || !persona?.role?.trim()) {
    return errorResponse("Persona is required", 400);
  }
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return errorResponse("Transcript is required", 400);
  }

  let systemPrompt: string;
  try {
    systemPrompt = getLearningCardPrompt();
  } catch (error) {
    console.error("Failed to load learning prompt:", error);
    return errorResponse("Server configuration error — prompt file not found", 500);
  }

  const personaLines: string[] = [
    `Name: ${persona.name}`,
    `Role: ${persona.role}`,
  ];
  if (persona.ageRange?.trim()) personaLines.push(`Age range: ${persona.ageRange.trim()}`);
  if (persona.context?.trim()) personaLines.push(`Context: ${persona.context.trim()}`);
  if (persona.goals?.trim()) personaLines.push(`Goals: ${persona.goals.trim()}`);
  if (persona.painPoints?.trim()) personaLines.push(`Pain points: ${persona.painPoints.trim()}`);
  if (persona.personality?.trim()) personaLines.push(`Personality: ${persona.personality.trim()}`);
  if (persona.decisionMaking?.trim()) personaLines.push(`Decision-making: ${persona.decisionMaking.trim()}`);
  if (persona.additionalNotes?.trim()) personaLines.push(`Additional notes: ${persona.additionalNotes.trim()}`);

  const transcriptText = transcript
    .map((m) => `${m.role === "user" ? "Founder" : persona.name}: ${m.content}`)
    .join("\n\n");

  const userMessage = `## Brief
${brief.trim() || "(no brief provided)"}

## Hypotheses
${hypotheses}

## Persona definition
${personaLines.join("\n")}

## Interview transcript
${transcriptText}

Now produce the Learning Card following the format in your system prompt. Quote the persona, ground every claim in the transcript, and end with a Next Step.`;

  try {
    const messageStream = client.messages.stream({
      model: LEARNING_MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of messageStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Learning stream error:", error);
          try {
            controller.enqueue(
              encoder.encode("\n\n[Connection interrupted. Refresh and try again.]")
            );
            controller.close();
          } catch {
            controller.error(error);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Learning API error:", error);
    return errorResponse("Failed to connect to AI service. Try again.", 502);
  }
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
