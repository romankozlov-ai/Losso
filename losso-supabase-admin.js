// ============================================================
// LOSSO × Supabase — База даних + Адмін-панель
// ============================================================
//
// 📋 ПЛАН ФАЙЛІВ:
//   1. SQL-міграція (створення таблиць)
//   2. lib/supabase.js — клієнт
//   3. lib/db.js — функції роботи з БД
//   4. app/api/ routes — серверні ендпоінти
//   5. app/admin/ — адмін-панель
//   6. Скрипт імпорту товарів з JSON
//   7. Інструкція з налаштування
//
// ============================================================


// ============================================================
// 📁 ФАЙЛ 1: supabase/migrations/001_init.sql
// ============================================================
// Виконайте цей SQL у Supabase → SQL Editor

export const migrationSQL = `
-- =============================================
-- LOSSO Database Schema
-- =============================================

-- 1. Категорії
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_ua TEXT NOT NULL,
  name_ru TEXT,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT DEFAULT '',
  prom_slug TEXT,
  parent_id TEXT REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Товари
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name_ua TEXT NOT NULL,
  name_ru TEXT,
  slug TEXT UNIQUE,
  description_ua TEXT DEFAULT '',
  description_ru TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  sku TEXT,
  prom_id TEXT,
  category_id TEXT REFERENCES categories(id),
  subcategory_id TEXT REFERENCES categories(id),
  brand TEXT DEFAULT 'LOSSO',
  image_url TEXT,
  images JSONB DEFAULT '[]',
  badge TEXT CHECK (badge IN ('hit', 'new', 'sale', NULL)),
  discount_percent INTEGER,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 0,
  wholesale BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  salesdrive_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Замовлення
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  
  -- Клієнт
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  -- Доставка
  shipping_method TEXT,
  shipping_city TEXT,
  shipping_warehouse TEXT,
  shipping_address TEXT,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  ttn TEXT, -- номер ТТН
  
  -- Оплата
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  
  -- Сума
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Інше
  comment TEXT,
  source TEXT DEFAULT 'website',
  salesdrive_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Позиції замовлення
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Відгуки
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_city TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Налаштування магазину
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Початкові налаштування
INSERT INTO settings (key, value) VALUES
  ('store_name', '"Торгова компанія LOSSO"'),
  ('store_phones', '[\"+380 (98) 040-25-00\", \"+380 (93) 040-25-00\", \"+380 (50) 040-25-00\"]'),
  ('store_email', '"lossotrade@gmail.com"'),
  ('store_address', '"м. Бориспіль, вул. Новопрорізна 4"'),
  ('free_shipping_from', '1000'),
  ('working_hours', '{"mon_fri": "09:00-18:00", "sat": "10:00-17:00", "sun": "Вихідний"}')
ON CONFLICT (key) DO NOTHING;

-- Індекси для швидкості
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Автооновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Публічний доступ на читання товарів та категорій
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (is_approved = true);

-- Замовлення може створювати хто завгодно (анонімно)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Повний доступ для авторизованих (адмін)
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
`;


// ============================================================
// 📁 ФАЙЛ 2: lib/supabase.js
// ============================================================

// import { createClient } from '@supabase/supabase-js';
//
// // Публічний клієнт (для фронтенду — тільки читання)
// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );
//
// // Серверний клієнт (для API routes — повний доступ)
// export const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

export const supabaseConfig = {
  envVars: [
    "NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...",
    "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI... (тільки серверний!)",
  ],
  install: "npm install @supabase/supabase-js",
};


// ============================================================
// 📁 ФАЙЛ 3: lib/db.js — Функції роботи з БД
// ============================================================

