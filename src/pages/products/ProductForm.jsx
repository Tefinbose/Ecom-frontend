import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const DEFAULT_PRODUCTS = [
  { _id: "prod-1", name: "Classic White Tee", description: "100% premium organic cotton t-shirt", price: 29.99, stock: 120 },
  { _id: "prod-2", name: "Denim Jacket", description: "Timeless vintage wash denim jacket", price: 89.99, stock: 45 },
  { _id: "prod-3", name: "Running Shoes", description: "Lightweight and breathable athletic shoes", price: 79.99, stock: 12 },
  { _id: "prod-4", name: "Everyday Backpack", description: "Durable water-resistant canvas travel backpack", price: 49.99, stock: 8 },
  { _id: "prod-5", name: "Minimalist Watch", description: "Elegant quartz watch with leather strap", price: 149.00, stock: 24 }
];

function getStoredProducts() {
  try {
    const raw = localStorage.getItem("empire_mock_products");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_PRODUCTS;
}

function saveStoredProducts(products) {
  try {
    localStorage.setItem("empire_mock_products", JSON.stringify(products));
  } catch {
    // ignore
  }
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState(() => {
    if (!editing) {
      return { name: "", description: "", price: "", stock: "" };
    }
    const list = getStoredProducts();
    const found = list.find((p) => p._id === id);
    if (found) {
      return {
        name: found.name || found.title || "",
        description: found.description || "",
        price: found.price ?? "",
        stock: found.stock ?? found.quantity ?? "",
      };
    }
    return { name: "", description: "", price: "", stock: "" };
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const list = getStoredProducts();
    const payload = {
      _id: editing ? id : `prod-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
    };

    let updated;
    if (editing) {
      updated = list.map((p) => (p._id === id ? payload : p));
    } else {
      updated = [payload, ...list];
    }

    saveStoredProducts(updated);
    setSuccess(true);

    setTimeout(() => {
      setSaving(false);
      navigate("/admin/products");
    }, 400);
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 outline-none focus:border-indigo-500 transition-colors bg-white";

  return (
    <section className="mx-auto max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">
        ← Back to products
      </Link>

      <h1 className="mb-6 mt-3 text-2xl font-bold text-slate-900">
        {editing ? "Edit Product" : "Add Product"}
      </h1>

      {success && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800 border border-emerald-200">
          Product saved successfully! Redirecting...
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Product name
          <input
            className={inputClass}
            name="name"
            placeholder="e.g. Minimalist Linen Shirt"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea
            className={inputClass}
            name="description"
            rows="4"
            placeholder="Describe product details, materials, fits..."
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Price (₹)
            <input
              className={inputClass}
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Stock quantity
            <input
              className={inputClass}
              name="stock"
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : editing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </section>
  );
}
