import { client, MODEL } from "@/lib/anthropic";
import { buildPersonaPrompt, type PersonaFields } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const persona = body.persona as PersonaFields | undefined;
  const messages = body.messages as IncomingMessage[] | undefined;

  if (!persona?.name?.trim() || !persona?.role?.trim()) {
    return new Response(
      JSON.stringify({ error: "Persona name and role are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = buildPersonaPrompt(persona);

  const messageStream = client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
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
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
