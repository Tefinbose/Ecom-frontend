
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Layers, ShoppingCart, Users, Boxes, Tag,
  FileText, BarChart3, Settings, Search, Bell, Menu, X, ChevronDown,
  ArrowUpRight, ArrowDownRight, CircleDollarSign, Plus, MoreHorizontal,
  Download, Clock, CheckCircle2, Truck, LogOut
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";
import "./Dashboard.css";

const navigation = [
  ["Dashboard", LayoutDashboard],
  ["Products", Package],
  ["Categories", Layers],
  ["Orders", ShoppingCart],
  ["Customers", Users],
  ["Inventory", Boxes],
  ["Discounts", Tag],
  ["Content", FileText],
  ["Analytics", BarChart3],
  ["Settings", Settings],
];

const routeMap = Object.fromEntries(
  navigation.map(([name]) => [
    name,
    name === "Dashboard" ? "/dashboard" : `/dashboard/${name.toLowerCase()}`
  ])
);

const salesData = [
  { day: "Mon", sales: 3200 }, { day: "Tue", sales: 4100 },
  { day: "Wed", sales: 3600 }, { day: "Thu", sales: 5200 },
  { day: "Fri", sales: 4700 }, { day: "Sat", sales: 6500 },
  { day: "Sun", sales: 7200 },
];

const orders = [
  ["#ORD-1042", "Sarah Wilson", "$129.00", "Processing"],
  ["#ORD-1041", "Mike Johnson", "$89.00", "Shipped"],
  ["#ORD-1040", "Emily Davis", "$245.00", "Delivered"],
  ["#ORD-1039", "Chris Brown", "$67.00", "Pending"],
];

const products = [
  ["Classic White Tee", "Clothing", "$29.99", 120, "white"],
  ["Denim Jacket", "Clothing", "$89.99", 45, "blue"],
  ["Running Shoes", "Footwear", "$79.99", 12, "gray"],
  ["Everyday Backpack", "Accessories", "$49.99", 8, "sand"],
];

function Status({ value }) {
  return (
    <span className={`status-badge status-${value.toLowerCase().replace(/\s+/g, "-")}`}>
      {value}
    </span>
  );
}

