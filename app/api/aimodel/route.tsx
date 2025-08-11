import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1", // Groq's OpenAI-compatible endpoint
  apiKey: process.env.GROQ_API_KEY, // Set this in .env.local
});

// 🟢 Non-final: Collect trip details step-by-step
const PROMPT = `
You are an AI Trip Planner Agent.

You must always respond in JSON format only.
Never send plain text or extra words.

JSON Schema:
{
  "resp": "string — your question for the user",
  "ui": "budget | groupSize | tripDuration | destination | startingLocation | final"
}

Rules:
1. Ask ONE relevant trip-related question at a time.
2. Ask in this order:
   - Starting location (source)
   - Destination
   - Group size
   - Budget
   - Trip duration
   - Travel interests
   - Special requirements
3. Wait for user’s answer before moving on.
4. If information is missing or unclear, ask for clarification.
5. When ready to generate the trip, set "ui" to "final".
`;

// 🟢 Final: Generate complete trip plan
const FINAL_PROMPT = `
You are a travel assistant.
Generate ONLY a JSON object with this exact schema:
{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": { "latitude": "number", "longitude": "number" },
        "rating": "number",
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": "number",
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string",
            "geo_coordinates": { "latitude": "number", "longitude": "number" },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}

Rules:
- Respond ONLY with valid JSON.
- No markdown, no explanations.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, isFinal } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty messages array" },
        { status: 400 }
      );
    }

    const systemPrompt = isFinal ? FINAL_PROMPT : PROMPT;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const rawMessage = response.choices[0]?.message?.content?.trim();
    console.log("🧠 AI Raw Response:", rawMessage);

    if (!rawMessage) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 400 }
      );
    }

    const parsed = safeParseJSON(rawMessage);

    // 🟢 If Final Mode → must be valid trip_plan JSON
    if (isFinal) {
      if (!parsed?.trip_plan) {
        return NextResponse.json(
          { error: "Final output is not valid trip plan JSON" },
          { status: 500 }
        );
      }
      return NextResponse.json(parsed);
    }

    // 🟢 Non-Final Mode → must have resp + ui
    if (parsed?.resp && parsed?.ui) {
      return NextResponse.json(parsed);
    }

    // 🟡 Fallback if AI sent plain text
    return NextResponse.json({
      resp: rawMessage,
      ui: detectUIKeyword(rawMessage),
    });

  } catch (error: any) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🔹 Helpers
function safeParseJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function detectUIKeyword(text: string) {
  const lower = text.toLowerCase().trim();

  // Match full intent instead of partial words
  if (/final/.test(lower)) return "final";
  if (/budget/.test(lower)) return "budget";
  if (/group/.test(lower)) return "groupSize";
  if (/duration|how\s+many\s+days|trip\s+length/.test(lower))
    return "tripDuration";
  if (/destination/.test(lower)) return "destination";
  if (/starting|origin/.test(lower)) return "startingLocation";
  if (/interest|activities|adventure|relaxation|culture/.test(lower))
    return "interests";
  return null;
}

