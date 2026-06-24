import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerModel from "@/models/Customer";
import CustomerOtpModel from "@/models/CustomerOtp";

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json();

    if (!identifier || !code) {
      return NextResponse.json({ message: "Email/phone and OTP are required" }, { status: 400 });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    await connectMongoDB();

    const otp = await CustomerOtpModel.findOne({
      identifier: cleanIdentifier,
      code: String(code).trim(),
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 401 });
    }

    otp.used = true;
    await otp.save();

    const isEmail = cleanIdentifier.includes("@");

    let customer = await CustomerModel.findOne(
      isEmail ? { email: cleanIdentifier } : { phone: cleanIdentifier }
    );

    if (!customer) {
      customer = await CustomerModel.create({
        email: isEmail ? cleanIdentifier : "",
        phone: isEmail ? "" : cleanIdentifier,
        verifiedEmail: isEmail,
        verifiedPhone: !isEmail,
        lastLoginAt: new Date(),
      });
    } else {
      if (isEmail) customer.verifiedEmail = true;
      if (!isEmail) customer.verifiedPhone = true;
      customer.lastLoginAt = new Date();
      await customer.save();
    }

    const response = NextResponse.json({ message: "Login successful", customer });

    response.cookies.set("customer_session", String(customer._id), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Customer OTP verify error:", error);
    return NextResponse.json({ message: "Failed to verify OTP", error: String(error) }, { status: 500 });
  }
}
