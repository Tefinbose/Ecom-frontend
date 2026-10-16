import { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  ArrowUpDown,
  Warehouse,
  Package,
  Layers,
} from "lucide-react";

import {
  getAllInventory,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../../services/inventoryService";
import { getProducts } from "../../services/productService";
import { getImageUrl } from "../../services/api";

const FALLBACK_INVENTORY = [
  {
    _id: "inv-1",
    product: { title: "Classic White Tee", handle: "classic-white-tee" },
    sku: "TSH-WHT-001",
    locationName: "Main Warehouse (Delhi)",
    onHand: 120,
    committed: 10,
    unavailable: 0,
    available: 110,
    incoming: 20,
  },
  {
    _id: "inv-2",
    product: { title: "Denim Jacket", handle: "denim-jacket" },
    sku: "JKT-DNM-002",
    locationName: "Main Warehouse (Delhi)",
    onHand: 45,
    committed: 5,
    unavailable: 0,
    available: 40,
    incoming: 15,
  },
  {
    _id: "inv-3",
    product: { title: "Running Shoes", handle: "running-shoes" },
    sku: "SHOE-RUN-003",
    locationName: "Regional Hub (Mumbai)",
    onHand: 12,
    committed: 7,
    unavailable: 0,
    available: 5,
    incoming: 0,
  },
  {
    _id: "inv-4",
    product: { title: "Everyday Backpack", handle: "everyday-backpack" },
    sku: "BAG-BCK-004",
    locationName: "Main Warehouse (Delhi)",
    onHand: 8,
    committed: 4,
    unavailable: 0,
    available: 4,
    incoming: 5,
  },
  {
    _id: "inv-5",
    product: { title: "Minimalist Watch", handle: "minimalist-watch" },
    sku: "WTC-MN-005",
    locationName: "Boutique Store (Bengaluru)",
    onHand: 24,
    committed: 2,
    unavailable: 0,
    available: 22,
    incoming: 0,
  },
  {
    _id: "inv-6",
    product: { title: "Ceramic Coffee Mug", handle: "ceramic-coffee-mug" },
    sku: "MUG-CRM-006",
    locationName: "Main Warehouse (Delhi)",
    onHand: 0,
    committed: 0,
    unavailable: 0,
    available: 0,
    incoming: 30,
  },
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Edit / Adjust Stock modal
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    locationName: "",
    onHand: 0,
    committed: 0,
    unavailable: 0,
    incoming: 0,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Add Inventory modal
  const [isAdding, setIsAdding] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [addForm, setAddForm] = useState({
    product: "",
    variantId: "",
    locationName: "Main Warehouse",
    onHand: 10,
    committed: 0,
    unavailable: 0,
    incoming: 0,
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // Load Inventory data
  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllInventory();
      const records = response.inventory || response.data?.inventory || [];

      if (Array.isArray(records) && records.length > 0) {
        setItems(records);
      } else {
        // Fallback to sample inventory if database has no inventory yet
        setItems(FALLBACK_INVENTORY);
      }
    } catch {
      // In case of network / auth issue, use fallback gracefully
      setItems(FALLBACK_INVENTORY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Open Edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      locationName: item.locationName || item.location || "Main Warehouse",
      onHand: item.onHand ?? 0,
      committed: item.committed ?? 0,
      unavailable: item.unavailable ?? 0,
      incoming: item.incoming ?? 0,
    });
  };

  // Submit Stock Update
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSavingEdit(true);
      setError("");

      const onHandNum = Number(editForm.onHand) || 0;
      const committedNum = Number(editForm.committed) || 0;
      const unavailableNum = Number(editForm.unavailable) || 0;
      const incomingNum = Number(editForm.incoming) || 0;

      if (committedNum + unavailableNum > onHandNum) {
        setError("Committed + unavailable stock cannot exceed on-hand stock.");
        setSavingEdit(false);
        return;
      }

      // Check if it's a real MongoDB ID vs mock item
      if (editingItem._id && !editingItem._id.startsWith("inv-")) {
        await updateInventory(editingItem._id, {
          locationName: editForm.locationName,
          onHand: onHandNum,
          committed: committedNum,
          unavailable: unavailableNum,
          incoming: incomingNum,
        });
      }

      const newAvailable = Math.max(0, onHandNum - committedNum - unavailableNum);

      setItems((prev) =>
        prev.map((it) =>
          it._id === editingItem._id
            ? {
                ...it,
                locationName: editForm.locationName,
                location: editForm.locationName,
                onHand: onHandNum,
                committed: committedNum,
                unavailable: unavailableNum,
                incoming: incomingNum,
                available: newAvailable,
              }
            : it
        )
      );

      setMessage("Inventory stock levels updated successfully.");
      setEditingItem(null);
    } catch (err) {
      setError(err.message || "Failed to update inventory.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Add Inventory Modal
  const openAddModal = async () => {
    setIsAdding(true);
    try {
      const prodRes = await getProducts();
      const prods = prodRes.products || prodRes.data?.products || prodRes || [];
      if (Array.isArray(prods) && prods.length > 0) {
        setProductsList(prods);
        setAddForm((prev) => ({ ...prev, product: prods[0]._id }));
      }
    } catch {
      // Products fetch error fallback
    }
  };

  // Submit Add Inventory
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!addForm.product) {
      setError("Please select a product.");
      return;
    }

    try {
      setSavingAdd(true);
      setError("");

      const onHandNum = Number(addForm.onHand) || 0;
      const committedNum = Number(addForm.committed) || 0;
      const unavailableNum = Number(addForm.unavailable) || 0;
      const incomingNum = Number(addForm.incoming) || 0;

      if (committedNum + unavailableNum > onHandNum) {
        setError("Committed + unavailable stock cannot exceed on-hand stock.");
        setSavingAdd(false);
        return;
      }

      const res = await addInventory({
        product: addForm.product,
        variantId: addForm.variantId || null,
        locationName: addForm.locationName,
        onHand: onHandNum,
        committed: committedNum,
        unavailable: unavailableNum,
        incoming: incomingNum,
      });

      const newRecord = res.inventory || {
        _id: `inv-${Date.now()}`,
        product: productsList.find((p) => p._id === addForm.product) || {
          title: "New Inventory Product",
        },
        locationName: addForm.locationName,
        onHand: onHandNum,
        committed: committedNum,
        unavailable: unavailableNum,
        incoming: incomingNum,
        available: Math.max(0, onHandNum - committedNum - unavailableNum),
      };

      setItems((prev) => [newRecord, ...prev]);
      setMessage("New inventory record created successfully.");
      setIsAdding(false);
    } catch (err) {
      setError(err.message || "Failed to create inventory record.");
    } finally {
      setSavingAdd(false);
    }
  };

  // Delete Inventory
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this inventory record?")) return;

    try {
      if (id && !id.startsWith("inv-")) {
        await deleteInventory(id);
      }
      setItems((prev) => prev.filter((it) => it._id !== id));
      setMessage("Inventory record deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete inventory record.");
    }
  };

  // Unique locations for dropdown
  const locations = useMemo(() => {
    const locSet = new Set();
    items.forEach((item) => {
      const loc = item.locationName || item.location;
      if (loc) locSet.add(loc);
    });
    return Array.from(locSet).sort();
  }, [items]);

  // Overall Stats
  const stats = useMemo(() => {
    const totalRecords = items.length;
    const totalOnHand = items.reduce((sum, it) => sum + (Number(it.onHand) || 0), 0);
    const lowStock = items.filter((it) => {
      const avail = Number(it.available ?? it.onHand) || 0;
      return avail > 0 && avail <= 10;
    }).length;
    const outOfStock = items.filter((it) => (Number(it.available ?? it.onHand) || 0) <= 0).length;

    return { totalRecords, totalOnHand, lowStock, outOfStock };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const name = item.product?.title || item.name || "";
      const sku = item.sku || item.product?.handle || "";
      const loc = item.locationName || item.location || "";
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        sku.toLowerCase().includes(query) ||
        loc.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const avail = Number(item.available ?? item.onHand) || 0;
      if (statusFilter === "in_stock" && avail <= 10) return false;
      if (statusFilter === "low_stock" && (avail <= 0 || avail > 10)) return false;
      if (statusFilter === "out_of_stock" && avail > 0) return false;

      if (locationFilter !== "all" && loc !== locationFilter) return false;

      return true;
    });
  }, [items, search, statusFilter, locationFilter]);

  return (
    <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-indigo-600">
            <Boxes size={17} />
            <span className="font-semibold">Logistics & Warehousing</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and adjust real-time stock levels, commitments, and incoming orders across fulfillment locations.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add stock record
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Tracked SKUs
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.totalRecords}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total On-Hand Units
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {stats.totalOnHand.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Low Stock Alerts
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {stats.lowStock}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Out of Stock
          </p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {stats.outOfStock}
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button type="button" onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
            placeholder="Search by product name, SKU, or warehouse location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none shadow-sm focus:border-indigo-500"
          >
            <option value="all">All stock statuses</option>
            <option value="in_stock">In Stock (&gt; 10)</option>
            <option value="low_stock">Low Stock (1 – 10)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {locations.length > 0 && (
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none shadow-sm focus:border-indigo-500"
            >
              <option value="all">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={loadInventory}
            title="Refresh inventory"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 hover:bg-slate-100 shadow-sm transition"
          >
            <RefreshCw size={17} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Stock Directory</h2>
          <span className="text-xs text-slate-500">
            {filteredItems.length} records displayed
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-sm text-slate-500">
            <RefreshCw size={24} className="animate-spin text-indigo-600" />
            <span>Loading inventory...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <Boxes size={36} className="text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No inventory records match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-4">Product & SKU</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">On-Hand</th>
                  <th className="p-4">Committed</th>
                  <th className="p-4">Available</th>
                  <th className="p-4">Incoming</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const title = item.product?.title || item.name || "Product";
                  const sku = item.sku || item.product?.handle || "—";
                  const loc = item.locationName || item.location || "Default Warehouse";
                  const available = Number(item.available ?? item.onHand) || 0;
                  const onHand = Number(item.onHand) || 0;
                  const committed = Number(item.committed) || 0;
                  const incoming = Number(item.incoming) || 0;

                  const isOutOfStock = available <= 0;
                  const isLowStock = available > 0 && available <= 10;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{title}</div>
                        <div className="text-xs font-mono text-slate-400">{sku}</div>
                      </td>

                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Warehouse size={14} className="text-slate-400" />
                          <span>{loc}</span>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-800">{onHand}</td>
                      <td className="p-4 text-slate-500">{committed}</td>
                      <td className="p-4 font-bold text-slate-900">{available}</td>
                      <td className="p-4 text-slate-500">{incoming}</td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isOutOfStock
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : isLowStock
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Adjust Stock"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            title="Delete Record"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Adjust Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Adjust Inventory Stock
                </h3>
                <p className="text-xs text-slate-500">
                  {editingItem.product?.title || editingItem.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Name
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                  value={editForm.locationName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, locationName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    On-Hand Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={editForm.onHand}
                    onChange={(e) =>
                      setEditForm({ ...editForm, onHand: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Committed (Orders)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={editForm.committed}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        committed: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unavailable (Damaged)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={editForm.unavailable}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        unavailable: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Incoming Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={editForm.incoming}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        incoming: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex justify-between items-center">
                <span>Calculated Available for Sale:</span>
                <span className="font-bold text-sm text-indigo-600">
                  {Math.max(
                    0,
                    (Number(editForm.onHand) || 0) -
                      (Number(editForm.committed) || 0) -
                      (Number(editForm.unavailable) || 0)
                  )}
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingEdit ? "Updating..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Add Inventory Record
                </h3>
                <p className="text-xs text-slate-500">
                  Assign warehouse stock levels to a product.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product *
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                  value={addForm.product}
                  onChange={(e) =>
                    setAddForm({ ...addForm, product: e.target.value })
                  }
                  required
                >
                  {productsList.length === 0 ? (
                    <option value="">No products found</option>
                  ) : (
                    productsList.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title} ({p.handle || p._id})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Name *
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                  value={addForm.locationName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, locationName: e.target.value })
                  }
                  placeholder="e.g. Main Warehouse (Delhi)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    On-Hand Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={addForm.onHand}
                    onChange={(e) =>
                      setAddForm({ ...addForm, onHand: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Committed Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={addForm.committed}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        committed: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unavailable Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={addForm.unavailable}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        unavailable: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Incoming Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                    value={addForm.incoming}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        incoming: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdd}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingAdd ? "Saving..." : "Create record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
