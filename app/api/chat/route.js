import { NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const FALLBACK_MESSAGE =
  "Чат тимчасово недоступний. Напишіть нам: lossotrade@gmail.com або зателефонуйте +380 (98) 040-25-00, +380 (93) 040-25-00.";

function buildGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Потрібен масив messages" },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ content: FALLBACK_MESSAGE }, { status: 200 });
    }

    const contents = buildGeminiContents(messages);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: CHAT_SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini error:", res.status, err);
      return NextResponse.json(
        {
          content:
            "Помилка зʼєднання. Дзвоніть менеджеру: +380 (98) 040-25-00 або пишіть lossotrade@gmail.com.",
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const textPart = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const content =
      (typeof textPart === "string" && textPart.trim()) || FALLBACK_MESSAGE;
    return NextResponse.json({ content });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      {
        content:
          "Щось пішло не так. Звʼяжіться з нами: lossotrade@gmail.com, +380 (98) 040-25-00.",
      },
      { status: 200 }
    );
  }
}
