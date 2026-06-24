import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import CustomerOtpModel from "@/models/CustomerOtp";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const channel = cleanIdentifier.includes("@") ? "email" : "phone";
    const code = generateOtp();

    await connectMongoDB();

    await CustomerOtpModel.create({
      identifier: cleanIdentifier,
      channel,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log(`Customer OTP for ${cleanIdentifier}: ${code}`);

    return NextResponse.json({
      message: "OTP sent successfully",
      channel,
      devOtp: code,
    });
  } catch (error) {
    console.error("Customer OTP start error:", error);
    return NextResponse.json({ message: "Failed to start login", error: String(error) }, { status: 500 });
  }
}
