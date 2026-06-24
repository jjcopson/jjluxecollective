import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export async function POST(request: Request) {
  try {
    const { reference, orderId } = await request.json();
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { message: "PAYSTACK_SECRET_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    if (!reference || !orderId) {
      return NextResponse.json(
        { message: "reference and orderId are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack verify error:", data);
      return NextResponse.json(
        { message: data.message || "Payment verification failed", data },
        { status: 500 }
      );
    }

    await connectMongoDB();

    const isPaid = data.data?.status === "success";

    const updateData: Record<string, unknown> = {
      status: isPaid ? "paid" : "pending",
      paymentStatus: isPaid ? "paid" : "failed",
      paymentMethod: "paystack",
      paymentReference: reference,
      paidAt: isPaid ? new Date() : null
    };

    if (isPaid) {
      updateData.$push = {
        statusHistory: {
          status: "paid",
          note: "Payment confirmed by Paystack",
          changedAt: new Date()
        }
      };
    }

    const order = await OrderModel.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      paid: isPaid,
      order,
      paystack: {
        reference: data.data?.reference,
        amount: data.data?.amount,
        channel: data.data?.channel,
        status: data.data?.status,
        paid_at: data.data?.paid_at
      }
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { message: "Payment verification failed", error: String(error) },
      { status: 500 }
    );
  }
}
