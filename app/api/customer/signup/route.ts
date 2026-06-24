import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import { formatPhoneForTwilio, isStrongPassword, normalizePhone } from "@/lib/auth";
import { getTwilioVerifyClient } from "@/lib/twilioVerify";
import CustomerModel from "@/models/Customer";

export async function POST(request: Request) {
  try {
    const { fullName, phone, email, password, confirmPassword, otp } = await request.json();

    if (!fullName || !phone || !email || !password || !confirmPassword || !otp) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: "Password must be at least 8 characters and include uppercase, lowercase and a number" }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);
    const cleanEmail = String(email).trim().toLowerCase();

    await connectMongoDB();

    const existing = await CustomerModel.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
    if (existing) {
      return NextResponse.json({ message: "An account already exists with this email or phone number" }, { status: 409 });
    }

    const { client, serviceSid } = getTwilioVerifyClient();
    const check = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: formatPhoneForTwilio(phone),
      code: String(otp).trim(),
    });

    if (check.status !== "approved") {
      return NextResponse.json({ message: "Invalid OTP code" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await CustomerModel.create({
      fullName,
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash,
      verifiedPhone: true,
      verifiedEmail: false,
    });

    return NextResponse.json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Customer signup error:", error);
    return NextResponse.json({ message: "Failed to create account", error: String(error) }, { status: 500 });
  }
}
