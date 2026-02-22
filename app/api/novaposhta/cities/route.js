import { getCities } from "@/lib/novaposhta";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }
    const cities = await getCities(query);
    return NextResponse.json({
      data: cities.map((c) => ({
        ref: c.ref,
        name: c.name,
        area: c.area,
      })),
    });
  } catch (error) {
    console.error("NP cities error:", error);
    return NextResponse.json(
      { error: error.message || "Помилка пошуку міст" },
      { status: 500 }
    );
  }
}
