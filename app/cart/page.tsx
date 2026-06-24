"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCustomerProfile() {
      try {
        const response = await fetch("/api/customer/me");
        const data = await response.json();

        if (data.customer) {
          setCustomerName(data.customer.fullName || "");
          setCustomerPhone(data.customer.phone || "");
          setCustomerEmail(data.customer.email || "");
          setCustomerLocation(data.customer.location || "");
        }
      } catch (error) {
        console.error("Failed to load customer profile:", error);
      }
    }

    loadCustomerProfile();
  }, []);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.cartQuantity || 1),
        0
      ),
    [cart]
  );

  function itemKey(item: any) {
    return item._id || String(item.id);
  }

  const orderSummary = useMemo(() => {
    const items = cart
      .map(
        (item, index) => `
${index + 1}. ${item.name}
   Size: ${item.selectedSize || "-"}
   Color: ${item.selectedColor || "-"}
   Qty: ${item.cartQuantity || 1}
   Price: GHC ${item.price}
   Subtotal: GHC ${Number(item.price) * Number(item.cartQuantity || 1)}
`
      )
      .join("\n");

    return `
🛍️ *JJ Luxe Collective Order*

👤 Name: ${customerName}
📞 Phone: ${customerPhone}
📧 Email: ${customerEmail || "Not provided"}
📍 Location: ${customerLocation}

🧾 Items:
${items}

💰 Total: GHC ${total}

📝 Note: ${note || "None"}

Please confirm availability and delivery details.
Thank you 🙏
`;
  }, [cart, customerName, customerPhone, customerEmail, customerLocation, note, total]);

  function validateCheckout(requireEmail = false) {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return false;
    }

    if (!customerName || !customerPhone || !customerLocation) {
      alert("Please enter your name, phone number and delivery location.");
      return false;
    }

    if (requireEmail && !customerEmail) {
      alert("Please enter your email address for Paystack payment.");
      return false;
    }

    return true;
  }

  function buildOrderPayload(paymentMethod: "whatsapp" | "paystack") {
    return {
      customerName,
      customerPhone,
      customerEmail,
      customerLocation,
      note,
      items: cart.map((item) => ({
        productId: item._id || item.id || "",
        name: item.name,
        size: item.selectedSize || "",
        color: item.selectedColor || "",
        quantity: Number(item.cartQuantity || 1),
        price: Number(item.price),
        subtotal: Number(item.price) * Number(item.cartQuantity || 1),
        image: item.image || ""
      })),
      total,
      status: "pending",
      paymentMethod,
      paymentStatus: "unpaid"
    };
  }

  async function saveOrder(paymentMethod: "whatsapp" | "paystack") {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildOrderPayload(paymentMethod))
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Order save failed:", data);
      throw new Error(data.message || "Failed to save order.");
    }

    return data;
  }

  async function handleWhatsAppCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCheckout()) return;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    if (!whatsappNumber) {
      alert("WhatsApp number is not configured in .env.local.");
      return;
    }

    try {
      setSaving(true);
      const order = await saveOrder("whatsapp");
      const messageWithOrderId = `${orderSummary}\n🆔 Order ID: ${order._id}`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(messageWithOrderId)}`;

      window.open(whatsappUrl, "_blank");
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerLocation("");
      setNote("");
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Check your terminal.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePaystackCheckout() {
    if (!validateCheckout(true)) return;

    try {
      setSaving(true);
      const order = await saveOrder("paystack");

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          amount: total,
          orderId: order._id,
          customerName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Paystack init failed:", data);
        alert(data.message || "Payment initialization failed.");
        return;
      }

      clearCart();
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error(error);
      alert("Payment failed to start. Check your terminal.");
    } finally {
      setSaving(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Cart</p>
          <h1 className="mt-3 text-4xl font-black">Your cart is empty</h1>
          <p className="mt-3 text-white/60">Add items from the shop to start an order.</p>
          <Link href="/shop" className="mt-8 inline-block rounded-full bg-gold px-8 py-4 font-bold text-black">
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Checkout</p>
        <h1 className="mt-3 text-5xl font-black">Complete Your Order</h1>
        <p className="mt-3 text-white/60">Order via WhatsApp or pay online through Paystack.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          {cart.map((item) => {
            const key = itemKey(item);

            return (
              <div
                key={`${key}-${item.selectedSize}-${item.selectedColor}`}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="grid gap-5 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <img src={item.image} alt={item.name} className="h-28 w-28 rounded-2xl object-cover" />

                  <div>
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    <p className="mt-1 text-white/60">
                      Size: {item.selectedSize || "-"} • Color: {item.selectedColor || "-"}
                    </p>
                    <p className="mt-2 font-bold text-gold">GHC {item.price}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(key, Math.max(1, Number(item.cartQuantity || 1) - 1))}
                      className="h-10 w-10 rounded-full border border-white/20"
                    >
                      -
                    </button>

                    <span className="min-w-8 text-center font-bold">{item.cartQuantity || 1}</span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(key, Number(item.cartQuantity || 1) + 1)}
                      className="h-10 w-10 rounded-full border border-white/20"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromCart(key)}
                      className="ml-2 rounded-full border border-red-400 px-4 py-2 text-sm text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <form onSubmit={handleWhatsAppCheckout} className="rounded-[2rem] border border-gold/20 bg-white/[0.03] p-6">
          <div className="mb-5 rounded-2xl border border-gold/20 bg-gold/10 p-4">
            <p className="text-sm text-white/70">
              Want faster checkout next time?{" "}
              <a href="/login" className="font-bold text-gold underline">
                Login or Sign UP
              </a>
              .
            </p>
          </div>

          <h2 className="text-2xl font-black">Customer Details</h2>

          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" className="mt-5 w-full rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" className="mt-4 w-full rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
          <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email address for Paystack payment" className="mt-4 w-full rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
          <input value={customerLocation} onChange={(e) => setCustomerLocation(e.target.value)} placeholder="Delivery location" className="mt-4 w-full rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra note e.g. delivery time, landmark" className="mt-4 min-h-28 w-full rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />

          <div className="my-6 border-t border-white/10 pt-6">
            <div className="flex justify-between text-lg">
              <span className="text-white/60">Total</span>
              <span className="font-black text-gold">GHC {total}</span>
            </div>
          </div>

          <button disabled={saving} className="w-full rounded-full bg-gold px-8 py-4 font-bold text-black disabled:opacity-50">
            {saving ? "Processing..." : "Save Order & Open WhatsApp"}
          </button>

          <button type="button" onClick={handlePaystackCheckout} disabled={saving} className="mt-3 w-full rounded-full border border-gold px-8 py-4 font-bold text-gold transition hover:bg-gold hover:text-black disabled:opacity-50">
            Pay Online with Paystack / MoMo
          </button>

          <button type="button" onClick={clearCart} className="mt-3 w-full rounded-full border border-white/20 px-8 py-4 text-white/70">
            Clear Cart
          </button>
        </form>
      </div>
    </main>
  );
}
