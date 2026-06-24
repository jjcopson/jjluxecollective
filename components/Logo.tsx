import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-gold text-sm font-black text-black shadow-[0_0_25px_rgba(212,175,55,0.35)]">
        JJ
      </div>
      <div className="leading-tight">
        <p className="text-lg font-black tracking-wide text-gold">JJ Luxe</p>
        <p className="-mt-1 text-xs uppercase tracking-[0.25em] text-white/60">Collective</p>
      </div>
    </Link>
  );
}
