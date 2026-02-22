"use client";

import { useState, useRef, useEffect } from "react";

const CONTACT_PHONE = "+380 (98) 040-25-00";
const CONTACT_EMAIL = "lossotrade@gmail.com";

const QUICK_QUESTIONS = [
  "Яка вартість доставки?",
  "Як оплатити замовлення?",
  "Які є товари для кухні?",
  "Як зв'язатися з вами?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Вітаю! 👋 Я — помічник магазину LOSSO. Допоможу з вибором товарів, розкажу про доставку та оплату. Чим можу допомогти?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (textOrEvent) => {
    const text = typeof textOrEvent === "string" ? textOrEvent.trim() : input.trim();
    if (!text || loading) return;
    if (typeof textOrEvent !== "string") setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const history = [...messages, { role: "user", content: text }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      const reply = data.content || "Напишіть нам: " + CONTACT_EMAIL;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Помилка зʼєднання. Дзвоніть ${CONTACT_PHONE} або пишіть ${CONTACT_EMAIL}.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="w-full max-w-sm rounded-2xl border border-losso-sand bg-white shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header — same tone as site header/footer */}
          <div className="bg-losso-stone text-white px-4 py-3 flex items-center justify-between">
            <span className="font-display font-semibold">Чат LOSSO</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Закрити"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Messages — LOSSO palette */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px] bg-losso-cream"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[85%] text-sm ${
                    msg.role === "user"
                      ? "bg-losso-sage text-white"
                      : "bg-losso-sand text-losso-stone"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-losso-sand text-losso-muted text-sm flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-losso-sage animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-losso-sage animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-losso-sage animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                <p className="w-full text-xs font-semibold text-losso-muted mb-1">Часті запитання:</p>
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border border-losso-sand bg-white px-3 py-1.5 text-xs font-medium text-losso-stone hover:border-losso-sage hover:text-losso-sage transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Chat bottom: input + send + contact link — same structure as site forms */}
          <div className="border-t border-losso-sand bg-white p-3 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(e)}
                placeholder="Напишіть повідомлення..."
                className="flex-1 rounded-xl border border-losso-sand px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-losso-sage/50 focus:border-losso-sage min-h-[44px]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-losso-sage text-white px-4 py-2.5 text-sm font-medium hover:bg-losso-sage-dark disabled:opacity-50 transition-colors min-h-[44px] shrink-0"
              >
                Відправити
              </button>
            </div>
            <p className="text-center">
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                className="text-xs text-losso-muted hover:text-losso-sage transition-colors"
              >
                ☎ {CONTACT_PHONE}
              </a>
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-losso-sage text-white p-4 shadow-lg hover:bg-losso-sage-dark transition-colors min-h-[56px] min-w-[56px] flex items-center justify-center"
        aria-label={open ? "Закрити чат" : "Відкрити чат"}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
