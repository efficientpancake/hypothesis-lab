import { client, MODEL } from "@/lib/anthropic";
import { getHypothesisEngineerPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Accept either { brief } (first turn) or { messages: [...] } (follow-ups)
  let messages: IncomingMessage[];
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages.map((m: IncomingMessage) => ({
      role: m.role,
      content: m.content,
    }));
  } else if (typeof body.brief === "string" && body.brief.trim()) {
    messages = [{ role: "user", content: body.brief.trim() }];
  } else {
    return new Response(
      JSON.stringify({ error: "Either 'brief' or non-empty 'messages' array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = getHypothesisEngineerPrompt();

  const messageStream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages,
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
        console.error("Hypothesis stream error:", error);
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
