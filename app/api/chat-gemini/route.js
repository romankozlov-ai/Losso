import { NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

const FALLBACK_MESSAGE =
  "Чат тимчасово недоступний. Напишіть нам: lossotrade@gmail.com або зателефонуйте +380 (98) 040-25-00, +380 (93) 040-25-00.";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Потрібен масив messages" }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ content: FALLBACK_MESSAGE }, { status: 200 });
    }

    const geminiHistory = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: (m.content || "").trim() }],
    })).filter((m) => m.parts[0].text.length > 0);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
          contents: geminiHistory,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", res.status, err);
      return NextResponse.json(
        { content: "Помилка зʼєднання. Дзвоніть +380 (98) 040-25-00 або пишіть lossotrade@gmail.com." },
        { status: 200 }
      );
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .filter(Boolean)
        .join("\n") || FALLBACK_MESSAGE;

    return NextResponse.json({ content: text });
  } catch (e) {
    console.error("Chat Gemini error:", e);
    return NextResponse.json(
      { content: "Щось пішло не так. Звʼяжіться з нами: lossotrade@gmail.com, +380 (98) 040-25-00." },
      { status: 200 }
    );
  }
}
