import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function statusPatch(status?: string, note?: string) {
  const updateData: Record<string, unknown> = {};
  if (!status) return updateData;

  updateData.status = status;

  if (status === "paid") {
    updateData.paymentStatus = "paid";
    updateData.paidAt = new Date();
  }

  if (status === "processing") updateData.processingAt = new Date();
  if (status === "delivered") updateData.deliveredAt = new Date();
  if (status === "cancelled") updateData.cancelledAt = new Date();

  updateData.$push = {
    statusHistory: {
      status,
      note: note || `Status changed to ${status}`,
      changedAt: new Date()
    }
  };

  return updateData;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await connectMongoDB();

    const order = await OrderModel.findById(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("MongoDB GET order error:", error);
    return NextResponse.json(
      { message: "Failed to fetch order", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectMongoDB();

    const updateData: Record<string, unknown> = {
      ...body,
      ...statusPatch(body.status || body.paymentStatus, body.statusNote)
    };

    delete updateData.statusNote;

    const order = await OrderModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found", id }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("MongoDB PUT order error:", error);
    return NextResponse.json(
      { message: "Failed to update order", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await connectMongoDB();

    const order = await OrderModel.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found", id }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted" });
  } catch (error) {
    console.error("MongoDB DELETE order error:", error);
    return NextResponse.json(
      { message: "Failed to delete order", error: String(error) },
      { status: 500 }
    );
  }
}
