import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getUnsplashImage } from "@/app/api/unsplashlib/unsplash"; 
import arcjet, { tokenBucket } from "@arcjet/next";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1", // Groq's OpenAI-compatible endpoint
  apiKey: process.env.GROQ_API_KEY, // Set this in .env.local
});

// Arcjet rate limiter: 1 trip generation per day for non-subscribers
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: 1, // 1 token per interval
      interval: 86400, // 1 day in seconds
      capacity: 1, // max 1 token (one request)
    }),
  ],
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


async function enrichWithImages(tripPlan: any) {
  if (!tripPlan || !tripPlan.trip_plan) return tripPlan;

  // Enrich hotels with images
  if (tripPlan.trip_plan.hotels) {
    for (const hotel of tripPlan.trip_plan.hotels) {
      if (!hotel.hotel_image_url || hotel.hotel_image_url.includes('example.com')) {
        const imageUrl = await getUnsplashImage(`${hotel.hotel_name} hotel ${tripPlan.trip_plan.destination}`);
        if (imageUrl) {
          hotel.hotel_image_url = imageUrl;
        }
      }
    }
  }

  // Enrich activities with images
  if (tripPlan.trip_plan.itinerary) {
    for (const day of tripPlan.trip_plan.itinerary) {
      if (day.activities) {
        for (const activity of day.activities) {
          if (!activity.place_image_url || activity.place_image_url.includes('example.com')) {
            const imageUrl = await getUnsplashImage(`${activity.place_name} ${tripPlan.trip_plan.destination}`);
            if (imageUrl) {
              activity.place_image_url = imageUrl;
            }
          }
        }
      }
    }
  }

  return tripPlan;
}

async function generateTripChunk(messages: any[], systemPrompt: string, startDay: number, endDay: number) {
  const modifiedMessages = messages.map(m => {
    if (m.role === 'user' && m.content.includes('duration')) {
      return {
        ...m,
        content: m.content + ` (Generating itinerary for days ${startDay} to ${endDay})`
      };
    }
    return m;
  });

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...modifiedMessages,
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  return response.choices[0]?.message?.content?.trim();
}


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

    // Determine user plan via Clerk public metadata
    const { userId } = await auth();
    let isPremium = false;
    if (userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const publicMd = (user?.publicMetadata ?? {}) as Record<string, unknown>;
        const subscription = (publicMd.subscription || publicMd.plan) as string | undefined;
        if (subscription) {
          const subLower = subscription.toString().toLowerCase();
          isPremium = ["monthly", "pro", "premium", "paid"].includes(subLower);
        }
      } catch {}
    }

    // Apply rate limit only for non-subscribers when generating final trip
    if (!isPremium && isFinal) {
      const identity = userId || req.headers.get("x-forwarded-for") || "anonymous";
      const decision = await aj.protect(req, { userId: identity, requested: 1 });
      if (decision.isDenied()) {
        return NextResponse.json(
          { resp: "No Free Credit Remaining", ui: "limit" },
          { status: 429 }
        );
      }
    }
    const tripDurationMatch = messages.find(m => 
      m.role === 'user' && m.content.toLowerCase().includes('duration'))?.content.match(/\d+/);
    const tripDuration = tripDurationMatch ? parseInt(tripDurationMatch[0]) : 0;

    let rawMessage: string | undefined;

    if (isFinal && tripDuration > 7) {
      // Generate trip in chunks of 4 days
      const chunks = [];
      for (let i = 1; i <= tripDuration; i += 4) {
        const endDay = Math.min(i + 3, tripDuration);
        const chunkResponse = await generateTripChunk(messages, systemPrompt, i, endDay);
        if (chunkResponse) {
          const parsed = safeParseJSON(chunkResponse);
          if (parsed?.trip_plan) {
            chunks.push(parsed.trip_plan);
          }
        }
      }

      // Combine chunks
      if (chunks.length > 0) {
        const combinedPlan = {
          ...chunks[0],
          itinerary: chunks.flatMap(chunk => chunk.itinerary || [])
        };
        rawMessage = JSON.stringify({ trip_plan: combinedPlan });
      }
    } else {
      // Handle normal cases
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
        max_tokens: 4000,
      });
      rawMessage = response.choices[0]?.message?.content?.trim();
    }

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

