import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  CircleDollarSign,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getProducts } from "../../services/productService";
import { getOrders, getOrderStats } from "../../services/orderService";
import { getCustomers } from "../../services/customerService";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderStats, setOrderStats] = useState(null);

  // Fetch real store data from live API
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes, custRes, statsRes] = await Promise.allSettled([
        getOrders(),
        getProducts(),
        getCustomers(),
        getOrderStats(),
      ]);

      if (orderRes.status === "fulfilled" && orderRes.value) {
        const list = orderRes.value.orders || orderRes.value || [];
        setOrders(Array.isArray(list) ? list : []);
      }
      if (prodRes.status === "fulfilled" && prodRes.value) {
        const list = prodRes.value.products || prodRes.value || [];
        setProducts(Array.isArray(list) ? list : []);
      }
      if (custRes.status === "fulfilled" && custRes.value) {
        const list = custRes.value.users || custRes.value || [];
        setCustomers(Array.isArray(list) ? list : []);
      }
      if (statsRes.status === "fulfilled" && statsRes.value) {
        setOrderStats(statsRes.value);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Compute live KPI metrics
  const totalRevenue = useMemo(() => {
    if (orderStats?.totalSales != null && orderStats.totalSales > 0) {
      return orderStats.totalSales;
    }
    return orders.reduce((sum, o) => {
      const status = (o.status || "").toLowerCase();
      if (status === "cancelled" || status === "canceled") return sum;
      return sum + Number(o.totalAmount || o.total || 0);
    }, 0);
  }, [orders, orderStats]);

  // Compute 7-day sales trend from real orders
  const salesTrend = useMemo(() => {
    const daysMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    orders.forEach((o) => {
      const status = (o.status || "").toLowerCase();
      if (status !== "cancelled" && status !== "canceled" && o.createdAt) {
        const dayName = new Date(o.createdAt).toLocaleDateString("en-US", { weekday: "short" });
        if (daysMap[dayName] !== undefined) {
          daysMap[dayName] += Number(o.totalAmount || 0);
        }
      }
    });
    return Object.entries(daysMap).map(([day, sales]) => ({ day, sales }));
  }, [orders]);

  // Status badge helper
  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    const map = {
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return map[s] || "bg-amber-50 text-amber-700 border-amber-200";
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <RefreshCw size={28} className="animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-600">Loading store dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Overview
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Store Dashboard</h1>
          <p className="text-sm text-slate-500">Live summary of your orders, sales, and products.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Total Revenue</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <CircleDollarSign size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">From completed customer checkouts</p>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Total Orders</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <ShoppingCart size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{orders.length}</p>
          <p className="mt-1 text-xs text-slate-500">All recorded orders in MongoDB</p>
        </div>

        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Customers</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Users size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{customers.length}</p>
          <p className="mt-1 text-xs text-slate-500">Registered store user accounts</p>
        </div>

        {/* Total Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Products</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Package size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{products.length}</p>
          <p className="mt-1 text-xs text-slate-500">Catalogue items available</p>
        </div>
      </div>

      {/* Main Grid: Sales Chart & Recent Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Trend (Last 7 Days)</h2>
              <p className="text-xs text-slate-500">Real-time daily gross sales from orders</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">
              ₹{totalRevenue.toLocaleString("en-IN")} total
            </span>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="liveSalesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#635bff" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#635bff" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                />
                <Tooltip
                  formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Sales"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="sales" stroke="#635bff" strokeWidth={2.5} fill="url(#liveSalesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No orders recorded yet. Place an order to see it live here.
              </div>
            ) : (
              orders.slice(0, 5).map((order) => {
                const id = order.orderNumber || `#${String(order._id).slice(-5)}`;
                const amt = Number(order.totalAmount || order.total || 0).toLocaleString("en-IN");
                return (
                  <div
                    key={order._id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{id}</p>
                      <p className="text-[11px] text-slate-500">{order.customerName || "Customer"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-xs">₹{amt}</p>
                      <span
                        className={`inline-block mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status || "pending"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Store Products</h2>
            <p className="text-xs text-slate-500">Quick view of items currently in your catalog</p>
          </div>
          <Link to="/admin/products" className="text-xs font-semibold text-indigo-600 hover:underline">
            Manage all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-xs text-slate-400">
                    No products added yet. Click &quot;Add Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.slice(0, 5).map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-900">{prod.title}</td>
                    <td className="py-3 text-xs text-slate-500">
                      {prod.category?.title || prod.category || "General"}
                    </td>
                    <td className="py-3 font-bold text-slate-900 text-xs">
                      ₹{Number(prod.unitPrice?.amount || prod.price || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700 capitalize">
                        {prod.status || "active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
