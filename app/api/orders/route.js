import { createOrder } from "@/lib/salesdrive";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, phone, products } = body;
    if (!firstName || !phone || !products?.length) {
      return NextResponse.json(
        { error: "Вкажіть ім'я, телефон та хоча б один товар" },
        { status: 400 }
      );
    }
    const phoneClean = phone.replace(/[^0-9+]/g, "");
    if (phoneClean.length < 10) {
      return NextResponse.json({ error: "Невірний формат телефону" }, { status: 400 });
    }

    const result = await createOrder({
      ...body,
      phone: phoneClean,
    });

    return NextResponse.json({
      success: true,
      orderId: result?.id ?? null,
      data: result,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Помилка створення замовлення. Спробуйте ще раз." },
      { status: 500 }
    );
  }
}

