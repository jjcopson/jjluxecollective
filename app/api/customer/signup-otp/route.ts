import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { formatPhoneForTwilio, normalizePhone } from "@/lib/auth";
import { getTwilioVerifyClient } from "@/lib/twilioVerify";
import CustomerModel from "@/models/Customer";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) return NextResponse.json({ message: "Phone number is required" }, { status: 400 });

    const cleanPhone = normalizePhone(phone);
    await connectMongoDB();

    const existingCustomer = await CustomerModel.findOne({ phone: cleanPhone });
    if (existingCustomer) {
      return NextResponse.json({ message: "An account already exists with this phone number. Please login." }, { status: 409 });
    }

    const { client, serviceSid } = getTwilioVerifyClient();
    await client.verify.v2.services(serviceSid).verifications.create({
      to: formatPhoneForTwilio(phone),
      channel: "sms",
    });

    return NextResponse.json({ message: "OTP sent to your phone number", phone: cleanPhone, sent: true });
  } catch (error) {
    console.error("Signup OTP error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP. Check Twilio env variables and verified trial phone number.", error: String(error) },
      { status: 500 }
    );
  }
}
