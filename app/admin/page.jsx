"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnon
    ? createClient(supabaseUrl, supabaseAnon)
    : null;

const STATUS_MAP = {
  new: { label: "Нове", color: "#3b82f6", bg: "#eff6ff" },
  confirmed: { label: "Підтверджено", color: "#8b5cf6", bg: "#f5f3ff" },
  processing: { label: "В обробці", color: "#f59e0b", bg: "#fffbeb" },
  shipped: { label: "Відправлено", color: "#06b6d4", bg: "#ecfeff" },
  delivered: { label: "Доставлено", color: "#22c55e", bg: "#f0fdf4" },
  cancelled: { label: "Скасовано", color: "#ef4444", bg: "#fef2f2" },
  returned: { label: "Повернено", color: "#6b7280", bg: "#f9fafb" },
};

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !supabase) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tab]);

  async function loadData() {
    if (!supabase) return;
    if (tab === "dashboard") {
      const res = await fetch("/api/admin/stats");
      setStats(await res.json());
    }
    if (tab === "orders") {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(50);
      setOrders(data || []);
    }
    if (tab === "products") {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setProducts(data || []);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!supabase) {
      alert("Supabase не налаштовано");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(`Помилка: ${error.message}`);
  }

  async function updateStatus(orderId, newStatus) {
    if (!supabase) return;
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    loadData();
  }

  async function saveProduct(productData) {
    if (!supabase) return;
    if (productData.id) {
      await supabase.from("products").update(productData).eq("id", productData.id);
    } else {
      await supabase.from("products").insert(productData);
    }
    setEditProduct(null);
    loadData();
  }

  async function deleteProduct(id) {
    if (!supabase) return;
    if (!window.confirm("Видалити товар?")) return;
    await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    loadData();
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>Завантаження...</div>
    );
  }

  if (!supabaseUrl || !supabaseAnon) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Supabase не налаштовано. Додайте змінні середовища
        NEXT_PUBLIC_SUPABASE_URL і NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f5f5",
          fontFamily: "'Source Sans 3', sans-serif",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "#fff",
            padding: 40,
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,.08)",
            width: 360,
          }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            LOSSO Admin
          </h2>
          <p
            style={{
              color: "#999",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Увійдіть для управління магазином
          </p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1.5px solid #e0e0e0",
              marginBottom: 12,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1.5px solid #e0e0e0",
              marginBottom: 20,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              background: "#1a5c38",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Увійти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Source Sans 3', sans-serif",
      }}
    >
      <aside
        style={{
          width: 220,
          background: "#1a1a1a",
          color: "#fff",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "0 20px 24px",
            borderBottom: "1px solid #333",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
            }}
          >
            LOSSO
          </h3>
          <p style={{ fontSize: 12, color: "#888" }}>Адмін-панель</p>
        </div>
        {[
          { id: "dashboard", icon: "📊", label: "Дашборд" },
          { id: "orders", icon: "📋", label: "Замовлення" },
          { id: "products", icon: "📦", label: "Товари" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "12px 20px",
              background: tab === item.id ? "#1a5c38" : "transparent",
              border: "none",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => supabase?.auth.signOut()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "12px 20px",
            background: "transparent",
            border: "none",
            color: "#888",
            fontSize: 14,
            cursor: "pointer",
            marginTop: "auto",
          }}
        >
          🚪 Вийти
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          background: "#f8f8f8",
          padding: 32,
        }}
      >
        {tab === "dashboard" && stats && (
          <div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              Дашборд
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              {[
                {
                  label: "Замовлень сьогодні",
                  value: stats.ordersToday,
                  icon: "📋",
                  color: "#3b82f6",
                },
                {
                  label: "Всього замовлень",
                  value: stats.ordersTotal,
                  icon: "📦",
                  color: "#8b5cf6",
                },
                {
                  label: "Дохід (оплачено)",
                  value: `${stats.revenue} ₴`,
                  icon: "💰",
                  color: "#22c55e",
                },
                {
                  label: "Активних товарів",
                  value: stats.productsCount,
                  icon: "🏷️",
                  color: "#f59e0b",
                },
              ].map((s, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#999",
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              Замовлення
            </h2>
            <table
              style={{
                width: "100%",
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  {["№", "Дата", "Клієнт", "Телефон", "Сума", "Статус"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#666",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const st = STATUS_MAP[order.status] || STATUS_MAP.new;
                  return (
                    <tr
                      key={order.id}
                      style={{ borderTop: "1px solid #f0f0f0" }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {order.order_number}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "#888",
                        }}
                      >
                        {new Date(order.created_at).toLocaleDateString("uk")}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 14,
                        }}
                      >
                        {order.customer_first_name} {order.customer_last_name}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 14,
                        }}
                      >
                        {order.customer_phone}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {order.total} ₴
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value)
                          }
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            fontSize: 13,
                            background: st.bg,
                            color: st.color,
                            fontWeight: 600,
                          }}
                        >
                          {Object.entries(STATUS_MAP).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Товари</h2>
              <button
                type="button"
                onClick={() => setEditProduct({})}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: "#1a5c38",
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Додати товар
              </button>
            </div>
            <table
              style={{
                width: "100%",
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  {["Фото", "Назва", "Ціна", "Наявність", "Категорія", "Дії"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#666",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => p.is_active)
                  .map((product) => (
                    <tr
                      key={product.id}
                      style={{ borderTop: "1px solid #f0f0f0" }}
                    >
                      <td style={{ padding: "8px 16px" }}>
                        {product.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt=""
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 14,
                          maxWidth: 250,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name_ua}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {product.price} ₴
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: product.in_stock
                              ? "#f0fdf4"
                              : "#fef2f2",
                            color: product.in_stock ? "#22c55e" : "#ef4444",
                          }}
                        >
                          {product.in_stock ? "Є" : "Немає"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "#888",
                        }}
                      >
                        {product.category_id}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setEditProduct(product)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid #fdd",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

