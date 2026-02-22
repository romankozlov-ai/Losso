/**
 * API Нової Пошти — пошук міст та відділень.
 */

const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NP_API_KEY = process.env.NOVAPOSHTA_API_KEY;

async function novaPoshtaRequest(modelName, calledMethod, properties = {}) {
  const res = await fetch(NP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: NP_API_KEY,
      modelName,
      calledMethod,
      methodProperties: properties,
    }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.join(", ") || "Nova Poshta API error");
  }
  return data.data;
}

/** Пошук населених пунктів за назвою (для автокомпліту) */
export async function searchSettlements(query) {
  const data = await novaPoshtaRequest("Address", "searchSettlements", {
    CityName: query,
    Limit: 10,
    Page: 1,
  });
  return data;
}

/** Список міст для автокомпліту (searchSettlements повертає { data: [{ Addresses: [...] }] }) */
export async function getCities(query) {
  const raw = await searchSettlements(query);
  const addresses = (Array.isArray(raw) && raw[0]?.Addresses) ? raw[0].Addresses : [];
  return addresses.map((a) => ({
    ref: a.Ref || a.DeliveryCity,
    name: a.Present || a.MainDescription || a.DeliveryDescription || "",
    area: a.AreaDescription || a.Area || "",
  }));
}

/** Відділення за Ref міста */
export async function getWarehouses(cityRef, search = "") {
  const props = { CityRef: cityRef, Limit: 50, Page: 1 };
  if (search) props.FindByString = search;
  const list = await novaPoshtaRequest("Address", "getWarehouses", props);
  return Array.isArray(list) ? list : [];
}
