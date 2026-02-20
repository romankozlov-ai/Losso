import { NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const FALLBACK_MESSAGE =
  "Чат тимчасово недоступний. Напишіть нам: lossotrade@gmail.com або зателефонуйте +380 (98) 040-25-00, +380 (93) 040-25-00.";

function buildClaudeMessages(messages) {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : m.role === "assistant" ? "assistant" : "user",
    content: (m.content || "").trim(),
  })).filter((m) => m.content.length > 0);
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

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ content: FALLBACK_MESSAGE }, { status: 200 });
    }

    const apiMessages = buildClaudeMessages(messages);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: CHAT_SYSTEM_PROMPT,
        messages: apiMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Claude API error:", res.status, err);
      return NextResponse.json(
        {
          content:
            "Помилка зʼєднання. Дзвоніть менеджеру: +380 (98) 040-25-00 або пишіть lossotrade@gmail.com.",
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    const textBlocks = (data.content || []).filter((c) => c.type === "text").map((c) => c.text);
    const text = textBlocks.join("").trim();
    const content = text || FALLBACK_MESSAGE;
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
