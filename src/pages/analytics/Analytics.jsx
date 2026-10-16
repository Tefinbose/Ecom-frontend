import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
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
  Legend,
} from "recharts";

const data7Days = [
  { name: "Mon", revenue: 28400, orders: 124 },
  { name: "Tue", revenue: 35100, orders: 145 },
  { name: "Wed", revenue: 31200, orders: 130 },
  { name: "Thu", revenue: 44800, orders: 182 },
  { name: "Fri", revenue: 41600, orders: 168 },
  { name: "Sat", revenue: 58900, orders: 235 },
  { name: "Sun", revenue: 64200, orders: 260 },
];

const data30Days = [
  { name: "Week 1", revenue: 198000, orders: 810 },
  { name: "Week 2", revenue: 242000, orders: 980 },
  { name: "Week 3", revenue: 215000, orders: 890 },
  { name: "Week 4", revenue: 310000, orders: 1240 },
];

const categoryData = [
  { category: "Clothing", sales: 145000 },
  { category: "Footwear", sales: 89000 },
  { category: "Accessories", sales: 62000 },
  { category: "Home & Living", sales: 34000 },
  { category: "Beauty", sales: 18000 },
];

const channels = [
  { channel: "Organic Search", visitors: "24,500", bounce: "38%", conversion: "3.8%", revenue: "₹1,42,000" },
  { channel: "Direct Traffic", visitors: "18,200", bounce: "29%", conversion: "4.2%", revenue: "₹1,18,500" },
  { channel: "Social Media (Instagram/FB)", visitors: "15,800", bounce: "46%", conversion: "2.6%", revenue: "₹68,400" },
  { channel: "Email Newsletters", visitors: "8,900", bounce: "22%", conversion: "5.4%", revenue: "₹54,200" },
  { channel: "Referral & Affiliates", visitors: "4,600", bounce: "34%", conversion: "3.1%", revenue: "₹22,100" },
];

export default function Analytics() {
  const [period, setPeriod] = useState("7d");

  const trendData = period === "7d" ? data7Days : data30Days;
  const totalRevenue = period === "7d" ? "₹3,04,200" : "₹9,65,000";
  const totalOrders = period === "7d" ? "1,244" : "3,920";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
            REPORTING & INSIGHTS
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Store Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time performance metrics, customer behavior, and sales channel trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm text-xs font-medium">
            <button
              onClick={() => setPeriod("7d")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                period === "7d"
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                period === "30d"
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Last 30 days
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Revenue</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalRevenue}</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={14} /> +18.4% vs previous period
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Orders</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalOrders}</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={14} /> +12.1% vs previous period
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Conversion Rate</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Percent size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">3.42%</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={14} /> +0.6% vs benchmark
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Returning Customers</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Repeat size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">28.5%</div>
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
              <ArrowDownRight size={14} /> -1.2% this week
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend Area Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue & Demand Trend</h2>
              <p className="text-xs text-slate-500">Daily gross turnover and completed checkout volumes</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <span>Revenue (₹)</span>
            </div>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsSalesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? `₹${Number(value).toLocaleString()}` : value,
                    name === "revenue" ? "Turnover" : "Orders",
                  ]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#analyticsSalesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Sales by Category</h2>
            <p className="text-xs text-slate-500">Distribution across product departments</p>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 15, bottom: 0 }}
              >
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
                  width={90}
                />
                <Tooltip
                  formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Sales"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Traffic Acquisition Channels */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-bold text-slate-900">Traffic & Acquisition Channels</h2>
          <p className="text-xs text-slate-500">
            Attribution of visits, customer bounce rates, and direct checkout revenue
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Channel Source</th>
                <th className="p-4">Total Visitors</th>
                <th className="p-4">Bounce Rate</th>
                <th className="p-4">Conversion Rate</th>
                <th className="p-4 text-right">Attributed Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channels.map((c) => (
                <tr key={c.channel} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">{c.channel}</td>
                  <td className="p-4 text-slate-600">{c.visitors}</td>
                  <td className="p-4 text-slate-600">{c.bounce}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      {c.conversion}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">{c.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
