import { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  Search,
  Plus,
  RefreshCw,
  X,
  Edit2,
  Trash2,
  Warehouse,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  getAllInventory,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../../services/inventoryService";
import { getProducts } from "../../services/productService";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    productId: "",
    sku: "",
    locationName: "Main Warehouse",
    onHand: 10,
    available: 10,
  });

  // Load inventory and products from API
  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, prodRes] = await Promise.allSettled([
        getAllInventory(),
        getProducts(),
      ]);

      if (invRes.status === "fulfilled" && invRes.value) {
        const list = invRes.value.inventory || (Array.isArray(invRes.value) ? invRes.value : []);
        setItems(list);
      }
      if (prodRes.status === "fulfilled" && prodRes.value) {
        const pList = prodRes.value.products || prodRes.value || [];
        setProducts(Array.isArray(pList) ? pList : []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Adjust stock handler
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;
    try {
      const updatedQty = Number(adjustQty);
      if (adjustItem._id && /^[0-9a-fA-F]{24}$/.test(adjustItem._id)) {
        await updateInventory(adjustItem._id, { available: updatedQty, onHand: updatedQty });
      }
      setItems((prev) =>
        prev.map((it) => (it._id === adjustItem._id ? { ...it, available: updatedQty, onHand: updatedQty } : it))
      );
      setFeedback({ type: "success", text: `Stock updated for SKU ${adjustItem.sku}` });
      setAdjustItem(null);
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to update stock" });
    }
  };

  // Add new inventory record handler
  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product: newItem.productId || (products[0]?._id ?? ""),
        sku: newItem.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        locationName: newItem.locationName,
        onHand: Number(newItem.onHand),
        available: Number(newItem.onHand),
      };
      const res = await addInventory(payload);
      const created = res?.inventory || payload;
      setItems((prev) => [created, ...prev]);
      setIsAdding(false);
      setFeedback({ type: "success", text: "Inventory record added" });
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to add inventory" });
    }
  };

  // Delete inventory record
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory record?")) return;
    try {
      if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
        await deleteInventory(id);
      }
      setItems((prev) => prev.filter((it) => it._id !== id));
      setFeedback({ type: "success", text: "Record removed" });
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  // Filtered items
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((it) => {
      const title = it.product?.title || it.productName || "";
      const sku = it.sku || "";
      return title.toLowerCase().includes(q) || sku.toLowerCase().includes(q);
    });
  }, [items, search]);

  const totalOnHand = items.reduce((sum, it) => sum + (Number(it.onHand) || 0), 0);
  const lowStockCount = items.filter((it) => (Number(it.available) || 0) < 10).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor real-time warehouse levels, available quantities, and adjust SKU stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-indigo-600" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={15} /> Add Stock
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
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
          <p className="text-xs uppercase text-slate-500 font-semibold">Total On-Hand Units</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalOnHand}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Low Stock Warnings</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Active Locations</p>
          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {new Set(items.map((it) => it.locationName || "Main")).size}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search size={15} className="text-slate-400" />
        <input
          className="w-full text-sm outline-none bg-transparent"
          placeholder="Search inventory by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch("")}><X size={14} className="text-slate-400" /></button>}
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="p-4">Product / Item</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Location</th>
              <th className="p-4">On Hand</th>
              <th className="p-4">Available</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-xs text-slate-500">
                  <RefreshCw size={20} className="mx-auto animate-spin text-indigo-600 mb-1" />
                  Loading inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">
                  <Boxes size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600 text-sm">No inventory records found</p>
                  <p className="text-xs mt-1">Add items or clear search.</p>
                </td>
              </tr>
            ) : (
              filtered.map((it) => (
                <tr key={it._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900">
                    {it.product?.title || it.productName || "Product"}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600">{it.sku || "—"}</td>
                  <td className="p-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Warehouse size={12} /> {it.locationName || "Main Warehouse"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{it.onHand ?? 0}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        (it.available ?? 0) < 10
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {it.available ?? 0} in stock
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => {
                        setAdjustItem(it);
                        setAdjustQty(it.available ?? it.onHand ?? 0);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 size={12} /> Adjust
                    </button>
                    <button
                      onClick={() => handleDelete(it._id)}
                      className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Quantity Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <form onSubmit={handleSaveAdjustment} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900">Adjust Inventory</h3>
              <button type="button" onClick={() => setAdjustItem(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">
              SKU: <strong>{adjustItem.sku}</strong> ({adjustItem.product?.title || "Item"})
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700">Available Stock</label>
              <input
                type="number"
                min="0"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustItem(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Stock Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <form onSubmit={handleAddInventory} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900">Add Inventory Track</h3>
              <button type="button" onClick={() => setIsAdding(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Select Product</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                value={newItem.productId}
                onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">SKU Code</label>
              <input
                required
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                placeholder="e.g. TSH-BLU-001"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Initial Quantity</label>
              <input
                type="number"
                min="0"
                required
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                value={newItem.onHand}
                onChange={(e) => setNewItem({ ...newItem, onHand: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Add Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
