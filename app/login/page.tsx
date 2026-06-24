"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!identifier || !password) {
      alert("Enter your email/phone and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed.");
        return;
      }

      // After customer login, go straight to the home page.
      window.location.href = "/";
    } catch (error) {
      alert("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5 py-14">
      <form onSubmit={handleLogin} className="luxury-card w-full rounded-[2rem] p-8">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-gold">
          Customer Login
        </p>

        <h1 className="mt-3 text-4xl font-black">Welcome Back</h1>

        <p className="mt-3 text-white/60">
          Login with your email/phone and password.
        </p>

        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or phone number"
          className="mt-8 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold"
        />

        <button
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gold px-8 py-4 font-black text-black disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-5 text-center text-sm text-white/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-gold underline">
            Sign UP
          </Link>
        </p>
      </form>
    </main>
  );
}
