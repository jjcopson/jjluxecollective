import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { connectMongoDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export async function GET() {
  try {
    await connectMongoDB();

    const orders = await OrderModel.find().sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("MongoDB GET orders error:", error);

    return NextResponse.json(
      { message: "Failed to fetch orders", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const customerId = verifySession(cookieStore.get("customer_session")?.value) || "";

    await connectMongoDB();

    const order = await OrderModel.create({ ...body, customerId });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("MongoDB POST order error:", error);

    return NextResponse.json(
      { message: "Failed to create order", error: String(error) },
      { status: 500 }
    );
  }
}
