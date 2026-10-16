import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Layers,
  Search,
  Pencil,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";

import {
  getCollections,
  deleteCollection,
} from "../../services/collectionService";
import { getImageUrl } from "../../services/api";

export default function Collections() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCollections();

      setCollections(
        Array.isArray(response)
          ? response
          : response.collections || response.data?.collections || []
      );
    } catch (err) {
      setError(err.message || "Unable to load collections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) {
      return;
    }

    try {
      setError("");
      await deleteCollection(id);

      setCollections((current) =>
        current.filter((item) => item._id !== id)
      );

      setMessage("Collection deleted successfully.");
      window.setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Unable to delete collection.");
    }
  };

  const filteredCollections = collections.filter((item) => {
    const query = search.toLowerCase();

    return (
      (item.title || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query) ||
      (item.handle || "").toLowerCase().includes(query)
    );
  });

  return (
    <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-indigo-600">
            <Layers size={17} />
            <span className="font-semibold">Catalog management</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Collections
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organize your products into collections for your store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/collections/new")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create collection
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total collections</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {collections.length}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Layers size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Collections shown</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {filteredCollections.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Based on your current search
          </p>
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadCollections}
            className="inline-flex items-center gap-2 font-semibold"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Search and refresh */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description or handle..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <button
          type="button"
          onClick={loadCollections}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Collections table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            All collections
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Manage collection details and settings.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading collections...
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
              <Layers size={32} />
            </div>

            <h3 className="font-semibold text-slate-800">
              {search ? "No matching collections" : "No collections yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {search
                ? "Try another search term."
                : "Create your first collection to start organizing your products."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() => navigate("/admin/collections/new")}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create collection
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Collection</th>
                  <th className="px-5 py-4 font-semibold">Handle</th>
                  <th className="px-5 py-4 font-semibold">Template</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCollections.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image?.url ? (
                          <img
                            src={getImageUrl(item.image.url)}
                            alt={item.image.altText || item.title}
                            className="h-12 w-12 rounded-xl border border-slate-200 object-cover bg-slate-100"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: item.image?.url ? "none" : "flex" }}
                          className="h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 shrink-0"
                        >
                          <Layers size={21} />
                        </div>

                        <div className="max-w-xs">
                          <p className="font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {item.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.handle || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.themeTemplate || "Default collection"}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/collections/${item._id}/edit`)
                          }
                          title="Edit collection"
                          aria-label={`Edit ${item.title}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          title="Delete collection"
                          aria-label={`Delete ${item.title}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}