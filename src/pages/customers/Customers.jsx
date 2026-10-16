import { useState } from "react";
import { Users, Search } from "lucide-react";

const INITIAL_CUSTOMERS = [
  { _id: "cust-1", name: "Sarah Wilson", email: "sarah.wilson@example.com", ordersCount: 8, totalSpent: 1240.00, isActive: true, createdAt: "2025-11-12T10:30:00Z" },
  { _id: "cust-2", name: "Mike Johnson", email: "mike.j@example.com", ordersCount: 4, totalSpent: 420.50, isActive: true, createdAt: "2025-12-04T15:20:00Z" },
  { _id: "cust-3", name: "Emily Davis", email: "emily.d@example.com", ordersCount: 12, totalSpent: 2890.00, isActive: true, createdAt: "2025-10-18T09:15:00Z" },
  { _id: "cust-4", name: "Chris Brown", email: "chris.b@example.com", ordersCount: 2, totalSpent: 185.00, isActive: false, createdAt: "2026-01-22T14:40:00Z" },
  { _id: "cust-5", name: "Aarav Patel", email: "aarav.patel@example.com", ordersCount: 6, totalSpent: 910.00, isActive: true, createdAt: "2026-02-14T11:05:00Z" },
  { _id: "cust-6", name: "Jessica Taylor", email: "jess.t@example.com", ordersCount: 1, totalSpent: 79.99, isActive: true, createdAt: "2026-03-01T16:45:00Z" }
];

export default function Customers() {
  const [customers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            View customer details, order history, and lifecycle status.
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full py-2.5 text-sm outline-none bg-transparent"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total Spent</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <Users size={36} className="text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No customers found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{customer.name}</div>
                    <div className="text-xs text-slate-500">{customer.email}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {customer.ordersCount} orders
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    ₹{customer.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      customer.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
