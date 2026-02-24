import { supabase, supabaseAdmin } from "./supabase";

// ═══════════════════ ТОВАРИ ═══════════════════

export async function getProducts({
  category,
  subcategory,
  sort,
  search,
  limit = 50,
  offset = 0,
} = {}) {
  if (!supabase) throw new Error("Supabase not configured");

  let query = supabase
    .from("products")
    .select("*, categories!category_id(name_ua, slug)")
    .eq("is_active", true);

  if (category) query = query.eq("category_id", category);
  if (subcategory) query = query.eq("subcategory_id", subcategory);
  if (search) query = query.ilike("name_ua", `%${search}%`);

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query
        .order("sort_order")
        .order("reviews_count", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: data, count };
}

export async function getProduct(slugOrId) {
  if (!supabase) throw new Error("Supabase not configured");

  const isNumeric = !Number.isNaN(Number(slugOrId));
  const column = isNumeric ? "id" : "slug";

  const { data, error } = await supabase
    .from("products")
    .select(
      "*, categories!category_id(name_ua, slug), reviews(id, author_name, author_city, rating, text, created_at)",
    )
    .eq(column, slugOrId)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return data;
}

export async function getPopularProducts(limit = 6) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("in_stock", true)
    .order("reviews_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getSaleProducts(limit = 10) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .not("old_price", "is", null)
    .order("discount_percent", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ═══════════════════ КАТЕГОРІЇ ═══════════════════

export async function getCategories() {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function getSubcategories(parentId) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", parentId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data;
}

// ═══════════════════ ЗАМОВЛЕННЯ ═══════════════════

export async function createOrderRecord(orderData) {
  if (!supabaseAdmin) throw new Error("Supabase admin not configured");

  const orderNumber = `LS-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_first_name: orderData.firstName,
      customer_last_name: orderData.lastName || "",
      customer_phone: orderData.phone,
      customer_email: orderData.email || "",
      shipping_method: orderData.shippingMethod,
      shipping_city: orderData.city || "",
      shipping_warehouse: orderData.warehouse || "",
      payment_method: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      total: orderData.total,
      comment: orderData.comment || "",
      source: "website",
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const items = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_sku: item.sku || "",
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(items);

  if (itemsError) throw itemsError;

  return { ...order, items };
}

// ═══════════════════ ВІДГУКИ ═══════════════════

export async function addReview(reviewData) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: reviewData.productId,
      author_name: reviewData.name,
      author_city: reviewData.city || "",
      rating: reviewData.rating,
      text: reviewData.text,
      is_approved: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ═══════════════════ ADMIN ═══════════════════

export async function getAdminOrders(page = 1, limit = 20, status = null) {
  if (!supabaseAdmin) throw new Error("Supabase admin not configured");

  let query = supabaseAdmin
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { orders: data, total: count };
}

export async function updateOrderStatus(orderId, status, ttn = null) {
  if (!supabaseAdmin) throw new Error("Supabase admin not configured");

  const update = { status };
  if (ttn) update.ttn = ttn;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertProduct(productData) {
  if (!supabaseAdmin) throw new Error("Supabase admin not configured");

  const slug =
    productData.slug ||
    productData.name_ua
      .toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
      .replace(/^-|-$/g, "");

  const { data, error } = await supabaseAdmin
    .from("products")
    .upsert({ ...productData, slug, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  if (!supabaseAdmin) throw new Error("Supabase admin not configured");

  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

export async function getDashboardStats() {
  if (!supabaseAdmin) throw new Error("Supabase admin not configured");

  const [ordersToday, ordersTotal, revenue, productsCount] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id", { count: "exact" })
      .gte("created_at", new Date().toISOString().split("T")[0]),
    supabaseAdmin.from("orders").select("id", { count: "exact" }),
    supabaseAdmin
      .from("orders")
      .select("total")
      .eq("payment_status", "paid"),
    supabaseAdmin
      .from("products")
      .select("id", { count: "exact" })
      .eq("is_active", true),
  ]);

  return {
    ordersToday: ordersToday.count || 0,
    ordersTotal: ordersTotal.count || 0,
    revenue:
      revenue.data?.reduce((sum, o) => sum + parseFloat(o.total), 0) || 0,
    productsCount: productsCount.count || 0,
  };
}

