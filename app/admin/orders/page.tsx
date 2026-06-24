"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  productId?: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
};

type Status = "pending" | "paid" | "processing" | "delivered" | "cancelled";

type StatusHistory = {
  status: Status;
  note?: string;
  changedAt: string;
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
  status: Status;
  statusHistory?: StatusHistory[];
  paymentMethod?: "whatsapp" | "paystack" | "";
  paymentStatus?: "unpaid" | "paid" | "failed";
  paymentReference?: string;
  paidAt?: string | null;
  processingAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
};

const statuses: Status[] = ["pending", "paid", "processing", "delivered", "cancelled"];

function statusClass(status: Status) {
  if (status === "paid") return "border-green-400 text-green-400 bg-green-400/10";
  if (status === "processing") return "border-blue-400 text-blue-400 bg-blue-400/10";
  if (status === "delivered") return "border-gold text-gold bg-gold/10";
  if (status === "cancelled") return "border-red-400 text-red-400 bg-red-400/10";
  return "border-white/30 text-white/70 bg-white/5";
}

function shortOrderNo(id: string) {
  return `JJ-${id.slice(-6).toUpperCase()}`;
}

function cleanPhone(phone: string) {
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = `233${cleaned.slice(1)}`;
  }

  if (!cleaned.startsWith("233")) {
    cleaned = `233${cleaned}`;
  }

  return cleaned;
}