export const dbFunctions = `
import { supabase, supabaseAdmin } from './supabase';

// ═══════════════════ ТОВАРИ ═══════════════════

/** Отримати всі активні товари */
export async function getProducts({ category, subcategory, sort, search, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('products')
    .select('*, categories!category_id(name_ua, slug)')
    .eq('is_active', true);

  if (category) query = query.eq('category_id', category);
  if (subcategory) query = query.eq('subcategory_id', subcategory);
  if (search) query = query.ilike('name_ua', \`%\${search}%\`);

  // Сортування
  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    case 'new': query = query.order('created_at', { ascending: false }); break;
    default: query = query.order('sort_order').order('reviews_count', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: data, count };
}

/** Отримати товар за slug або id */
export async function getProduct(slugOrId) {
  const isNumeric = !isNaN(slugOrId);
  const column = isNumeric ? 'id' : 'slug';

  const { data, error } = await supabase
    .from('products')
    .select('*, categories!category_id(name_ua, slug), reviews(id, author_name, author_city, rating, text, created_at)')
    .eq(column, slugOrId)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

/** Отримати популярні товари */
export async function getPopularProducts(limit = 6) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('in_stock', true)
    .order('reviews_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/** Отримати товари зі знижкою */
export async function getSaleProducts(limit = 10) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .not('old_price', 'is', null)
    .order('discount_percent', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}


// ═══════════════════ КАТЕГОРІЇ ═══════════════════

/** Отримати всі категорії */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order');

  if (error) throw error;
  return data;
}

/** Отримати підкатегорії */
export async function getSubcategories(parentId) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data;
}


// ═══════════════════ ЗАМОВЛЕННЯ ═══════════════════

/** Створити замовлення */
export async function createOrder(orderData) {
  const orderNumber = 'LS-' + Date.now().toString(36).toUpperCase();

  // 1. Створюємо замовлення
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_first_name: orderData.firstName,
      customer_last_name: orderData.lastName || '',
      customer_phone: orderData.phone,
      customer_email: orderData.email || '',
      shipping_method: orderData.shippingMethod,
      shipping_city: orderData.city || '',
      shipping_warehouse: orderData.warehouse || '',
      payment_method: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      total: orderData.total,
      comment: orderData.comment || '',
      source: 'website',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Додаємо позиції
  const items = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_sku: item.sku || '',
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(items);

  if (itemsError) throw itemsError;

  // 3. Оновлюємо залишки
  for (const item of orderData.items) {
    if (item.productId) {
      await supabaseAdmin.rpc('decrement_stock', {
        p_id: item.productId,
        qty: item.quantity,
      });
    }
  }

  return { ...order, items };
}


// ═══════════════════ ВІДГУКИ ═══════════════════

/** Додати відгук */
export async function addReview(reviewData) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: reviewData.productId,
      author_name: reviewData.name,
      author_city: reviewData.city || '',
      rating: reviewData.rating,
      text: reviewData.text,
      is_approved: false, // потребує модерації
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}


// ═══════════════════ ADMIN ═══════════════════

/** [Admin] Отримати всі замовлення */
export async function getAdminOrders(page = 1, limit = 20, status = null) {
  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { orders: data, total: count };
}

/** [Admin] Оновити статус замовлення */
export async function updateOrderStatus(orderId, status, ttn = null) {
  const update = { status };
  if (ttn) update.ttn = ttn;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** [Admin] Створити/оновити товар */
export async function upsertProduct(productData) {
  const slug = productData.slug || productData.name_ua
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
    .replace(/^-|-$/g, '');

  const { data, error } = await supabaseAdmin
    .from('products')
    .upsert({ ...productData, slug, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** [Admin] Видалити товар (м'яке видалення) */
export async function deleteProduct(id) {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

/** [Admin] Статистика для дашборду */
export async function getDashboardStats() {
  const [ordersToday, ordersTotal, revenue, productsCount] = await Promise.all([
    supabaseAdmin.from('orders').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
    supabaseAdmin.from('orders').select('id', { count: 'exact' }),
    supabaseAdmin.from('orders').select('total').eq('payment_status', 'paid'),
    supabaseAdmin.from('products').select('id', { count: 'exact' }).eq('is_active', true),
  ]);

  return {
    ordersToday: ordersToday.count || 0,
    ordersTotal: ordersTotal.count || 0,
    revenue: revenue.data?.reduce((sum, o) => sum + parseFloat(o.total), 0) || 0,
    productsCount: productsCount.count || 0,
  };
}
`;


// ============================================================
// 📁 ФАЙЛ 4: scripts/import-products.js
// ============================================================
// Скрипт для імпорту товарів з JSON у Supabase
// Запуск: node scripts/import-products.js

