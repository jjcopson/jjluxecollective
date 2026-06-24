import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  try {
    const { email, amount, orderId, customerName } = await request.json();
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { message: "PAYSTACK_SECRET_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    if (!email || !amount || !orderId) {
      return NextResponse.json(
        { message: "Email, amount and orderId are required" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: Math.round(Number(amount) * 100),
        currency: "GHS",
        callback_url: `${origin}/payment/success?orderId=${orderId}`,
        metadata: { orderId, customerName }
      })
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack initialize error:", data);
      return NextResponse.json(
        { message: data.message || "Failed to initialize payment", data },
        { status: 500 }
      );
    }

    await connectMongoDB();

    await OrderModel.findByIdAndUpdate(orderId, {
      paymentMethod: "paystack",
      paymentStatus: "unpaid",
      paymentReference: data.data.reference,
      status: "pending"
    });

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Payment initialize error:", error);
    return NextResponse.json(
      { message: "Payment initialization failed", error: String(error) },
      { status: 500 }
    );
  }
}