function Sidebar({ active, open, close, logout }) {
  const navigate = useNavigate();

  return (
    <>
      {open && <button className="sidebar-overlay" onClick={close} aria-label="Close menu" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Package size={23} /></div>
          <span>Store<span className="brand-accent">Admin</span></span>
          <button className="icon-button sidebar-close" onClick={close} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <div className="store-label">STORE MANAGEMENT</div>
        <nav className="navigation">
          {navigation.map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-link ${active === label ? "nav-active" : ""}`}
              onClick={() => { navigate(routeMap[label]); close(); }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Orders" && <span className="nav-count">5</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <div><strong>Need help?</strong><p>Visit our help center</p></div>
          </div>

          <div className="admin-profile">
            <div className="avatar">A</div>
            <div className="admin-details">
              <strong>Admin User</strong><span>Store Administrator</span>
            </div>
            <ChevronDown size={16} />
          </div>

          <button className="logout-button" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({ active, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="breadcrumb">Store / <strong>{active}</strong></div>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <Search size={17} />
          <input placeholder="Search anything..." aria-label="Search" />
        </label>
        <button className="icon-button notification-button" aria-label="Notifications">
          <Bell size={19} /><span />
        </button>
        <div className="topbar-avatar">A</div>
        <div className="topbar-user"><strong>Admin User</strong><span>Administrator</span></div>
        <ChevronDown size={15} className="user-chevron" />
      </div>
    </header>
  );
}

function StatCard({ title, value, change, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
        <MoreHorizontal size={20} />
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
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesData} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#635bff" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#929bad", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#929bad", fontSize: 11 }} tickFormatter={v => `$${v / 1000}k`} />
          <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, "Sales"]} />
          <Area type="monotone" dataKey="sales" stroke="#635bff" strokeWidth={2.5} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DashboardHome() {
  const stats = [
    ["Total Revenue", "$24,580", "12.8%", CircleDollarSign, "blue"],
    ["Total Orders", "1,248", "8.2%", ShoppingCart, "purple"],
    ["Total Customers", "8,549", "14.5%", Users, "green"],
    ["Total Products", "186", "2.4%", Package, "orange"],
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>Here's what's happening with your store today.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary" onClick={() => window.print()}>
            <Download size={16} /> Export
          </button>
          <button className="button button-primary" onClick={() => window.location.href = "/dashboard/products"}>
            <Plus size={17} /> Add product
          </button>
        </div>
      </div>

      <section className="stats-grid">
        {stats.map(([title, value, change, icon, tone]) =>
          <StatCard key={title} {...{ title, value, change, tone }} icon={icon} />
        )}
      </section>

      <section className="main-grid">
        <article className="panel sales-panel">
          <div className="panel-heading">
            <div><h3>Sales overview</h3><p>Track your store performance</p></div>
            <select className="period-select" defaultValue="7" aria-label="Sales period">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="sales-total">$24,580.00 <span>+12.8%</span></div>
          <SalesChart />
        </article>

        <article className="panel orders-panel">
          <div className="panel-heading">
            <div><h3>Recent orders</h3><p>Latest customer purchases</p></div>
          </div>
          <div className="order-list">
            {orders.map(([id, customer, amount, status]) => (
              <div className="order-item" key={id}>
                <div className="order-icon"><ShoppingCart size={17} /></div>
                <div className="order-info"><strong>{id}</strong><span>{customer}</span></div>
                <div className="order-right"><strong>{amount}</strong><Status value={status} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel product-panel">
        <div className="panel-heading">
          <div><h3>Top selling products</h3><p>Products performing best in your store</p></div>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr>
              <th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th />
            </tr></thead>
            <tbody>
              {products.map(([name, category, price, stock, color]) => (
                <tr key={name}>
                  <td><div className="product-name">
                    <div className={`product-placeholder product-${color}`}><Package size={19} /></div>
                    <strong>{name}</strong>
                  </div></td>
                  <td>{category}</td><td className="table-price">{price}</td><td>{stock} units</td>
                  <td><Status value={stock <= 10 ? "Low stock" : "Active"} /></td>
                  <td><button className="icon-button" aria-label={`Options for ${name}`}><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bottom-grid">
        {[
          [CheckCircle2, "Fulfilled orders", "856", "68.5% of all orders", "green"],
          [Clock, "Pending orders", "24", "Needs your attention", "orange"],
          [Truck, "Orders in transit", "128", "Currently shipping", "blue"],
        ].map(([Icon, label, value, note, tone]) => (
          <article className="panel mini-panel" key={label}>
            <div className={`mini-icon ${tone}`}><Icon size={21} /></div>
            <div><span>{label}</span><strong>{value}</strong><p>{note}</p></div>
          </article>
        ))}
      </section>

      <footer className="footer">
        <span>© 2026 StoreAdmin</span><span>Built for better store management</span>
      </footer>
    </>
  );
}

function PlaceholderPage({ active }) {
  const Icon = navigation.find(([name]) => name === active)?.[1] || Package;
  return (
    <div className="empty-state panel">
      <div className="empty-icon"><Icon size={30} /></div>
      <h2>{active}</h2>
      <p>This module is ready for development. Connect its components and API endpoints here.</p>
      <button className="button button-primary" onClick={() => alert(`Build the ${active} module next.`)}>
        <Plus size={16} /> Get started
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = navigation.find(([name]) =>
    name === "Dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(routeMap[name])
  )?.[0] || "Dashboard";

  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("adminData");
    sessionStorage.removeItem("adminData");
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} open={sidebarOpen} close={() => setSidebarOpen(false)} logout={logout} />
      <div className="workspace">
        <Header active={active} onMenu={() => setSidebarOpen(true)} />
        <main className="main-content">
          {active === "Dashboard" ? <DashboardHome /> : <PlaceholderPage active={active} />}
        </main>
      </div>
    </div>
  );
}
