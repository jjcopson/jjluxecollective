"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductKey, useProducts } from "@/context/ProductContext";
import { Product } from "@/data/products";

type ProductForm = {
  name: string;
  category: string;
  gender: string;
  price: string;
  oldPrice: string;
  description: string;
  sizes: string;
  colors: string;
  image: string;
  quantity: string;
  featured: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  category: "",
  gender: "Unisex",
  price: "",
  oldPrice: "",
  description: "",
  sizes: "S, M, L, XL",
  colors: "Black, White",
  image: "",
  quantity: "",
  featured: false
};

function convertFormToProduct(form: ProductForm, existingId?: string): Product {
  return {
    _id: existingId,
    name: form.name,
    category: form.category,
    gender: form.gender,
    price: Number(form.price),
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    description: form.description,
    sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
    colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
    image: form.image,
    quantity: Number(form.quantity),
    featured: form.featured
  };
}

function convertProductToForm(product: Product): ProductForm {
  return {
    name: product.name || "",
    category: product.category || "",
    gender: product.gender || "Unisex",
    price: product.price ? String(product.price) : "",
    oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    description: product.description || "",
    sizes: product.sizes?.join(", ") || "S, M, L, XL",
    colors: product.colors?.join(", ") || "Black, White",
    image: product.image || "",
    quantity: product.quantity ? String(product.quantity) : "",
    featured: Boolean(product.featured)
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { products, loading, addProduct, updateProduct, deleteProduct, refreshProducts } = useProducts();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const totalStock = useMemo(() => products.reduce((sum, item) => sum + item.quantity, 0), [products]);
  const totalValue = useMemo(() => products.reduce((sum, item) => sum + item.quantity * item.price, 0), [products]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target;
    const name = target.name;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((current) => ({ ...current, [name]: target.checked }));
      return;
    }
    setForm((current) => ({ ...current, [name]: target.value }));
  }

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      alert("Cloudinary is not configured. Check .env.local.");
      return "";
    }
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);
    uploadData.append("folder", "jj-luxe-collective");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: uploadData });
    const data = await response.json();
    if (!response.ok) {
      console.error("Cloudinary upload error:", data);
      throw new Error(data.error?.message || "Image upload failed");
    }
    return data.secure_url as string;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please choose an image below 5MB.");
      return;
    }
    try {
      setUploadingImage(true);
      const imageUrl = await uploadToCloudinary(file);
      if (imageUrl) setForm((current) => ({ ...current, image: imageUrl }));
    } catch (error) {
      console.error(error);
      alert("Image upload failed. Check your Cloudinary preset and cloud name.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.image || !form.quantity || !form.description) {
      alert("Please fill name, category, price, image, quantity and description.");
      return;
    }
    try {
      setSaving(true);
      const product = convertFormToProduct(form, editingProduct?._id);
      if (editingProduct) {
        await updateProduct(product);
        setEditingProduct(null);
      } else {
        const { _id, ...newProduct } = product;
        await addProduct(newProduct);
      }
      setForm(emptyForm);
      setImageMode("upload");
    } catch (error) {
      alert("Action failed. Check your MongoDB connection and terminal error.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product: Product) {
    if (!product._id) {
      alert("This starter product is not in MongoDB yet. Add it manually as a new product first.");
      return;
    }
    setEditingProduct(product);
    setForm(convertProductToForm(product));
    setImageMode("url");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingProduct(null);
    setForm(emptyForm);
    setImageMode("upload");
  }

  async function handleDelete(product: Product) {
    const confirmDelete = confirm(`Delete ${product.name}?`);
    if (!confirmDelete) return;
    try { await deleteProduct(product); } catch (error) { alert("Delete failed. Check your MongoDB connection and terminal error."); console.error(error); }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-gold">ADMIN DASHBOARD</p>
          <h1 className="text-5xl font-black">Manage JJ Luxe Collective</h1>
          <p className="mt-3 text-white/50">Database mode: MongoDB • Image mode: Cloudinary</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={refreshProducts} className="rounded-full border border-gold px-5 py-3 text-gold">Refresh</button>
          <button onClick={handleLogout} className="rounded-full border border-white/20 px-5 py-3 text-white/80">Logout</button>
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="card p-6"><p className="text-white/60">Products</p><h2 className="text-4xl font-black text-gold">{products.length}</h2></div>
        <div className="card p-6"><p className="text-white/60">Total Stock</p><h2 className="text-4xl font-black text-gold">{totalStock}</h2></div>
        <div className="card p-6"><p className="text-white/60">Stock Value</p><h2 className="text-4xl font-black text-gold">GH₵ {totalValue}</h2></div>
      </div>

      <form onSubmit={handleSubmit} className="card mb-10 grid gap-5 p-6 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="text-2xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2><p className="text-white/60">Product photos upload to Cloudinary. MongoDB stores only the image URL.</p></div>
        <input name="name" value={form.name || ""} onChange={handleChange} placeholder="Product name" className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
        <input name="category" value={form.category || ""} onChange={handleChange} placeholder="Category e.g. Hoodies" className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
        <select name="gender" value={form.gender || "Unisex"} onChange={handleChange} className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold"><option>Unisex</option><option>Men</option><option>Women</option></select>
        <input name="price" type="number" value={form.price || ""} onChange={handleChange} placeholder="Price e.g. 350" className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
        <input name="oldPrice" type="number" value={form.oldPrice || ""} onChange={handleChange} placeholder="Old price optional" className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
        <input name="quantity" type="number" value={form.quantity || ""} onChange={handleChange} placeholder="Quantity in stock" className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
        <input name="sizes" value={form.sizes || ""} onChange={handleChange} placeholder="Sizes e.g. S, M, L, XL" className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
        <input name="colors" value={form.colors || ""} onChange={handleChange} placeholder="Colors e.g. Black, White, Gold" className="rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />

        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-5">
          <div className="mb-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => setImageMode("upload")} className={`rounded-full px-5 py-2 ${imageMode === "upload" ? "bg-gold text-black" : "border border-white/20 text-white"}`}>Upload Photo</button>
            <button type="button" onClick={() => setImageMode("url")} className={`rounded-full px-5 py-2 ${imageMode === "url" ? "bg-gold text-black" : "border border-white/20 text-white"}`}>Use Image URL</button>
          </div>
          {imageMode === "upload" ? <input key={imageMode} type="file" accept="image/*" onChange={handleImageUpload} className="w-full rounded-xl border border-white/20 bg-black px-4 py-3" /> : <input name="image" value={form.image || ""} onChange={handleChange} placeholder="Paste image URL" className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />}
          {uploadingImage && <p className="mt-3 text-gold">Uploading image to Cloudinary...</p>}
          {form.image && <div className="mt-5"><p className="mb-3 text-sm text-white/60">Image preview</p><img src={form.image} alt="Product preview" className="h-64 w-full max-w-md rounded-2xl object-cover" /><p className="mt-2 break-all text-xs text-white/40">{form.image}</p></div>}
        </div>

        <textarea name="description" value={form.description || ""} onChange={handleChange} placeholder="Product description" className="md:col-span-2 min-h-28 rounded-xl border border-white/20 bg-black px-4 py-3 outline-none focus:border-gold" />
        <label className="flex items-center gap-3"><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />Show on homepage as featured</label>
        <div className="flex gap-3 md:col-span-2"><button disabled={saving || uploadingImage} className="rounded-full bg-gold px-8 py-4 font-bold text-black disabled:opacity-50">{saving ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}</button>{editingProduct && <button type="button" onClick={cancelEdit} className="rounded-full border border-white/20 px-8 py-4">Cancel</button>}</div>
      </form>

      {loading ? <p className="text-white/60">Loading products...</p> : <div className="grid gap-5">{products.map((product) => <div key={getProductKey(product)} className="card grid gap-5 p-5 md:grid-cols-[120px_1fr_auto] md:items-center"><img src={product.image} alt={product.name} className="h-28 w-28 rounded-2xl object-cover" /><div><h3 className="text-xl font-bold">{product.name}</h3><p className="text-white/60">{product.category} • {product.gender} • Stock: {product.quantity}</p><p className="text-gold">GH₵ {product.price}</p>{!product._id && <p className="mt-1 text-xs text-white/40">Starter product. Add it manually to save it into MongoDB.</p>}</div><div className="flex gap-3"><button onClick={() => startEdit(product)} className="rounded-full border border-gold px-5 py-3 text-gold">Edit</button><button onClick={() => handleDelete(product)} className="rounded-full border border-red-400 px-5 py-3 text-red-400">Delete</button></div></div>)}</div>}
    </main>
  );
}
