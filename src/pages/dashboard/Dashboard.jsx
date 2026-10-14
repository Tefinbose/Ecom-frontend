
import { useState } from "react";
import {
  LayoutDashboard, Package, Layers, ShoppingCart, Users,
  Boxes, Tag, FileText, BarChart3, Settings, Search,
  Bell, Menu, X, ChevronDown, ArrowUpRight, ArrowDownRight,
  CircleDollarSign, TrendingUp, Plus, MoreHorizontal,
  Download, Clock, CheckCircle2, Truck
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from "recharts";


const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Products", icon: Package },
  { label: "Categories", icon: Layers },
  { label: "Orders", icon: ShoppingCart },
  { label: "Customers", icon: Users },
  { label: "Inventory", icon: Boxes },
  { label: "Discounts", icon: Tag },
  { label: "Content", icon: FileText },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

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
  { id: "#ORD-1042", customer: "Sarah Wilson", date: "Oct 14, 2026", amount: "$129.00", status: "Processing" },
  { id: "#ORD-1041", customer: "Mike Johnson", date: "Oct 14, 2026", amount: "$89.00", status: "Shipped" },
  { id: "#ORD-1040", customer: "Emily Davis", date: "Oct 13, 2026", amount: "$245.00", status: "Delivered" },
  { id: "#ORD-1039", customer: "Chris Brown", date: "Oct 13, 2026", amount: "$67.00", status: "Pending" },
  { id: "#ORD-1038", customer: "Jessica Lee", date: "Oct 12, 2026", amount: "$180.00", status: "Delivered" },
];

const products = [
  { name: "Classic White Tee", category: "Clothing", price: "$29.99", stock: 120, color: "white" },
  { name: "Denim Jacket", category: "Clothing", price: "$89.99", stock: 45, color: "blue" },
  { name: "Running Shoes", category: "Footwear", price: "$79.99", stock: 12, color: "gray" },
  { name: "Everyday Backpack", category: "Accessories", price: "$49.99", stock: 8, color: "sand" },
];

function Sidebar({ active, setActive, open, close }) {
  return (
    <>
      {open && <button aria-label="Close menu overlay" className="sidebar-overlay" onClick={close} />}
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
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => { setActive(label); close(); }}
              className={`nav-link ${active === label ? "nav-active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Orders" && <span className="nav-count">5</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <div>
              <strong>Need help?</strong>
              <p>Visit our help center</p>
            </div>
          </div>
          <div className="admin-profile">
            <div className="avatar">A</div>
            <div className="admin-details">
              <strong>Admin User</strong>
              <span>Store Administrator</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ active, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation">
          <Menu size={22} />
        </button>
        <div className="breadcrumb">Store / <strong>{active}</strong></div>
      </div>

      <div className="topbar-actions">
        <label className="global-search">
          <Search size={17} />
          <input placeholder="Search anything..." aria-label="Search" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button notification-button" aria-label="Notifications">
          <Bell size={19} />
          <span />
        </button>
        <div className="topbar-avatar">A</div>
        <div className="topbar-user">
          <strong>Admin User</strong>
          <span>Administrator</span>
        </div>
        <ChevronDown size={15} className="user-chevron" />
      </div>
    </header>
  );
}

function StatCard({ title, value, change, positive, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
        <button className="icon-button muted-icon" aria-label={`${title} options`}>
          <MoreHorizontal size={20} />
        </button>
      </div>
      <p className="stat-title">{title}</p>
      <h2>{value}</h2>
      <div className={`stat-change ${positive ? "positive" : "negative"}`}>
        {positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
        <strong>{change}</strong>
        <span>vs last month</span>
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
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#929bad", fontSize: 12 }} dy={10} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#929bad", fontSize: 11 }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Sales"]} />
          <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge status-${className}`}>{status}</span>;
}

function Dashboard() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>Here's what's happening with your store today.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary"><Download size={16} /> Export</button>
          <button className="button button-primary"><Plus size={17} /> Add product</button>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard title="Total Revenue" value="$24,580" change="12.8%" positive icon={CircleDollarSign} tone="blue" />
        <StatCard title="Total Orders" value="1,248" change="8.2%" positive icon={ShoppingCart} tone="purple" />
        <StatCard title="Total Customers" value="8,549" change="14.5%" positive icon={Users} tone="green" />
        <StatCard title="Total Products" value="186" change="2.4%" positive icon={Package} tone="orange" />
      </section>

      <section className="main-grid">
        <article className="panel sales-panel">
          <div className="panel-heading">
            <div>
              <h3>Sales overview</h3>
              <p>Track your store performance</p>
            </div>
            <select defaultValue="7" aria-label="Sales period" className="period-select">
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
            <div>
              <h3>Recent orders</h3>
              <p>Latest customer purchases</p>
            </div>
            <button className="text-link">View all <ArrowUpRight size={15} /></button>
          </div>
          <div className="order-list">
            {orders.slice(0, 4).map((order) => (
              <div className="order-item" key={order.id}>
                <div className="order-icon"><ShoppingCart size={17} /></div>
                <div className="order-info">
                  <strong>{order.id}</strong>
                  <span>{order.customer}</span>
                </div>
                <div className="order-right">
                  <strong>{order.amount}</strong>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel product-panel">
        <div className="panel-heading">
          <div>
            <h3>Top selling products</h3>
            <p>Products performing best in your store</p>
          </div>
          <button className="text-link">View all <ArrowUpRight size={15} /></button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th /></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.name}>
                  <td>
                    <div className="product-name">
                      <div className={`product-placeholder product-${product.color}`}>
                        <Package size={19} />
                      </div>
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td className="table-price">{product.price}</td>
                  <td>{product.stock} units</td>
                  <td>
                    <StatusBadge status={product.stock <= 10 ? "Low stock" : "Active"} />
                  </td>
                  <td><button className="icon-button" aria-label={`More actions for ${product.name}`}><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bottom-grid">
        <article className="panel mini-panel">
          <div className="mini-icon green"><CheckCircle2 size={21} /></div>
          <div><span>Fulfilled orders</span><strong>856</strong><p>68.5% of all orders</p></div>
        </article>
        <article className="panel mini-panel">
          <div className="mini-icon orange"><Clock size={21} /></div>
          <div><span>Pending orders</span><strong>24</strong><p>Needs your attention</p></div>
        </article>
        <article className="panel mini-panel">
          <div className="mini-icon blue"><Truck size={21} /></div>
          <div><span>Orders in transit</span><strong>128</strong><p>Currently shipping</p></div>
        </article>
      </section>

      <footer className="footer">
        <span>© 2026 StoreAdmin</span>
        <span>Built for better store management</span>
      </footer>
    </>
  );
}

function PlaceholderPage({ active }) {
  const item = navigation.find((nav) => nav.label === active);
  const Icon = item?.icon || Package;

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
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
      />
      <div className="workspace">
        <Header active={active} onMenu={() => setSidebarOpen(true)} />
        <main className="main-content">
          {active === "Dashboard" ? <Dashboard /> : <PlaceholderPage active={active} />}
        </main>
      </div>
    </div>
  );
}
