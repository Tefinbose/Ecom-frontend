import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import Analytics from "./pages/analytics/Analytics";
import AddProduct from "./pages/products/AddProduct";
import ProductForm from "./pages/products/ProductForm";
import Collections from "./pages/collections/Collections";
import Inventory from "./pages/inventory/Inventory";
import Orders from "./pages/orders/Orders";
import Customers from "./pages/customers/Customers.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function ProtectedAdmin() {
  const token =
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

  return token ? <DashboardLayout /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />

        <Route path="/admin" element={<ProtectedAdmin />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="products" element={<AddProduct />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="collections" element={<Collections />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
