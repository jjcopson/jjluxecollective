import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongoDB } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";
import OrderModel from "@/models/Order";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = verifySession(cookieStore.get("customer_session")?.value);

    if (!customerId) {
      return NextResponse.json({ message: "Please login to view your orders", orders: [] }, { status: 401 });
    }

    await connectMongoDB();
    const orders = await OrderModel.find({ customerId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load orders", error: String(error) }, { status: 500 });
  }
}
