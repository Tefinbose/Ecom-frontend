import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, AlertCircle } from "lucide-react";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/productService";
import { getCollections } from "../../services/collectionService";
import { getImageUrl } from "../../services/api";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");
  const [collections, setCollections] = useState([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [vendor, setVendor] = useState("");
  const [stock, setStock] = useState(10);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Load collections & existing product if in edit mode
  useEffect(() => {
    const initData = async () => {
      try {
        const colRes = await getCollections();
        const colList = colRes?.collections || (Array.isArray(colRes) ? colRes : []);
        setCollections(colList);

        if (isEdit) {
          const prodRes = await getProductById(id);
          const p = prodRes?.product || prodRes?.data?.product || prodRes;
          if (p) {
            setTitle(p.title || "");
            setDescription(p.description || "");
            setStatus(p.status || "active");
            setCategory(p.category?._id || p.category || "");
            setPrice(p.unitPrice?.amount || p.price || "");
            setVendor(p.vendor || "");
            setStock(p.variants?.[0]?.inventoryQuantity ?? 10);
            if (p.image || p.media?.[0]?.url) {
              setPreviewUrl(getImageUrl(p.image || p.media?.[0]?.url));
            }
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load product data");
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id, isEdit]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit product create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        category: category || undefined,
        vendor: vendor.trim(),
        unitPrice: { amount: Number(price) || 0 },
        variants: [
          {
            title: "Default Title",
            price: Number(price) || 0,
            inventoryQuantity: Number(stock) || 0,
          },
        ],
      };

      const imagesToUpload = imageFile ? [imageFile] : [];

      if (isEdit) {
        await updateProduct(id, payload, imagesToUpload);
      } else {
        await createProduct(payload, imagesToUpload);
      }

      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-xs text-slate-500">Configure title, pricing, and catalog details.</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={14} />
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Content Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: General & Pricing */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Information Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">General Information</h2>

            <div>
              <label className="text-xs font-semibold text-slate-700">Product Title *</label>
              <input
                required
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                placeholder="e.g. Cotton Crewneck T-Shirt"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                placeholder="Describe your product materials, fit, care instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="1499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Organization & Media */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Organization</h2>

            <div>
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Category / Collection</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a collection...</option>
                {collections.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Vendor / Brand</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-500"
                placeholder="e.g. Empire Apparel"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
          </div>

          {/* Product Image */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Product Image</h2>

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="h-44 w-full object-cover"
                />
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
                <span className="mt-1.5 text-xs font-semibold text-indigo-600">
                  Upload Product Image
                </span>
                <span className="text-[11px] text-slate-400">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}