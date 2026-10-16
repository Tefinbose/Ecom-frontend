import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { getCustomers, deleteCustomer } from "../../services/customerService";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch all customers from live backend
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      const list = res?.users || (Array.isArray(res) ? res : []);
      setCustomers(list);
    } catch (err) {
      console.error("Fetch customers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle customer deletion
  const handleDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete._id);
      setCustomers((prev) => prev.filter((c) => c._id !== customerToDelete._id));
      setFeedback({
        type: "success",
        message: `Customer "${customerToDelete.name || customerToDelete.email}" deleted successfully.`,
      });
      setCustomerToDelete(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete customer.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter customers by search term and status
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.isActive !== false) ||
      (statusFilter === "inactive" && c.isActive === false);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            View registered user profiles, status, and manage account access.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
          Refresh
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Total Accounts</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Active Customers</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {customers.filter((c) => c.isActive !== false).length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500 font-semibold">Inactive</p>
          <p className="mt-2 text-2xl font-bold text-slate-400">
            {customers.filter((c) => c.isActive === false).length}
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input
            className="w-full text-sm outline-none bg-transparent"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
          {["all", "active", "inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                statusFilter === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-500">
                  <RefreshCw size={24} className="mx-auto animate-spin text-indigo-600 mb-2" />
                  <p className="text-xs">Loading customers...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">
                  <Users size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600 text-sm">No customers found</p>
                  <p className="text-xs mt-1">Try another search or register new accounts.</p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const isActive = c.isActive !== false;
                const initials = (c.name || c.email || "C").slice(0, 2).toUpperCase();

                return (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{c.name || "Customer"}</p>
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail size={11} /> {c.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-xs text-slate-600">
                      {c.phone ? (
                        <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
                        {c.role || "customer"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setCustomerToDelete(c)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
              <button onClick={() => setCustomerToDelete(null)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Are you sure you want to delete customer{" "}
              <strong>{customerToDelete.name || customerToDelete.email}</strong>?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
