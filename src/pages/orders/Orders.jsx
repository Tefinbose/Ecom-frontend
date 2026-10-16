import { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  RefreshCw,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import { getOrders, getOrderStats, updateOrderStatus, createOrder } from "../../services/orderService";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerEmail: "",
    productName: "T-Shirt",
    quantity: 1,
    price: 999,
    status: "pending",
  });

  // Load orders from API
  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      const list = res?.orders || (Array.isArray(res) ? res : []);
      setOrders(list);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Update order status handler
  const handleStatusChange = async (id, status) => {
    try {
      if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
        await updateOrderStatus(id, status);
      }
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: status.toLowerCase() } : o))
      );
      setFeedback({ type: "success", text: `Status changed to ${status}` });
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to update status" });
    }
  };

  // Submit new order handler
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        orderNumber,
        customerName: newOrder.customerName,
        customerEmail: newOrder.customerEmail,
        totalAmount: Number(newOrder.price) * Number(newOrder.quantity),
        status: newOrder.status,
        items: [
          {
            productName: newOrder.productName,
            quantity: Number(newOrder.quantity),
            price: Number(newOrder.price),
          },
        ],
      };

      const res = await createOrder(payload);
      const created = res?.order || payload;
      setOrders((prev) => [created, ...prev]);
      setIsCreatingOrder(false);
      setFeedback({ type: "success", text: `Order ${orderNumber} created!` });
      setNewOrder({
        customerName: "",
        customerEmail: "",
        productName: "T-Shirt",
        quantity: 1,
        price: 999,
        status: "pending",
      });
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to create order" });
    }
  };

  // Filter orders by search & tab
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q));

      const status = (o.status || "pending").toLowerCase();
      const matchesTab = activeTab === "all" || status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [orders, search, activeTab]);

  const totalRev = orders.reduce((sum, o) => {
    if ((o.status || "").toLowerCase() === "cancelled") return sum;
    return sum + Number(o.totalAmount || 0);
  }, 0);

  const getBadgeClass = (status) => {
    const s = (status || "").toLowerCase();
    const map = {
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return map[s] || "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track customer purchases, manage fulfillment statuses, and process sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-indigo-600" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreatingOrder(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={15} /> Create Order
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Total Orders</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Total Revenue</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">₹{totalRev.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Delivered</p>
          <p className="mt-1.5 text-2xl font-bold text-emerald-600">
            {orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Pending Action</p>
          <p className="mt-1.5 text-2xl font-bold text-amber-600">
            {orders.filter((o) => ["pending", "processing"].includes((o.status || "").toLowerCase())).length}
          </p>
        </div>
      </div>

      {/* Search and Status Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Search size={15} className="text-slate-400" />
          <input
            className="w-full text-sm outline-none bg-transparent"
            placeholder="Search orders by number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")}><X size={14} className="text-slate-400" /></button>}
        </div>

        <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                activeTab === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-xs text-slate-500">
                  <RefreshCw size={20} className="mx-auto animate-spin text-indigo-600 mb-1" />
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">
                  <ShoppingCart size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600 text-sm">No orders found</p>
                  <p className="text-xs mt-1">Create an order or adjust filters.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">
                    {o.orderNumber || `#${String(o._id).slice(-5)}`}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{o.customerName || "Customer"}</p>
                    <p className="text-xs text-slate-500">{o.customerEmail}</p>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    ₹{Number(o.totalAmount || o.total || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4">
                    <select
                      value={(o.status || "pending").toLowerCase()}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize outline-none cursor-pointer ${getBadgeClass(
                        o.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">
                Order {selectedOrder.orderNumber || selectedOrder._id}
              </h3>
              <button onClick={() => setSelectedOrder(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
              <p><strong>Total:</strong> ₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "—"}</p>
              <div className="border-t border-slate-100 pt-2 mt-2">
                <p className="font-semibold text-slate-800 mb-1">Items:</p>
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>{it.productName || it.name || "Item"} x {it.quantity || 1}</span>
                    <span className="font-semibold">₹{Number(it.price || 0).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <form onSubmit={handleCreateOrder} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900">Create New Order</h3>
              <button type="button" onClick={() => setIsCreatingOrder(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Customer Name</label>
              <input
                required
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Customer Email</label>
              <input
                required
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                value={newOrder.customerEmail}
                onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Item Name</label>
                <input
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                  value={newOrder.productName}
                  onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Price (₹)</label>
                <input
                  required
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none"
                  value={newOrder.price}
                  onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingOrder(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
