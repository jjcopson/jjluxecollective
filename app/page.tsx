"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const data = await response.json();

        if (Array.isArray(data)) {
          setFeaturedProducts(
            data.filter((product) => product.featured).slice(0, 3)
          );
        }
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_0.9fr] lg:py-24">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.45em] text-gold">
            Premium Fashion
          </p>

          <h1 className="mt-5 max-w-3xl text-6xl font-black leading-[0.95] md:text-7xl">
            JJ Luxe <span className="text-gold">Collective</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Discover clean everyday pieces with a luxury feel, designed for confidence,
            comfort and standout style.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/shop" className="luxury-button px-9 py-4">
              Shop Collection
            </Link>

            <Link href="/track-order" className="luxury-outline px-9 py-4">
              Track Order
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
            {[
              ["Luxury", "Modern style"],
              ["Unisex", "For every wardrobe"],
              ["GHC", "Easy ordering"],
            ].map(([title, text]) => (
              <div key={title} className="luxury-card rounded-2xl p-5">
                <p className="text-2xl font-black text-gold">{title}</p>
                <p className="mt-1 text-sm text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="luxury-card luxury-glow relative overflow-hidden rounded-[2rem] p-4">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
            alt="Luxury fashion shopping"
            className="h-[540px] w-full rounded-[1.5rem] object-cover"
          />

          <div className="absolute bottom-10 left-10 rounded-3xl bg-black/70 p-6 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/45">
              New Season
            </p>
            <p className="mt-2 text-2xl font-black text-gold">Wear Your Confidence</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.45em] text-gold">
              Curated Picks
            </p>
            <h2 className="mt-3 text-4xl font-black">Featured Products</h2>
          </div>

          <Link href="/shop" className="text-sm font-bold text-gold hover:underline">
            View all products
          </Link>
        </div>

        {loading ? (
          <p className="text-white/60">Loading featured products...</p>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-white/60">
              No featured products yet. Mark products as featured in the admin products page.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
