"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

type Customer = {
  fullName?: string;
  email?: string;
  phone?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  const { cart } = useCart();
  const [customer, setCustomer] = useState<Customer | null>(null);

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.cartQuantity || 1),
    0
  );

  useEffect(() => {
    async function loadCustomer() {
      try {
        if (isAdminPage) {
          setCustomer(null);
          return;
        }

        const response = await fetch("/api/customer/me");
        const data = await response.json();
        setCustomer(data.customer || null);
      } catch {
        setCustomer(null);
      }
    }

    loadCustomer();
  }, [isAdminPage]);

  const displayName =
    customer?.fullName?.trim() ||
    customer?.email?.split("@")[0] ||
    customer?.phone ||
    "";

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-black/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold font-black text-black shadow-[0_0_35px_rgba(216,181,55,0.25)]">
            JJ
          </div>

          <div className="leading-tight">
            <p className="text-lg font-black text-gold">JJ Luxe</p>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Collective
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-5 text-sm font-semibold text-white">
          <Link href="/" className="transition hover:text-gold">
            Home
          </Link>

          {!isAdminPage && (
            <>
              <Link href="/shop" className="transition hover:text-gold">
                Shop
              </Link>

              <Link href="/track-order" className="transition hover:text-gold">
                Track Order
              </Link>

              <Link
                href="/cart"
                className="relative rounded-full border border-white/20 px-4 py-2 transition hover:border-gold hover:text-gold"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gold px-2 text-xs font-black text-black">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {isAdminPage ? (
            <div className="flex items-center gap-2 rounded-full bg-gold px-5 py-2 font-black text-black shadow-[0_0_28px_rgba(216,181,55,0.25)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs text-gold">
                A
              </span>
              <span>Admin</span>
            </div>
          ) : customer ? (
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-black text-black shadow-[0_0_28px_rgba(216,181,55,0.25)] transition hover:scale-105"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs text-gold">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate">{displayName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gold px-5 py-2 font-black text-black shadow-[0_0_28px_rgba(216,181,55,0.25)] transition hover:scale-105"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
