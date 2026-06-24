"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type OrderItem = {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Order = {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerLocation: string;
  note?: string;
  items: OrderItem[];
  total: number;
  paymentStatus?: string;
  status?: string;
  paymentReference?: string;
};

function shortOrderNo(id: string) {
  return `JJ-${id.slice(-6).toUpperCase()}`;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"checking" | "paid" | "failed">("checking");
  const [message, setMessage] = useState("Verifying your payment...");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference || !orderId) {
        setStatus("failed");
        setMessage("Missing payment reference or order ID.");
        return;
      }

      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference, orderId }),
        });

        const data = await response.json();

        if (!response.ok || !data.paid) {
          setStatus("failed");
          setMessage(data.message || "Payment could not be verified.");
          return;
        }

        setOrder(data.order);
        setStatus("paid");
        setMessage("Payment confirmed. Your order has been marked as PAID in the admin dashboard.");
      } catch (error) {
        console.error(error);
        setStatus("failed");
        setMessage("Something went wrong while verifying payment.");
      }
    }

    verifyPayment();
  }, [reference, orderId]);

  const whatsappUrl = useMemo(() => {
    if (!order) return "";

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    if (!phone) return "";

    const trackingUrl = `${window.location.origin}/track-order`;

    const items = order.items
      .map(
        (item, index) => `
${index + 1}. ${item.name}
   Size: ${item.size || "-"}
   Color: ${item.color || "-"}
   Qty: ${item.quantity}
   Price: GHC ${item.price}
   Subtotal: GHC ${item.subtotal}
`
      )
      .join("\n");

    const whatsappMessage = `
🛍️ *JJ Luxe Collective Paid Order*

✅ Payment Status: PAID
🆔 Order No: ${shortOrderNo(order._id)}
🔖 Payment Ref: ${order.paymentReference || reference}

👤 Name: ${order.customerName}
📞 Phone: ${order.customerPhone}
📧 Email: ${order.customerEmail || "Not provided"}
📍 Location: ${order.customerLocation}

🧾 Items:
${items}

💰 Total Paid: GHC ${order.total}

📝 Note: ${order.note || "None"}

🚚 Delivery will be arranged shortly.
We will contact you to confirm the delivery details.

Track your order here: ${trackingUrl}\n\nThank you for shopping with JJ Luxe Collective ✨
`;

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
      whatsappMessage
    )}`;
  }, [order, reference]);

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-2xl items-center px-5 py-16">
      <div className="w-full rounded-[2rem] border border-gold/20 bg-white/[0.03] p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">
          Payment
        </p>

        <h1 className="mt-4 text-4xl font-black">
          {status === "checking"
            ? "Checking Payment"
            : status === "paid"
            ? "Payment Successful"
            : "Payment Not Confirmed"}
        </h1>

        <p className="mt-4 text-white/60">{message}</p>

        {order && (
          <p className="mt-4 text-2xl font-black text-gold">
            GHC {order.total}
          </p>
        )}

        {reference && (
          <p className="mt-4 break-all text-sm text-white/40">
            Reference: {reference}
          </p>
        )}

        {orderId && (
          <p className="mt-2 break-all text-sm text-white/40">
            Order ID: {orderId}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              className="rounded-full bg-green-500 px-8 py-4 font-bold text-white"
            >
              Send Order on WhatsApp
            </a>
          )}

          <Link
            href="/shop"
            className="rounded-full bg-gold px-8 py-4 font-bold text-black"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<p className="p-10 text-white">Loading payment...</p>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
