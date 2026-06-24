"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      window.location.href = "/admin/products";
    } catch (error) {
      alert("Login failed. Check your terminal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-xl items-center px-5 py-14">
      <form onSubmit={handleLogin} className="luxury-card w-full rounded-[2rem] p-8">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-gold">Secure Admin Login</p>
        <h1 className="mt-3 text-4xl font-black">JJ Luxe Admin</h1>
        <p className="mt-3 text-white/60">Login with the admin email and password from your .env.local file.</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="mt-8 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" type="password" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
        <button disabled={loading} className="mt-6 w-full rounded-full bg-gold px-8 py-4 font-black text-black disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
