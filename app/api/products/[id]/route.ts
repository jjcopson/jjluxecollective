import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectMongoDB();

    const product = await ProductModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found", id },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("MongoDB PUT error:", error);

    return NextResponse.json(
      { message: "Failed to update product", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await connectMongoDB();

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found", id },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("MongoDB DELETE error:", error);

    return NextResponse.json(
      { message: "Failed to delete product", error: String(error) },
      { status: 500 }
    );
  }
}
