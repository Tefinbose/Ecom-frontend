import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, AlertCircle } from "lucide-react";
import {
  getCollectionById,
  createCollection,
  updateCollection,
} from "../../services/collectionService";
import { getImageUrl } from "../../services/api";

export default function CollectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Load existing collection if editing
  useEffect(() => {
    if (!isEdit) return;
    const loadCollection = async () => {
      try {
        const res = await getCollectionById(id);
        const col = res?.collection || res;
        if (col) {
          setTitle(col.title || "");
          setDescription(col.description || "");
          if (col.image) {
            setPreviewUrl(getImageUrl(col.image));
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load collection");
      } finally {
        setFetching(false);
      }
    };
    loadCollection();
  }, [id, isEdit]);

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit collection
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Collection title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEdit) {
        await updateCollection(id, formData);
      } else {
        await createCollection(formData);
      }

      navigate("/admin/collections");
    } catch (err) {
      setError(err.message || "Failed to save collection");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading collection...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/collections"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Collection" : "New Collection"}
            </h1>
            <p className="text-xs text-slate-500">Group related products into a curated category.</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={14} />
          {loading ? "Saving..." : "Save Collection"}
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-700">Collection Title *</label>
          <input
            required
            className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
            placeholder="e.g. Summer Essentials"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Description</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
            placeholder="Write a brief overview of this collection..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Collection Image</label>
          {previewUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              <img src={previewUrl} alt="Collection preview" className="h-44 w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl("");
                }}
                className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <Upload size={22} className="text-slate-400" />
              <span className="mt-1.5 text-xs font-semibold text-indigo-600">Upload Header Image</span>
              <span className="text-[11px] text-slate-400">PNG, JPG up to 5MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>
      </form>
    </div>
  );
}