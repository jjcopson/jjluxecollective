import mongoose, { Schema, models } from "mongoose";

const CustomerSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, required: true, trim: true, unique: true, index: true },
    location: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true },
    verifiedPhone: { type: Boolean, default: false },
    verifiedEmail: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const CustomerModel = models.Customer || mongoose.model("Customer", CustomerSchema);
export default CustomerModel;
