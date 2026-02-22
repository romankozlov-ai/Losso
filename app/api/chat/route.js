import { NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";

const KIMI_API_KEY = process.env.KIMI_API_KEY?.trim();
// Ключ з Kimi Code (sk-kimi-...) — api.kimi.com/coding; ключ з Moonshot — api.moonshot.ai
const KIMI_BASE =
  process.env.KIMI_API_BASE?.trim() ||
  (KIMI_API_KEY?.startsWith("sk-kimi-")
    ? "https://api.kimi.com/coding/v1"
    : "https://api.moonshot.ai/v1");

const FALLBACK_MESSAGE =
  "Чат тимчасово недоступний. Напишіть нам: lossotrade@gmail.com або зателефонуйте +380 (98) 040-25-00, +380 (93) 040-25-00.";

function buildMessages(messages) {
  const out = [{ role: "system", content: CHAT_SYSTEM_PROMPT }];
  for (const m of messages) {
    const role = m.role === "assistant" ? "assistant" : "user";
    const content = (m.content || "").trim();
    if (content.length > 0) out.push({ role, content });
  }
  return out;
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

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
    const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
    if (GEMINI_API_KEY) {
      try {
        const geminiHistory = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: (m.content || "").trim() }],
        })).filter((m) => m.parts[0].text.length > 0);
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
              contents: geminiHistory,
              generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
            }),
          }
        );
        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n");
          if (text) return NextResponse.json({ content: text });
        }
      } catch (_) {}
    }

    if (!KIMI_API_KEY) {
      return NextResponse.json({ content: FALLBACK_MESSAGE }, { status: 200 });
    }

    const apiMessages = buildMessages(messages);
    const isKimiCoding = KIMI_BASE.includes("api.kimi.com");
    const res = await fetch(`${KIMI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: isKimiCoding ? "kimi-for-coding" : "kimi-k2.5",
        max_tokens: 1024,
        messages: apiMessages,
        ...(isKimiCoding ? {} : { thinking: { type: "disabled" } }),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Kimi API error:", res.status, err);
      return NextResponse.json(
        {
          content:
            "Помилка зʼєднання. Дзвоніть менеджеру: +380 (98) 040-25-00 або пишіть lossotrade@gmail.com.",
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content?.trim() || FALLBACK_MESSAGE;
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