export const importScript = `
// npm install @supabase/supabase-js
// node scripts/import-products.js

const { createClient } = require('@supabase/supabase-js');
const productsData = require('../losso-products-database.json');

const supabase = createClient(
  'https://xxxxx.supabase.co', // ваш URL
  'eyJhbGciOiJI...'           // ваш SERVICE_ROLE_KEY
);

async function importAll() {
  console.log('🚀 Починаємо імпорт...');

  // 1. Імпорт категорій
  console.log('📂 Імпорт категорій...');
  for (const cat of productsData.categories) {
    // Головна категорія
    await supabase.from('categories').upsert({
      id: cat.id,
      name_ua: cat.name_ua,
      name_ru: cat.name_ru || null,
      slug: cat.id,
      emoji: cat.emoji || '',
      prom_slug: cat.prom_slug || null,
      parent_id: null,
      is_active: true,
    });
    console.log('  ✅', cat.name_ua);

    // Підкатегорії
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        await supabase.from('categories').upsert({
          id: sub.id,
          name_ua: sub.name_ua,
          slug: sub.id,
          prom_slug: sub.prom_slug || null,
          parent_id: cat.id,
          is_active: true,
        });
        console.log('    ✅', sub.name_ua);
      }
    }
  }

  // 2. Імпорт товарів
  console.log('\\n📦 Імпорт товарів...');
  for (const product of productsData.products) {
    const slug = product.name_ua
      .toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);

    const badgeMap = { 'Хіт': 'hit', 'Новинка': 'new', 'Акція': 'sale' };

    const { error } = await supabase.from('products').upsert({
      name_ua: product.name_ua,
      name_ru: product.name_ru || null,
      slug: slug + '-' + product.id,
      price: product.price,
      old_price: product.old_price || null,
      sku: product.sku || null,
      prom_id: product.prom_id || null,
      category_id: product.category || null,
      subcategory_id: product.subcategory || null,
      brand: product.brand || 'LOSSO',
      image_url: product.image_url || null,
      badge: badgeMap[product.badge] || null,
      discount_percent: product.discount_percent || null,
      in_stock: product.in_stock !== false,
      wholesale: product.wholesale || false,
      is_active: true,
    });

    if (error) {
      console.log('  ❌', product.name_ua, error.message);
    } else {
      console.log('  ✅', product.name_ua, '—', product.price, '₴');
    }
  }

  console.log('\\n🎉 Імпорт завершено!');
}

importAll().catch(console.error);
`;


// ============================================================
// 📁 ФАЙЛ 5: app/admin/page.jsx — Адмін-панель
// ============================================================
// Захищена сторінка для управління товарами та замовленнями