function customerStatusWhatsappUrl(order: Order, status: Status) {
  const phone = cleanPhone(order.customerPhone);

  let message = "";

  if (status === "processing") {
    message = `
Hello ${order.customerName} 👋

📦 Your order ${shortOrderNo(order._id)} is now being processed.

We are preparing your item(s) and will contact you shortly about delivery.

Thank you for shopping with JJ Luxe Collective ✨
`;
  } else if (status === "delivered") {
    message = `
Hello ${order.customerName} 👋

✅ Your order ${shortOrderNo(order._id)} has been marked as delivered.

Thank you for shopping with JJ Luxe Collective.
We hope you love your item(s) ✨
`;
  } else if (status === "cancelled") {
    message = `
Hello ${order.customerName} 👋

⚠️ Your order ${shortOrderNo(order._id)} has been cancelled.

Please contact JJ Luxe Collective if you need help or want to place a new order.
`;
  } else if (status === "paid") {
    message = `
Hello ${order.customerName} 👋

✅ Your payment has been received successfully.

🆔 Order No: ${shortOrderNo(order._id)}
💰 Amount Paid: GHC ${order.total}

🚚 Delivery will be arranged shortly.
We will contact you to confirm the delivery details.

Thank you for shopping with JJ Luxe Collective ✨
`;
  } else {
    message = `
Hello ${order.customerName} 👋

🛍️ Your order ${shortOrderNo(order._id)} has been received.

We will contact you shortly to confirm the details.

Thank you for shopping with JJ Luxe Collective ✨
`;
  }

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");

  async function fetchOrders() {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to load orders.");
        return;
      }

      setOrders(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load orders. Check terminal.");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: Status) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          statusNote: `Admin changed status to ${status}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update order.");
        return;
      }

      setOrders((current) =>
        current.map((order) => (order._id === orderId ? data : order))
      );

      if (["paid", "processing", "delivered", "cancelled"].includes(status)) {
        const openWhatsapp = confirm(
          `Status changed to "${status}". Open WhatsApp message for customer?`
        );

        if (openWhatsapp) {
          window.open(customerStatusWhatsappUrl(data, status), "_blank");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update order. Check terminal.");
    }
  }

  async function deleteOrder(orderId: string) {
    const confirmed = confirm("Delete this order?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete order.");
        return;
      }

      setOrders((current) => current.filter((order) => order._id !== orderId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete order. Check terminal.");
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.toLowerCase().includes(query) ||
        order.customerLocation.toLowerCase().includes(query) ||
        order._id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const paidRevenue = orders
    .filter((order) => ["paid", "processing", "delivered"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Admin</p>
          <h1 className="mt-3 text-5xl font-black">Orders Dashboard</h1>
          <p className="mt-3 text-white/60">
            Track orders and send customer WhatsApp updates when status changes.
          </p>
        </div>

        <button onClick={fetchOrders} className="rounded-full border border-gold px-6 py-3 font-bold text-gold">
          Refresh Orders
        </button>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-white/60">Total</p>
          <h2 className="mt-2 text-3xl font-black text-gold">{orders.length}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-white/60">Paid</p>
          <h2 className="mt-2 text-3xl font-black text-green-400">{orders.filter((o) => o.status === "paid").length}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-white/60">Processing</p>
          <h2 className="mt-2 text-3xl font-black text-blue-400">{orders.filter((o) => o.status === "processing").length}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-white/60">Delivered</p>
          <h2 className="mt-2 text-3xl font-black text-gold">{orders.filter((o) => o.status === "delivered").length}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-white/60">Revenue</p>
          <h2 className="mt-2 text-3xl font-black text-gold">GHC {paidRevenue}</h2>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_240px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, phone, location, product or order ID"
          className="rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold"
        >
          <option value="all">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-white/60">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-white/60">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => (
            <div key={order._id} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-white/40">{new Date(order.createdAt).toLocaleString()}</p>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-white/40">{shortOrderNo(order._id)}</span>
                  </div>

                  <h2 className="mt-2 text-2xl font-black">{order.customerName}</h2>
                  <p className="mt-1 text-white/60">Phone: {order.customerPhone}</p>

                  {order.customerEmail && <p className="text-white/60">Email: {order.customerEmail}</p>}

                  <p className="text-white/60">Location: {order.customerLocation}</p>
                  <p className="mt-2 text-sm text-white/50">Payment: {order.paymentMethod || "not set"} • {order.paymentStatus || "unpaid"}</p>

                  {order.paymentReference && <p className="mt-1 break-all text-xs text-white/40">Ref: {order.paymentReference}</p>}
                  {order.paidAt && <p className="mt-1 text-xs text-green-400">Paid: {new Date(order.paidAt).toLocaleString()}</p>}
                  {order.processingAt && <p className="mt-1 text-xs text-blue-400">Processing: {new Date(order.processingAt).toLocaleString()}</p>}
                  {order.deliveredAt && <p className="mt-1 text-xs text-gold">Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
                  {order.cancelledAt && <p className="mt-1 text-xs text-red-400">Cancelled: {new Date(order.cancelledAt).toLocaleString()}</p>}
                  {order.note && <p className="mt-2 text-white/50">Note: {order.note}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value as Status)}
                    className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <a
                    href={customerStatusWhatsappUrl(order, order.status)}
                    target="_blank"
                    className="rounded-full border border-green-400 px-5 py-3 text-green-400"
                  >
                    WhatsApp Customer
                  </a>

                  <button onClick={() => deleteOrder(order._id)} className="rounded-full border border-red-400 px-5 py-3 text-red-400">
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {order.items.map((item, index) => (
                  <div key={`${order._id}-${index}`} className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 sm:grid-cols-[70px_1fr_auto]">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-white/10" />
                    )}

                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-white/60">Size: {item.size || "-"} • Color: {item.color || "-"} • Qty: {item.quantity}</p>
                    </div>

                    <p className="font-black text-gold">GHC {item.subtotal}</p>
                  </div>
                ))}
              </div>

              {order.statusHistory && order.statusHistory.length > 0 && (
                <details className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <summary className="cursor-pointer font-bold text-gold">Status history</summary>
                  <div className="mt-4 space-y-2">
                    {order.statusHistory.map((history, index) => (
                      <p key={index} className="text-sm text-white/60">
                        <span className="font-bold text-white">{history.status}</span> — {history.note || "No note"} — {new Date(history.changedAt).toLocaleString()}
                      </p>
                    ))}
                  </div>
                </details>
              )}

              <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
                <p className="text-xl font-black text-gold">Total: GHC {order.total}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
