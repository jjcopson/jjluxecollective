import Link from "next/link";
import { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const id = product._id || product.id;

  return (
    <Link
      href={`/shop/${id}`}
      className="product-hover group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]"
    >
      <div className="overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
          {product.category} • {product.gender}
        </p>
        <h3 className="mt-3 text-2xl font-black">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/55">{product.description}</p>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xl font-black text-gold">GHC {product.price}</p>
          <span className="rounded-full border border-gold/40 px-4 py-2 text-sm font-bold text-gold">View</span>
        </div>
      </div>
    </Link>
  );
}
