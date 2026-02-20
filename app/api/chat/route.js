import { NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const FALLBACK_MESSAGE =
  "Чат тимчасово недоступний. Напишіть нам: lossotrade@gmail.com або зателефонуйте +380 (98) 040-25-00, +380 (93) 040-25-00.";

function buildDeepSeekMessages(messages) {
  const out = [{ role: "system", content: CHAT_SYSTEM_PROMPT }];
  for (const m of messages) {
    const role = m.role === "user" ? "user" : m.role === "assistant" ? "assistant" : "user";
    out.push({ role, content: m.content || "" });
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

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ content: FALLBACK_MESSAGE }, { status: 200 });
    }

    const apiMessages = buildDeepSeekMessages(messages);
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("DeepSeek API error:", res.status, err);
      return NextResponse.json(
        {
          content:
            "Помилка зʼєднання. Дзвоніть менеджеру: +380 (98) 040-25-00 або пишіть lossotrade@gmail.com.",
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    const content =
      (typeof text === "string" && text.trim()) || FALLBACK_MESSAGE;
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
