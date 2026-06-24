"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminMenu() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin/login")) return null;

  const links = [
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="border-b border-gold/20 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-gold">
            Admin Panel
          </p>
          <p className="mt-1 text-sm text-white/50">
            Manage products and orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-6 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-gold text-black"
                    : "border border-white/15 text-white hover:border-gold hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
