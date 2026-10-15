import { client, PERSONA_MODEL } from "@/lib/anthropic";
import { buildPersonaPrompt, type PersonaFields } from "@/lib/prompts";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body", 400);
  }

  const persona = body.persona as PersonaFields | undefined;
  const messages = body.messages as IncomingMessage[] | undefined;

  if (!persona?.name?.trim() || !persona?.role?.trim()) {
    return errorResponse("Persona name and role are required", 400);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return errorResponse("Messages array is required", 400);
  }

  const systemPrompt = buildPersonaPrompt(persona);

  try {
    const messageStream = client.messages.stream({
      model: PERSONA_MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
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
          console.error("Persona stream error:", error);
          try {
            controller.enqueue(
              encoder.encode("\n\n[Connection interrupted. Try sending your message again.]")
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
    console.error("Persona API error:", error);
    return errorResponse("Failed to connect to AI service. Try again.", 502);
  }
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
