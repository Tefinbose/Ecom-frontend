import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, Layers, Search, Pencil, RefreshCw, X, CheckCircle, AlertCircle } from "lucide-react";
import { getCollections, deleteCollection } from "../../services/collectionService";
import { getImageUrl } from "../../services/api";

export default function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Load collections
  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await getCollections();
      const list = res?.collections || (Array.isArray(res) ? res : []);
      setCollections(list);
    } catch (err) {
      console.error("Failed to load collections:", err);
      setFeedback({ type: "error", text: err.message || "Failed to load collections" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Delete collection
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCollection(deletingId);
      setCollections((prev) => prev.filter((c) => c._id !== deletingId));
      setFeedback({ type: "success", text: "Collection deleted" });
      setDeletingId(null);
    } catch (err) {
      setFeedback({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  // Filtered collections
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return collections.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [collections, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
          <p className="mt-1 text-sm text-slate-500">Group your products into seasonal lines and departments.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCollections}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-indigo-600" : ""} />
            Refresh
          </button>
          <Link
            to="/admin/collections/new"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={15} /> Create Collection
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400"><X size={14} /></button>
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search size={15} className="text-slate-400" />
        <input
          className="w-full text-sm outline-none bg-transparent"
          placeholder="Search collections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch("")}><X size={14} className="text-slate-400" /></button>}
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            <RefreshCw size={20} className="mx-auto animate-spin text-indigo-600 mb-2" />
            Loading collections...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Layers size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600 text-sm">No collections found</p>
            <p className="text-xs mt-1">Click &quot;Create Collection&quot; to organize your products.</p>
          </div>
        ) : (
          filtered.map((col) => {
            const img = getImageUrl(col.image?.url || col.image);
            return (
              <div
                key={col._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {img ? (
                  <img src={img} alt={col.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-slate-100 text-slate-400">
                    <Layers size={28} />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900">{col.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {col.description || "No description provided."}
                  </p>
                  <div className="mt-4 flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/admin/collections/${col._id}/edit`)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(col._id)}
                      className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900">Delete Collection</h3>
            <p className="mt-2 text-xs text-slate-600">Are you sure you want to delete this collection?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}