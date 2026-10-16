import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Package,
  Search,
  Pencil,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getProducts, deleteProduct } from "../../services/productService";
import { getImageUrl } from "../../services/api";

export default function AddProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Load products list from API
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const list = res?.products || (Array.isArray(res) ? res : []);
      setProducts(list);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle product deletion
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProduct(deletingId);
      setProducts((prev) => prev.filter((p) => p._id !== deletingId));
      setFeedback({ type: "success", text: "Product deleted successfully" });
      setDeletingId(null);
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to delete product" });
    }
  };

  // Filtered products list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.category && String(p.category?.title || p.category).toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" || (p.status || "active").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your store catalog, edit pricing, variants, and stock status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-indigo-600" : ""} />
            Refresh
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Total Products</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{products.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Active</p>
          <p className="mt-1.5 text-2xl font-bold text-emerald-600">
            {products.filter((p) => (p.status || "active").toLowerCase() === "active").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Draft / Archived</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-400">
            {products.filter((p) => (p.status || "").toLowerCase() !== "active").length}
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search size={15} className="text-slate-400" />
          <input
            className="w-full text-sm outline-none bg-transparent"
            placeholder="Search products by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")}><X size={14} className="text-slate-400" /></button>}
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
          {["all", "active", "draft"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                statusFilter === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-xs text-slate-500">
                  <RefreshCw size={20} className="mx-auto animate-spin text-indigo-600 mb-1" />
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400">
                  <Package size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600 text-sm">No products found</p>
                  <p className="text-xs mt-1">Click &quot;Add Product&quot; to create your first item.</p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const img = getImageUrl(p.image || p.media?.[0]?.url);
                const price = Number(p.unitPrice?.amount || p.price || 0).toLocaleString("en-IN");

                return (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img
                            src={img}
                            alt={p.title}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <Package size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{p.title}</p>
                          <p className="text-xs text-slate-500">{p.vendor || "Store Vendor"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-xs text-slate-600">
                      {p.category?.title || p.category || "General"}
                    </td>

                    <td className="p-4 font-bold text-slate-900">₹{price}</td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          (p.status || "active").toLowerCase() === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.status || "active"}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(p._id)}
                        className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900">Delete Product</h3>
            <p className="mt-2 text-xs text-slate-600">
              Are you sure you want to permanently remove this product from your store?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
