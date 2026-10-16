import { useState } from "react";
import { Boxes, Search } from "lucide-react";

const INITIAL_INVENTORY = [
  { _id: "inv-1", name: "Classic White Tee", sku: "TSH-WHT-001", location: "Main Warehouse (Delhi)", onHand: 120, committed: 10, available: 110 },
  { _id: "inv-2", name: "Denim Jacket", sku: "JKT-DNM-002", location: "Main Warehouse (Delhi)", onHand: 45, committed: 5, available: 40 },
  { _id: "inv-3", name: "Running Shoes", sku: "SHOE-RUN-003", location: "Regional Hub (Mumbai)", onHand: 12, committed: 7, available: 5 },
  { _id: "inv-4", name: "Everyday Backpack", sku: "BAG-BCK-004", location: "Main Warehouse (Delhi)", onHand: 8, committed: 4, available: 4 },
  { _id: "inv-5", name: "Minimalist Watch", sku: "WTC-MN-005", location: "Boutique Store (Bengaluru)", onHand: 24, committed: 2, available: 22 },
  { _id: "inv-6", name: "Ceramic Coffee Mug", sku: "MUG-CRM-006", location: "Main Warehouse (Delhi)", onHand: 0, committed: 0, available: 0 }
];

export default function Inventory() {
  const [items] = useState(INITIAL_INVENTORY);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "in_stock") return item.available > 10;
    if (statusFilter === "low_stock") return item.available > 0 && item.available <= 10;
    if (statusFilter === "out_of_stock") return item.available <= 0;

    return true;
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor real-time stock levels across warehouse locations.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm min-w-[240px]">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full py-2.5 text-sm outline-none bg-transparent"
            placeholder="Search by product, SKU, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 shadow-sm"
        >
          <option value="all">All stock statuses</option>
          <option value="in_stock">In Stock (&gt; 10)</option>
          <option value="low_stock">Low Stock (1 - 10)</option>
          <option value="out_of_stock">Out of Stock (0)</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Product & SKU</th>
              <th className="p-4">Location</th>
              <th className="p-4">On-Hand</th>
              <th className="p-4">Committed</th>
              <th className="p-4">Available</th>
              <th className="p-4">Stock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <Boxes size={36} className="text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No inventory records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing or changing your search criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isOutOfStock = item.available <= 0;
                const isLowStock = item.available > 0 && item.available <= 10;

                return (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                    </td>
                    <td className="p-4 text-slate-600">{item.location}</td>
                    <td className="p-4 font-medium text-slate-800">{item.onHand}</td>
                    <td className="p-4 text-slate-500">{item.committed}</td>
                    <td className="p-4 font-semibold text-slate-900">{item.available}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isOutOfStock
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : isLowStock
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
