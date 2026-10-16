import { useState } from "react";
import { Plus, Trash2, Layers } from "lucide-react";

const INITIAL_COLLECTIONS = [
  { _id: "col-1", title: "Summer Essentials", description: "Lightweight apparel, breathable linen, and seasonal footwear" },
  { _id: "col-2", title: "Accessories & Bags", description: "Everyday carry backpacks, wallets, belts, and caps" },
  { _id: "col-3", title: "Winter Outerwear", description: "Heavy jackets, wool overcoats, and thermals" },
  { _id: "col-4", title: "Best Sellers", description: "Top trending products curated by customer popularity" }
];

function getStoredCollections() {
  try {
    const raw = localStorage.getItem("empire_mock_collections");
    if (raw) return JSON.parse(raw);
    localStorage.setItem("empire_mock_collections", JSON.stringify(INITIAL_COLLECTIONS));
  } catch {
    // fallback
  }
  return INITIAL_COLLECTIONS;
}

export default function Collections() {
  const [collections, setCollections] = useState(getStoredCollections);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  function addCollection(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const newCol = {
      _id: `col-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || "—",
    };

    const updated = [newCol, ...collections];
    setCollections(updated);
    try {
      localStorage.setItem("empire_mock_collections", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setTitle("");
    setDescription("");
    setMessage("Collection added successfully!");
    setTimeout(() => setMessage(""), 3000);
  }

  function deleteCollection(id) {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;

    const updated = collections.filter((item) => item._id !== id);
    setCollections(updated);
    try {
      localStorage.setItem("empire_mock_collections", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
        <p className="mt-1 text-sm text-slate-500">
          Group products into promotional, seasonal, or catalog categories.
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800 border border-emerald-200">
          {message}
        </p>
      )}

      <form
        onSubmit={addCollection}
        className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800">Create new collection</h2>
        </div>
        <input
          className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
          placeholder="Collection title (e.g. Autumn Warmth)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors sm:col-span-2"
        >
          <Plus size={18} /> Add Collection
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {collections.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <Layers size={36} className="text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No collections created yet</p>
                    <p className="text-xs text-slate-400 mt-1">Use the form above to add your first collection.</p>
                  </div>
                </td>
              </tr>
            ) : (
              collections.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">{item.title || item.name}</td>
                  <td className="p-4 text-slate-600">{item.description || "—"}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteCollection(item._id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Delete collection"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
