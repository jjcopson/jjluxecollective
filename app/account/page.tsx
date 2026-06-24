"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Customer = { _id: string; fullName?: string; email?: string; phone?: string; location?: string };

export default function AccountPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const response = await fetch("/api/customer/me");
        const data = await response.json();
        if (!data.customer) {
          window.location.href = "/login";
          return;
        }
        setCustomer(data.customer);
        setFullName(data.customer.fullName || "");
        setEmail(data.customer.email || "");
        setPhone(data.customer.phone || "");
        setLocation(data.customer.location || "");
      } finally {
        setLoadingProfile(false);
      }
    }
    loadCustomer();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch("/api/customer/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, location }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to save profile.");
        return;
      }
      setCustomer(data.customer);
      alert("Profile saved.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/customer/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (loadingProfile) return <main className="p-10 text-white/60">Loading account...</main>;
  if (!customer) return null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <form onSubmit={saveProfile} className="luxury-card rounded-[2rem] p-8">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-gold">Customer Account</p>
        <h1 className="mt-3 text-4xl font-black">My Profile</h1>
        <p className="mt-3 text-white/60">These details will be used automatically during checkout.</p>

        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="mt-8 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Delivery location" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />

        <button disabled={saving} className="mt-6 w-full rounded-full bg-gold px-8 py-4 font-black text-black disabled:opacity-50">
          {saving ? "Saving..." : "Save Profile"}
        </button>

        <Link href="/track-order" className="mt-3 block w-full rounded-full border border-gold px-8 py-4 text-center font-bold text-gold">View My Orders</Link>
        <button type="button" onClick={logout} className="mt-3 w-full rounded-full border border-red-400 px-8 py-4 font-bold text-red-400">Logout</button>
      </form>
    </main>
  );
}
