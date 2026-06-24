import mongoose, { Schema, models } from "mongoose";

const CustomerOtpSchema = new Schema(
  {
    identifier: { type: String, required: true, trim: true, lowercase: true, index: true },
    channel: { type: String, enum: ["phone"], default: "phone" },
    code: { type: String, required: true },
    purpose: { type: String, enum: ["signup"], default: "signup" },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CustomerOtpModel =
  models.CustomerOtp || mongoose.model("CustomerOtp", CustomerOtpSchema);

export default CustomerOtpModel;
