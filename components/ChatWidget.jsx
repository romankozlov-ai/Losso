"use client";

import { useState, useRef, useEffect } from "react";

const CONTACT_PHONE = "+380 (98) 040-25-00";
const CONTACT_EMAIL = "lossotrade@gmail.com";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Привіт! Я консультант LOSSO. Питайте про товари, ціни та доставку. Можу підказати контакти менеджера.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
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
        <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
          <div className="bg-stone-800 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">Чат LOSSO</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-stone-700"
              aria-label="Закрити"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[320px]"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[85%] text-sm ${
                    msg.role === "user"
                      ? "bg-stone-800 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2 bg-stone-100 text-stone-500 text-sm">
                  Думаю...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-stone-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Напишіть повідомлення..."
              className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              disabled={loading}
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-stone-800 text-white px-4 py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
            >
              Відправити
            </button>
          </div>
          <div className="px-3 pb-2 pt-0 text-center">
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
              className="text-xs text-stone-500 hover:text-stone-700"
            >
              ☎️ {CONTACT_PHONE}
            </a>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-stone-800 text-white p-4 shadow-lg hover:bg-stone-700 transition"
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
