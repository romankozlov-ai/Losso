import { getWarehouses } from "@/lib/novaposhta";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityRef = searchParams.get("cityRef");
    const search = searchParams.get("q") || "";
    if (!cityRef) {
      return NextResponse.json({ data: [] });
    }
    const warehouses = await getWarehouses(cityRef, search);
    return NextResponse.json({
      data: warehouses.map((w) => ({
        ref: w.Ref,
        number: w.Number,
        description: w.Description,
        shortAddress: w.ShortAddress,
      })),
    });
  } catch (error) {
    console.error("NP warehouses error:", error);
    return NextResponse.json(
      { error: error.message || "Помилка пошуку відділень" },
      { status: 500 }
    );
  }
}
