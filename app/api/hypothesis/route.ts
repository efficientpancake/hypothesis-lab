import { client, MODEL } from "@/lib/anthropic";
import { getHypothesisEngineerPrompt } from "@/lib/hypothesis-prompt";

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

  let messages: IncomingMessage[];
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages.map((m: IncomingMessage) => ({
      role: m.role,
      content: m.content,
    }));
  } else if (typeof body.brief === "string" && body.brief.trim()) {
    messages = [{ role: "user", content: body.brief.trim() }];
  } else {
    return errorResponse(
      "Either 'brief' or non-empty 'messages' array is required",
      400
    );
  }

  let systemPrompt: string;
  try {
    systemPrompt = getHypothesisEngineerPrompt();
  } catch (error) {
    console.error("Failed to load hypothesis prompt:", error);
    return errorResponse("Server configuration error — prompt file not found", 500);
  }

  try {
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
          try {
            controller.enqueue(
              encoder.encode(
                "\n\n[Connection interrupted. Try sending your message again.]"
              )
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
    console.error("Hypothesis API error:", error);
    return errorResponse("Failed to connect to AI service. Try again.", 502);
  }
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
