/**
 * Інтеграція з SalesDrive API — створення замовлень, синхронізація товарів.
 */

const SALESDRIVE_DOMAIN = process.env.SALESDRIVE_DOMAIN;
const SALESDRIVE_API_KEY = process.env.SALESDRIVE_API_KEY;
const SALESDRIVE_FORM_KEY = process.env.SALESDRIVE_FORM_KEY;

async function salesdriveRequest(endpoint, method = "GET", body = null) {
  const url = `https://${SALESDRIVE_DOMAIN}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Form-Api-Key": SALESDRIVE_API_KEY,
    },
  };
  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`SalesDrive API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

/**
 * Створення замовлення в SalesDrive (викликається при оформленні на сайті).
 */
export async function createOrder(orderData) {
  const {
    firstName,
    lastName,
    phone,
    email,
    comment,
    products,
    paymentMethod,
    shippingMethod,
    novaPoshta,
  } = orderData;

  const payload = {
    form: SALESDRIVE_FORM_KEY,
    getResultData: "1",
    fName: firstName,
    lName: lastName || "",
    phone,
    email: email || "",
    products: products.map((item) => ({
      id: item.id || "",
      externalId: item.prom_id || "",
      name: item.name,
      costPerItem: String(item.price),
      amount: String(item.quantity || 1),
      sku: item.sku || "",
      description: item.description || "",
      discount: item.discount || "",
    })),
    payment_method: paymentMethod || "",
    shipping_method: shippingMethod || "",
    comment: comment || "",
    sajt: process.env.NEXT_PUBLIC_SITE_NAME || "losso-lemon.vercel.app",
    externalId: `WEB-${Date.now()}`,
  };

  if (novaPoshta) {
    payload.novaposhta = {
      ServiceType: novaPoshta.serviceType || "WarehouseWarehouse",
      payer: novaPoshta.payer || "Recipient",
      city: novaPoshta.city || "",
      cityNameFormat: "ref",
      WarehouseNumber: novaPoshta.warehouse || "",
      Street: novaPoshta.street || "",
      BuildingNumber: novaPoshta.building || "",
      Flat: novaPoshta.flat || "",
    };
  }

  const result = await fetch(`https://${SALESDRIVE_DOMAIN}/handler/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return result.json();
}

export async function getOrders(page = 1, limit = 50, filter = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filter.statusId) params.append("filter[statusId]", filter.statusId);
  if (filter.dateFrom) params.append("filter[orderTime][from]", filter.dateFrom);
  if (filter.dateTo) params.append("filter[orderTime][to]", filter.dateTo);
  return salesdriveRequest(`/api/order/list/?${params.toString()}`);
}

export async function getStatuses() {
  return salesdriveRequest("/api/order-field/status/list/");
}

export async function getPaymentMethods() {
  return salesdriveRequest("/api/order-field/payment-method/list/");
}

export async function getDeliveryMethods() {
  return salesdriveRequest("/api/order-field/delivery-method/list/");
}

export async function syncProduct(product) {
  return salesdriveRequest("/api/product/", "POST", {
    id: product.id,
    name: product.name,
    sku: product.sku || "",
    price: String(product.price),
    description: product.description || "",
    imageUrl: product.image_url || product.image || "",
    categoryId: product.categoryId || "",
  });
}

export async function syncAllProducts(products) {
  const results = [];
  for (const product of products) {
    try {
      const result = await syncProduct(product);
      results.push({ id: product.id, success: true, result });
    } catch (error) {
      results.push({ id: product.id, success: false, error: error.message });
    }
  }
  return results;
}
