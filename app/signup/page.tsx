"use client";

import Link from "next/link";
import { useState } from "react";

function passwordStrong(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!phone.trim()) {
      alert("Enter your phone number first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/customer/signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to send OTP.");
        return;
      }

      setVerifiedPhone(data.phone || phone);
      setOtpSent(true);
      alert("OTP sent to your phone.");
    } catch (error) {
      alert("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName || !phone || !email || !otp || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (!passwordStrong(password)) {
      alert("Password must be at least 8 characters and include uppercase, lowercase and a number.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/customer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone: verifiedPhone || phone, email, otp, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create account.");
        return;
      }

      alert("Account created successfully. Please login.");
      window.location.href = "/login";
    } catch (error) {
      alert("Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-14">
      <form onSubmit={handleSignup} className="luxury-card rounded-[2rem] p-8">
        <p className="text-sm font-black uppercase tracking-[0.35em] text-gold">Create Account</p>
        <h1 className="mt-3 text-4xl font-black">Sign UP</h1>
        <p className="mt-3 text-white/60">Create an account so checkout details are saved automatically.</p>

        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="mt-8 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number, e.g. 0557336988" className="w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
          <button type="button" onClick={sendOtp} disabled={loading} className="rounded-full border border-gold px-6 py-4 font-bold text-gold disabled:opacity-50">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>

        {otpSent && (
          <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <p className="text-white/70">OTP has been sent to your phone. Enter it below.</p>
          </div>
        )}

        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP code" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" type="password" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />

        <p className={`mt-2 text-sm ${passwordStrong(password) ? "text-green-400" : "text-white/50"}`}>
          Password must include uppercase, lowercase, a number and at least 8 characters.
        </p>

        <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" type="password" className="mt-4 w-full rounded-2xl border border-white/20 bg-black px-5 py-4 outline-none focus:border-gold" />

        <button disabled={loading} className="mt-6 w-full rounded-full bg-gold px-8 py-4 font-black text-black disabled:opacity-50">
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-white/60">
          Already have an account? <Link href="/login" className="font-bold text-gold underline">Login</Link>
        </p>
      </form>
    </main>
  );
}
