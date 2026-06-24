import mongoose, { Schema, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, default: "" },
    name: { type: String, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" }
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "delivered", "cancelled"],
      required: true
    },
    note: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    customerId: { type: String, default: "" },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, default: "", trim: true },
    customerLocation: { type: String, required: true, trim: true },
    note: { type: String, default: "" },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item"
      }
    },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "delivered", "cancelled"],
      default: "pending"
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [{ status: "pending", note: "Order created" }]
    },
    paymentMethod: { type: String, enum: ["whatsapp", "paystack", ""], default: "" },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
    paymentReference: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    processingAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const OrderModel = models.Order || mongoose.model("Order", OrderSchema);
export default OrderModel;
