import { Link } from "react-router-dom";
import {
  Package, ShoppingCart, Users, CircleDollarSign, Plus, MoreHorizontal,
  Download, Clock, CheckCircle2, Truck, ArrowUpRight
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";
import "./Dashboard.css";

const salesData = [
  { day: "Mon", sales: 3200 },
  { day: "Tue", sales: 4100 },
  { day: "Wed", sales: 3600 },
  { day: "Thu", sales: 5200 },
  { day: "Fri", sales: 4700 },
  { day: "Sat", sales: 6500 },
  { day: "Sun", sales: 7200 },
];

const orders = [
  ["#ORD-1042", "Sarah Wilson", "₹9,850.00", "Processing"],
  ["#ORD-1041", "Mike Johnson", "₹6,800.00", "Shipped"],
  ["#ORD-1040", "Emily Davis", "₹18,500.00", "Delivered"],
  ["#ORD-1039", "Chris Brown", "₹5,100.00", "Pending"],
];

const topProducts = [
  ["Classic White Tee", "Clothing", "₹2,499.00", 120, "white"],
  ["Denim Jacket", "Clothing", "₹7,499.00", 45, "blue"],
  ["Running Shoes", "Footwear", "₹6,599.00", 12, "gray"],
  ["Everyday Backpack", "Accessories", "₹4,199.00", 8, "sand"],
];

function Status({ value }) {
  return (
    <span className={`status-badge status-${value.toLowerCase().replace(/\s+/g, "-")}`}>
      {value}
    </span>
  );
}

function StatCard({ title, value, change, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
        <MoreHorizontal size={20} className="text-slate-400" />
      </div>
      <p className="stat-title">{title}</p>
      <h2>{value}</h2>
      <div className="stat-change positive">
        <ArrowUpRight size={15} /><strong>{change}</strong><span>vs last month</span>
      </div>
    </article>
  );
}

function SalesChart() {
  return (
    <div className="chart-wrap" style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#635bff" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#635bff" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#edf0f5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#929bad", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#929bad", fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Sales"]} />
          <Area type="monotone" dataKey="sales" stroke="#635bff" strokeWidth={2.5} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const stats = [
    ["Total Revenue", "₹1,84,580", "+12.8%", CircleDollarSign, "blue"],
    ["Total Orders", "1,248", "+8.2%", ShoppingCart, "purple"],
    ["Total Customers", "8,549", "+14.5%", Users, "green"],
    ["Active Products", "186", "+2.4%", Package, "orange"],
  ];

  return (
    <div className="space-y-6">
      <div className="page-heading flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow text-xs font-bold tracking-wider text-indigo-600 uppercase">OVERVIEW</div>
          <h1 className="text-2xl font-bold text-slate-900">Store Dashboard</h1>
          <p className="text-sm text-slate-500">Here is what is happening across your store today.</p>
        </div>
        <div className="heading-actions flex items-center gap-3">
          <button
            type="button"
            className="button button-secondary flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            onClick={() => window.print()}
          >
            <Download size={16} /> Export
          </button>
          <Link
            to="/admin/products/new"
            className="button button-primary flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={17} /> Add Product
          </Link>
        </div>
      </div>

      <section className="stats-grid">
        {stats.map(([title, value, change, icon, tone]) => (
          <StatCard key={title} {...{ title, value, change, tone }} icon={icon} />
        ))}
      </section>

      <section className="main-grid">
        <article className="panel sales-panel">
          <div className="panel-heading">
            <div>
              <h3>Sales Overview</h3>
              <p>Revenue trends for the selected period</p>
            </div>
            <select className="period-select" defaultValue="7" aria-label="Sales period">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="sales-total">₹1,84,580.00 <span>+12.8%</span></div>
          <SalesChart />
        </article>

        <article className="panel orders-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Orders</h3>
              <p>Latest customer transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="order-list">
            {orders.map(([id, customer, amount, status]) => (
              <div className="order-item" key={id}>
                <div className="order-icon"><ShoppingCart size={17} /></div>
                <div className="order-info">
                  <strong>{id}</strong>
                  <span>{customer}</span>
                </div>
                <div className="order-right">
                  <strong>{amount}</strong>
                  <Status value={status} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel product-panel">
        <div className="panel-heading">
          <div>
            <h3>Top Performing Products</h3>
            <p>Products with highest sales velocity this month</p>
          </div>
          <Link to="/admin/products" className="text-xs font-semibold text-indigo-600 hover:underline">
            Manage catalogue
          </Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map(([name, category, price, stock, color]) => (
                <tr key={name}>
                  <td>
                    <div className="product-name">
                      <div className={`product-placeholder product-${color}`}><Package size={18} /></div>
                      <strong>{name}</strong>
                    </div>
                  </td>
                  <td>{category}</td>
                  <td className="table-price">{price}</td>
                  <td>{stock} units</td>
                  <td><Status value={stock <= 10 ? "Low stock" : "Active"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bottom-grid">
        {[
          [CheckCircle2, "Fulfilled orders", "856", "68.5% of total orders", "green"],
          [Clock, "Pending dispatch", "24", "Requires warehouse packaging", "orange"],
          [Truck, "In transit", "128", "Dispatched to carrier partners", "blue"],
        ].map(([Icon, label, value, note, tone]) => (
          <article className="panel mini-panel" key={label}>
            <div className={`mini-icon ${tone}`}><Icon size={21} /></div>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{note}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
