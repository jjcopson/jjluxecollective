import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ message: "Order number is required" }, { status: 400 });
    }

    await connectMongoDB();

    const normalized = query.replace(/^JJ-/i, "").trim();
    let order = null;

    if (/^[a-fA-F0-9]{24}$/.test(query)) {
      order = await OrderModel.findById(query);
    }

    if (!order && /^[a-fA-F0-9]{6}$/.test(normalized)) {
      const orders = await OrderModel.find().sort({ createdAt: -1 });
      order = orders.find((item) =>
        String(item._id).slice(-6).toUpperCase() === normalized.toUpperCase()
      );
    }

    if (!order) {
      return NextResponse.json(
        { message: "Order not found. Check the order number and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { message: "Failed to track order", error: String(error) },
      { status: 500 }
    );
  }
}
