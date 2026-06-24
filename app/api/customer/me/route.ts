import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectMongoDB } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";
import CustomerModel from "@/models/Customer";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const customerId = verifySession(cookieStore.get("customer_session")?.value);
    if (!customerId) return NextResponse.json({ customer: null });

    await connectMongoDB();
    const customer = await CustomerModel.findById(customerId).select("-passwordHash");
    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load customer", error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const customerId = verifySession(cookieStore.get("customer_session")?.value);
    if (!customerId) return NextResponse.json({ message: "Please login first" }, { status: 401 });

    const body = await request.json();
    await connectMongoDB();

    const customer = await CustomerModel.findByIdAndUpdate(
      customerId,
      {
        fullName: body.fullName || "",
        email: String(body.email || "").trim().toLowerCase(),
        phone: body.phone || "",
        location: body.location || "",
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update profile", error: String(error) }, { status: 500 });
  }
}