export const adminPanelCode = `
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Статуси замовлень
const STATUS_MAP = {
  new: { label: 'Нове', color: '#3b82f6', bg: '#eff6ff' },
  confirmed: { label: 'Підтверджено', color: '#8b5cf6', bg: '#f5f3ff' },
  processing: { label: 'В обробці', color: '#f59e0b', bg: '#fffbeb' },
  shipped: { label: 'Відправлено', color: '#06b6d4', bg: '#ecfeff' },
  delivered: { label: 'Доставлено', color: '#22c55e', bg: '#f0fdf4' },
  cancelled: { label: 'Скасовано', color: '#ef4444', bg: '#fef2f2' },
  returned: { label: 'Повернено', color: '#6b7280', bg: '#f9fafb' },
};

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);

  // Перевірка авторизації
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Завантаження даних
  useEffect(() => {
    if (!session) return;
    loadData();
  }, [session, tab]);

  async function loadData() {
    if (tab === 'dashboard') {
      const res = await fetch('/api/admin/stats');
      setStats(await res.json());
    }
    if (tab === 'orders') {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      setOrders(data || []);
    }
    if (tab === 'products') {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setProducts(data || []);
    }
  }

  // Логін
  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Помилка: ' + error.message);
  }

  // Оновити статус замовлення
  async function updateStatus(orderId, newStatus) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    loadData();
  }

  // Зберегти товар
  async function saveProduct(productData) {
    if (productData.id) {
      await supabase.from('products').update(productData).eq('id', productData.id);
    } else {
      await supabase.from('products').insert(productData);
    }
    setEditProduct(null);
    loadData();
  }

  // Видалити товар
  async function deleteProduct(id) {
    if (!confirm('Видалити товар?')) return;
    await supabase.from('products').update({ is_active: false }).eq('id', id);
    loadData();
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Завантаження...</div>;

  // ── ЛОГІН-ФОРМА ──
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,.08)', width: 360 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8, textAlign: 'center' }}>LOSSO Admin</h2>
          <p style={{ color: '#999', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>Увійдіть для управління магазином</p>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', marginBottom: 12, fontSize: 14, boxSizing: 'border-box' }} />
          <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', marginBottom: 20, fontSize: 14, boxSizing: 'border-box' }} />
          <button type="submit"
            style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1a5c38', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Увійти
          </button>
        </form>
      </div>
    );
  }

  // ── АДМІН-ПАНЕЛЬ ──
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Source Sans 3', sans-serif" }}>
      {/* Сайдбар */}
      <aside style={{ width: 220, background: '#1a1a1a', color: '#fff', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #333' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>LOSSO</h3>
          <p style={{ fontSize: 12, color: '#888' }}>Адмін-панель</p>
        </div>
        {[
          { id: 'dashboard', icon: '📊', label: 'Дашборд' },
          { id: 'orders', icon: '📋', label: 'Замовлення' },
          { id: 'products', icon: '📦', label: 'Товари' },
          { id: 'reviews', icon: '⭐', label: 'Відгуки' },
          { id: 'settings', icon: '⚙️', label: 'Налаштування' },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '12px 20px', background: tab === item.id ? '#1a5c38' : 'transparent',
              border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', textAlign: 'left',
            }}>
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
        <button onClick={() => supabase.auth.signOut()}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 20px', background: 'transparent', border: 'none', color: '#888', fontSize: 14, cursor: 'pointer', marginTop: 'auto' }}>
          🚪 Вийти
        </button>
      </aside>

      {/* Контент */}
      <main style={{ flex: 1, background: '#f8f8f8', padding: 32 }}>
        
        {/* ДАШБОРД */}
        {tab === 'dashboard' && stats && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Дашборд</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Замовлень сьогодні', value: stats.ordersToday, icon: '📋', color: '#3b82f6' },
                { label: 'Всього замовлень', value: stats.ordersTotal, icon: '📦', color: '#8b5cf6' },
                { label: 'Дохід (оплачено)', value: stats.revenue + ' ₴', icon: '💰', color: '#22c55e' },
                { label: 'Активних товарів', value: stats.productsCount, icon: '🏷️', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ЗАМОВЛЕННЯ */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Замовлення</h2>
            <table style={{ width: '100%', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9f9f9' }}>
                  {['№', 'Дата', 'Клієнт', 'Телефон', 'Сума', 'Статус', 'Дії'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const st = STATUS_MAP[order.status] || STATUS_MAP.new;
                  return (
                    <tr key={order.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{order.order_number}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{new Date(order.created_at).toLocaleDateString('uk')}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>{order.customer_first_name} {order.customer_last_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>{order.customer_phone}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{order.total} ₴</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, background: st.bg, color: st.color, fontWeight: 600 }}>
                          {Object.entries(STATUS_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ cursor: 'pointer', fontSize: 13, color: '#1a5c38' }}>Деталі</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ТОВАРИ */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Товари</h2>
              <button onClick={() => setEditProduct({})}
                style={{ padding: '10px 20px', borderRadius: 8, background: '#1a5c38', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + Додати товар
              </button>
            </div>
            <table style={{ width: '100%', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9f9f9' }}>
                  {['Фото', 'Назва', 'Ціна', 'Наявність', 'Категорія', 'Дії'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#666' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.filter(p => p.is_active).map(product => (
                  <tr key={product.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 16px' }}>
                      <img src={product.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name_ua}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{product.price} ₴</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: product.in_stock ? '#f0fdf4' : '#fef2f2', color: product.in_stock ? '#22c55e' : '#ef4444' }}>
                        {product.in_stock ? 'Є' : 'Немає'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>{product.category_id}</td>
                    <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                      <button onClick={() => setEditProduct(product)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                      <button onClick={() => deleteProduct(product.id)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fdd', background: '#fff', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
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
`;


// ============================================================
// 📋 ІНСТРУКЦІЯ З НАЛАШТУВАННЯ SUPABASE
// ============================================================
//
// 1. СТВОРИТИ ПРОЕКТ:
//    - Перейдіть на supabase.com → New Project
//    - Оберіть регіон (Europe West для швидкості в Україні)
//    - Запам'ятайте пароль бази даних
//
// 2. СТВОРИТИ ТАБЛИЦІ:
//    - Supabase Dashboard → SQL Editor
//    - Вставте SQL з migrationSQL (файл 1) → Run
//
// 3. СТВОРИТИ АДМІН-КОРИСТУВАЧА:
//    - Authentication → Users → Invite User
//    - Вкажіть ваш email → він буде адміном
//
// 4. ОТРИМАТИ КЛЮЧІ:
//    - Settings → API
//    - Скопіюйте:
//      • Project URL → NEXT_PUBLIC_SUPABASE_URL
//      • anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
//      • service_role key → SUPABASE_SERVICE_ROLE_KEY
//
// 5. ДОДАТИ В VERCEL:
//    - Vercel → Settings → Environment Variables
//    - Додайте 3 змінні
//
// 6. ІМПОРТУВАТИ ТОВАРИ:
//    - Покладіть losso-products-database.json у корінь проекту
//    - node scripts/import-products.js
//
// 7. ВСТАНОВИТИ БІБЛІОТЕКУ:
//    - npm install @supabase/supabase-js
//
// 8. ПЕРЕВІРИТИ:
//    - Supabase → Table Editor → products → повинні бути товари
//    - /admin → увійти email/пароль → побачити дашборд
//
// ============================================================
