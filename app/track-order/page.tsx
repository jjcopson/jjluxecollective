"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = { name?: string; selectedSize?: string; selectedColor?: string; cartQuantity?: number; quantity?: number; price?: number; image?: string };
type Order = {
  _id: string;
  orderCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerLocation?: string;
  items?: OrderItem[];
  total?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paidAt?: string;
  processingAt?: string;
  deliveredAt?: string;
  createdAt?: string;
};

function statusClass(status?: string) {
  if (status === "delivered") return "text-green-400 border-green-400";
  if (status === "processing") return "text-blue-400 border-blue-400";
  if (status === "paid") return "text-green-400 border-green-400";
  if (status === "cancelled") return "text-red-400 border-red-400";
  return "text-gold border-gold";
}

export default function TrackOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("Loading your orders...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/customer/orders", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          setMessage(data.message || "Please login to view your orders.");
          setOrders([]);
          return;
        }
        setOrders(data.orders || []);
        setMessage((data.orders || []).length ? "" : "You do not have any orders yet.");
      } catch {
        setMessage("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-gold">Track Order</p>
        <h1 className="mt-3 text-5xl font-black">My Orders</h1>
        <p className="mt-3 text-white/60">When you are logged in, your orders appear here automatically.</p>
      </div>

      {loading && <p className="text-white/60">{message}</p>}

      {!loading && message && (
        <div className="luxury-card rounded-[2rem] p-8 text-center">
          <p className="text-white/70">{message}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/login" className="rounded-full bg-gold px-6 py-3 font-black text-black">Login</Link>
            <Link href="/shop" className="rounded-full border border-gold px-6 py-3 font-bold text-gold">Shop</Link>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="luxury-card rounded-[2rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-white/50">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</p>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClass(order.status)}`}>
                    {order.status || "pending"}
                  </span>
                  {order.orderCode && <span className="text-sm text-white/40">{order.orderCode}</span>}
                </div>
                <h2 className="mt-3 text-2xl font-black">{order.customerName}</h2>
                <p className="mt-1 text-white/60">Phone: {order.customerPhone}</p>
                <p className="text-white/60">Location: {order.customerLocation}</p>
                <p className="mt-2 text-sm text-white/45">Payment: {order.paymentMethod || "unknown"} • {order.paymentStatus || "unpaid"}</p>
                {order.paidAt && <p className="mt-1 text-sm text-green-400">Paid: {new Date(order.paidAt).toLocaleString()}</p>}
                {order.processingAt && <p className="mt-1 text-sm text-blue-400">Processing: {new Date(order.processingAt).toLocaleString()}</p>}
                {order.deliveredAt && <p className="mt-1 text-sm text-green-400">Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
              </div>
              <p className="text-2xl font-black text-gold">GHC {order.total || 0}</p>
            </div>

            <div className="mt-5 space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center gap-4">
                    {item.image && <img src={item.image} alt={item.name || "Item"} className="h-16 w-16 rounded-xl object-cover" />}
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="text-sm text-white/50">Size: {item.selectedSize || "-"} • Color: {item.selectedColor || "-"} • Qty: {item.cartQuantity || item.quantity || 1}</p>
                    </div>
                  </div>
                  <p className="font-black text-gold">GHC {item.price || 0}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
