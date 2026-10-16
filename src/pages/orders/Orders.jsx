import { useState } from "react";
import { ShoppingCart, Search } from "lucide-react";

const INITIAL_ORDERS = [
  { _id: "ORD-1042", customer: "Sarah Wilson", email: "sarah.wilson@example.com", date: "2026-03-14", total: 9850.00, payment: "Paid", status: "Processing", items: 3 },
  { _id: "ORD-1041", customer: "Mike Johnson", email: "mike.j@example.com", date: "2026-03-14", total: 6800.00, payment: "Paid", status: "Shipped", items: 2 },
  { _id: "ORD-1040", customer: "Emily Davis", email: "emily.d@example.com", date: "2026-03-13", total: 18500.00, payment: "Paid", status: "Delivered", items: 5 },
  { _id: "ORD-1039", customer: "Chris Brown", email: "chris.b@example.com", date: "2026-03-12", total: 5100.00, payment: "Pending", status: "Pending", items: 1 },
  { _id: "ORD-1038", customer: "Aarav Patel", email: "aarav.patel@example.com", date: "2026-03-11", total: 12400.00, payment: "Paid", status: "Delivered", items: 4 },
  { _id: "ORD-1037", customer: "Jessica Taylor", email: "jess.t@example.com", date: "2026-03-10", total: 3200.00, payment: "Refunded", status: "Delivered", items: 1 },
];

export default function Orders() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  function updateStatus(id, newStatus) {
    setOrders((current) =>
      current.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and fulfill customer purchases across your sales channels.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm min-w-[240px]">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full py-2.5 text-sm outline-none bg-transparent"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm text-xs font-medium">
          {["all", "processing", "shipped", "delivered", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 capitalize transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Fulfillment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <ShoppingCart size={36} className="text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No orders found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another filter or search term.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const isDelivered = order.status === "Delivered";
                const isShipped = order.status === "Shipped";
                const isProcessing = order.status === "Processing";

                return (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-600">{order._id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{order.customer}</div>
                      <div className="text-xs text-slate-400">{order.email}</div>
                    </td>
                    <td className="p-4 text-slate-600">{order.date}</td>
                    <td className="p-4 text-slate-600">{order.items} items</td>
                    <td className="p-4 font-semibold text-slate-900">
                      ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.payment === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.payment === "Refunded"
                          ? "bg-slate-100 text-slate-600 border border-slate-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer ${
                          isDelivered
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isShipped
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : isProcessing
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
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
