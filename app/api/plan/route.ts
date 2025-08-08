import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt: string = (body?.prompt || "").toString();

    if (!prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const mock = `Trip Plan (Mock)\n\nRequest: ${prompt}\n\nDay 1: Arrival and City Stroll\n- Check in to your hotel\n- Evening walk around the main square\n\nDay 2: Landmarks\n- Visit two iconic sights in the morning\n- Lunch at a local eatery\n- Museum in the afternoon\n\nDay 3: Day Trip\n- Scenic train ride to nearby town\n- Explore markets and viewpoints\n\nDay 4: Food & Culture\n- Cooking class or food tour\n- Sunset viewpoint\n\nDay 5: Free day & Departure\n- Souvenir shopping\n- Head to airport\n\nBudget Tips:\n- Use transit passes\n- Book attractions online for discounts`;
      return new Response(JSON.stringify({ plan: mock }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If OPENAI_API_KEY is provided, call OpenAI Responses API
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `You are a travel planner. Based on this request, produce a concise, day-by-day trip plan with headings and bullet points. Keep it practical and organized. Request: ${prompt}`,
      }),
      // Avoid Next.js cache for dynamic requests
      cache: "no-store",
    });

    if (!openAiResponse.ok) {
      const txt = await openAiResponse.text();
      return new Response(JSON.stringify({ error: "LLM error", detail: txt }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const json = await openAiResponse.json();
    // The Responses API returns text in different shapes. Try common paths.
    let content = "";
    if (typeof json.output_text === "string") {
      content = json.output_text;
    } else if (Array.isArray(json.output) && json.output.length > 0) {
      const first = json.output[0];
      if (first?.content?.length) {
        const textPart = first.content.find((c: any) => c.type === "output_text" || c.type === "text");
        content = textPart?.text || JSON.stringify(json.output);
      }
    }
    if (!content) content = JSON.stringify(json);

    return new Response(JSON.stringify({ plan: content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}