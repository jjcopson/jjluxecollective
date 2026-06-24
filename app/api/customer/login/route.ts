import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import { normalizeIdentifier, signSession } from "@/lib/auth";
import CustomerModel from "@/models/Customer";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: "Email/phone and password are required" }, { status: 400 });
    }

    const cleanIdentifier = normalizeIdentifier(identifier);
    await connectMongoDB();

    const customer = await CustomerModel.findOne(
      cleanIdentifier.includes("@") ? { email: cleanIdentifier } : { phone: cleanIdentifier }
    );

    if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
      return NextResponse.json({ message: "Invalid email/phone or password" }, { status: 401 });
    }

    customer.lastLoginAt = new Date();
    await customer.save();

    const response = NextResponse.json({
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        location: customer.location,
      },
    });

    response.cookies.set("customer_session", signSession(String(customer._id)), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Customer login error:", error);
    return NextResponse.json({ message: "Login failed", error: String(error) }, { status: 500 });
  }
}
