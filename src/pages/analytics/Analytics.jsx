import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  Percent,
  CheckCircle,
  Download,
  RefreshCw,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getOrders, getOrderStats } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getCollections } from "../../services/collectionService";

export default function Analytics() {
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);

  // Fetch live analytics metrics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [orderRes, statsRes, prodRes, colRes] = await Promise.allSettled([
        getOrders(),
        getOrderStats(),
        getProducts(),
        getCollections(),
      ]);

      if (orderRes.status === "fulfilled" && orderRes.value) {
        setOrders(orderRes.value.orders || orderRes.value || []);
      }
      if (statsRes.status === "fulfilled" && statsRes.value) {
        setOrderStats(statsRes.value);
      }
      if (prodRes.status === "fulfilled" && prodRes.value) {
        setProducts(prodRes.value.products || prodRes.value || []);
      }
      if (colRes.status === "fulfilled" && colRes.value) {
        const list = colRes.value.collections || colRes.value || [];
        setCollections(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Compute metrics based on selected period
  const metrics = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (period === "7d" ? 7 : 30));

    // Filter orders by period date
    const filteredOrders = orders.filter((o) => {
      if (!o.createdAt) return true;
      return new Date(o.createdAt) >= cutoff;
    });

    const activeOrders = filteredOrders.length > 0 ? filteredOrders : orders;

    // Total revenue & orders count
    const totalRev = activeOrders.reduce((sum, o) => {
      const s = (o.status || "").toLowerCase();
      if (s === "cancelled" || s === "canceled") return sum;
      return sum + Number(o.totalAmount || o.total || 0);
    }, 0);

    const totalCount = activeOrders.length;
    const aov = totalCount > 0 ? Math.round(totalRev / totalCount) : 0;
    const deliveredCount = activeOrders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    const fulfillmentRate = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;

    // Daily / weekly trend
    const dayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    activeOrders.forEach((o) => {
      if (o.createdAt) {
        const day = new Date(o.createdAt).toLocaleDateString("en-US", { weekday: "short" });
        if (dayMap[day] !== undefined) dayMap[day] += Number(o.totalAmount || 0);
      }
    });

    const trend = Object.entries(dayMap).map(([name, revenue]) => ({ name, revenue }));

    // Category distribution
    const catMap = {};
    products.forEach((p) => {
      const matched = collections.find(
        (c) => c._id === p.category || c.title === p.category
      );
      const cat = matched ? matched.title : (p.category?.title || p.category || "General");
      catMap[cat] = (catMap[cat] || 0) + Number(p.unitPrice?.amount || p.price || 100);
    });
    const categories = Object.entries(catMap).map(([category, sales]) => ({ category, sales }));

    return { totalRev, totalCount, aov, fulfillmentRate, trend, categories };
  }, [orders, products, collections, period]);

  // Order status pipeline breakdown
  const statusItems = [
    { label: "Delivered", count: orderStats?.deliveredOrders ?? 0, color: "bg-emerald-500" },
    { label: "Processing", count: orderStats?.processingOrders ?? 0, color: "bg-blue-500" },
    { label: "Pending", count: orderStats?.pendingOrders ?? 0, color: "bg-amber-500" },
    { label: "Cancelled", count: orderStats?.cancelledOrders ?? 0, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Reporting & Insights
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Store Analytics</h1>
          <p className="text-sm text-slate-500">Live turnover, volume trends, and fulfillment status.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setPeriod("7d")}
              className={`rounded-lg px-3 py-1.5 transition ${
                period === "7d" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={`rounded-lg px-3 py-1.5 transition ${
                period === "30d" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-indigo-600" : ""} />
            Refresh
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
          >
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Revenue</span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><DollarSign size={18} /></div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">₹{metrics.totalRev.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-slate-500">Gross sales for {period}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Total Orders</span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600"><ShoppingCart size={18} /></div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{metrics.totalCount}</p>
          <p className="mt-1 text-xs text-slate-500">Transactions processed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Average Order</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><Percent size={18} /></div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">₹{metrics.aov.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-slate-500">Average ticket size</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-slate-500">Fulfillment</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600"><CheckCircle size={18} /></div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{metrics.fulfillmentRate}%</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Delivery success rate</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend Area Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Trend</h2>
              <p className="text-xs text-slate-500">Real-time daily turnover distribution</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">₹{metrics.totalRev.toLocaleString("en-IN")}</span>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
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
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#analyticsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Catalog by Category</h2>
            <p className="text-xs text-slate-500">Distribution across product lines</p>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.categories} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Value"]} />
                <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Order Fulfillment Status</h2>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Package size={14} className="text-indigo-600" />
            MongoDB Live Counts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">{item.label}</p>
                <p className="text-xl font-bold text-slate-900">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
