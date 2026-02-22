import { NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_BASE = "https://api.moonshot.ai/v1";

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

    if (!KIMI_API_KEY) {
      return NextResponse.json({ content: FALLBACK_MESSAGE }, { status: 200 });
    }

    const apiMessages = buildMessages(messages);
    const res = await fetch(`${KIMI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "kimi-k2.5",
        max_tokens: 1024,
        messages: apiMessages,
        thinking: { type: "disabled" },
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
