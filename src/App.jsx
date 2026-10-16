import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import Analytics from "./pages/analytics/Analytics";

import AddProduct from "./pages/products/AddProduct";
import ProductForm from "./pages/products/ProductForm";

import Collections from "./pages/collections/Collections";
import CollectionForm from "./pages/collections/CollectionForm";

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
        {/* Authentication */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />

        {/* Protected Admin Dashboard */}
        <Route path="/admin" element={<ProtectedAdmin />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />

          {/* Products */}
          <Route path="products" element={<AddProduct />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />

          {/* Collections */}
          <Route path="collections" element={<Collections />} />
          <Route path="collections/new" element={<CollectionForm />} />
          <Route path="collections/:id/edit" element={<CollectionForm />} />

          {/* Other Admin Pages */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
