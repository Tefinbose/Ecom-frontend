import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Package,
  Images,
  Tags,
  Warehouse,
  Truck,
  Search,
  Settings2,
  Plus,
  Trash2,
  Upload,
  X,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Globe,
  LoaderCircle,
  HelpCircle,
  Code,
} from "lucide-react";

import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/productService";
import { getCollections } from "../../services/collectionService";
import { getImageUrl } from "../../services/api";

const EMPTY_PRODUCT = {
  title: "",
  description: "",
  status: "draft",
  handle: "",
  category: "",
  productType: "",
  vendor: "",
  Collection: [],
  tags: [],
  themeTemplate: "Default Product",
  image: "",
  media: [],
  unitPrice: { amount: null, measurementUnit: "" },
  inventoryTracked: true,
  inventoryLocations: [],
  hasVariants: false,
  options: [],
  variants: [],
  isPhysicalProduct: true,
  packageType: "Store default",
  packageDimensions: {
    length: 0,
    width: 0,
    height: 0,
    unit: "cm",
  },
  countryOfOrigin: "",
  hsCode: "",
  publishing: {
    allChannels: true,
    salesChannels: ["Online Store"],
    publishedAt: null,
  },
  seo: {
    pageTitle: "",
    metaDescription: "",
    urlHandle: "",
  },
  metafields: [],
  isGiftCard: false,
  publishedAt: null,
};

const SECTIONS = [
  { id: "general", label: "General", icon: Package },
  { id: "media", label: "Media & Images", icon: Images },
  { id: "pricing", label: "Pricing & Variants", icon: Tags },
  { id: "inventory", label: "Inventory", icon: Warehouse },
  { id: "shipping", label: "Shipping & Origin", icon: Truck },
  { id: "publishing", label: "Publishing & SEO", icon: Search },
  { id: "advanced", label: "Advanced", icon: Settings2 },
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const labelClass = "block text-sm font-semibold text-slate-700";

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function TextInput({ label, required, value, onChange, hint, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <input
        {...props}
        className={inputClass}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function JsonTextarea({ label, value, onChange, hint }) {
  const [text, setText] = useState(JSON.stringify(value ?? [], null, 2));
  const [jsonErr, setJsonErr] = useState("");

  useEffect(() => {
    setText(JSON.stringify(value ?? [], null, 2));
  }, [value]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      onChange(parsed);
      setJsonErr("");
    } catch {
      setJsonErr("Invalid JSON format. Please verify syntax.");
    }
  };

  return (
    <Field label={label} hint={hint}>
      <textarea
        className={`${inputClass} min-h-32 font-mono text-xs`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        spellCheck={false}
      />
      {jsonErr && <p className="mt-1 text-xs text-red-600">{jsonErr}</p>}
    </Field>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Store collections for visual selector
  const [allCollections, setAllCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // New image files selected by the user for upload
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Load available collections for selection
  useEffect(() => {
    const fetchCollectionsList = async () => {
      try {
        setLoadingCollections(true);
        const res = await getCollections();
        const list = Array.isArray(res)
          ? res
          : res.collections || res.data?.collections || [];
        setAllCollections(list);
      } catch {
        // Silently continue if collections cannot be fetched
      } finally {
        setLoadingCollections(false);
      }
    };
    fetchCollectionsList();
  }, []);

  // Load product if editing
  useEffect(() => {
    if (!editing) return;

    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const response = await getProductById(id);
        // Backend returns { message: "...", product: {...} }
        const productData = response.product || response.data?.product || response;

        if (!cancelled && productData) {
          // Normalize collections IDs: could be array of strings or ObjectIds
          const normalizedCollections = Array.isArray(productData.Collection)
            ? productData.Collection.map((c) => (typeof c === "object" && c?._id ? c._id : String(c)))
            : [];

          setProduct({
            ...EMPTY_PRODUCT,
            ...productData,
            Collection: normalizedCollections,
            unitPrice: {
              ...EMPTY_PRODUCT.unitPrice,
              ...(productData.unitPrice || {}),
            },
            packageDimensions: {
              ...EMPTY_PRODUCT.packageDimensions,
              ...(productData.packageDimensions || {}),
            },
            publishing: {
              ...EMPTY_PRODUCT.publishing,
              ...(productData.publishing || {}),
            },
            seo: {
              ...EMPTY_PRODUCT.seo,
              ...(productData.seo || {}),
            },
            options: Array.isArray(productData.options) ? productData.options : [],
            variants: Array.isArray(productData.variants) ? productData.variants : [],
            inventoryLocations: Array.isArray(productData.inventoryLocations)
              ? productData.inventoryLocations
              : [],
            media: Array.isArray(productData.media) ? productData.media : [],
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load product details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id, editing]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreviews]);

  function setField(name, value) {
    setProduct((current) => ({ ...current, [name]: value }));
  }

  function setNested(group, name, value) {
    setProduct((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [name]: value,
      },
    }));
  }

  function handleTitleChange(value) {
    setProduct((current) => ({
      ...current,
      title: value,
      handle:
        current.handle ||
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      seo: {
        ...current.seo,
        pageTitle: current.seo?.pageTitle || value,
        urlHandle: current.seo?.urlHandle || value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      },
    }));
  }

  // Handle image files selection
  function handleImageFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length < files.length) {
      setError("Some selected files were skipped because they are not valid images.");
    }

    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  }

  function removeNewImage(index) {
    const removed = imagePreviews[index];
    if (removed && removed.url.startsWith("blob:")) {
      URL.revokeObjectURL(removed.url);
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Toggle collection selection
  function toggleCollection(collectionId) {
    setProduct((curr) => {
      const exists = curr.Collection.includes(collectionId);
      const nextCollections = exists
        ? curr.Collection.filter((id) => id !== collectionId)
        : [...curr.Collection, collectionId];
      return { ...curr, Collection: nextCollections };
    });
  }

  // Variant helpers
  function addVariant() {
    const newVariant = {
      title: "New Variant",
      price: product.unitPrice?.amount || 0,
      compareAtPrice: null,
      costPerItem: 0,
      sku: "",
      barcode: "",
      inventoryQuantity: 10,
      inventoryTracked: true,
      continueSellingOutOfStock: false,
      requiresShipping: true,
      chargeTax: true,
      weight: 0,
      weightUnit: "kg",
      image: "",
      position: (product.variants?.length || 0) + 1,
      selectedOptions: [],
    };
    setProduct((curr) => ({
      ...curr,
      hasVariants: true,
      variants: [...(curr.variants || []), newVariant],
    }));
  }

  function updateVariantField(index, field, value) {
    setProduct((curr) => {
      const updated = [...(curr.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...curr, variants: updated };
    });
  }

  function removeVariant(index) {
    setProduct((curr) => {
      const updated = curr.variants.filter((_, i) => i !== index);
      return {
        ...curr,
        variants: updated,
        hasVariants: updated.length > 0,
      };
    });
  }

  // Inventory locations helpers
  function addInventoryLocation() {
    const newLoc = {
      locationName: "Main Warehouse",
      quantity: 10,
      available: 10,
      onHand: 10,
      committed: 0,
      incoming: 0,
    };
    setProduct((curr) => ({
      ...curr,
      inventoryLocations: [...(curr.inventoryLocations || []), newLoc],
    }));
  }

  function updateLocationField(index, field, value) {
    setProduct((curr) => {
      const updated = [...(curr.inventoryLocations || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...curr, inventoryLocations: updated };
    });
  }

  function removeInventoryLocation(index) {
    setProduct((curr) => ({
      ...curr,
      inventoryLocations: curr.inventoryLocations.filter((_, i) => i !== index),
    }));
  }

  // Submit Handler
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!product.title.trim()) {
      setError("Product title is required.");
      setActiveSection("general");
      setSaving(false);
      return;
    }

    // Prepare tags
    const normalizedTags = Array.isArray(product.tags)
      ? product.tags
      : String(product.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    // Prepare clean payload
    const payload = {
      ...product,
      title: product.title.trim(),
      handle:
        product.handle?.trim() ||
        product.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-"),
      tags: normalizedTags,
      unitPrice: {
        amount:
          product.unitPrice?.amount != null && product.unitPrice?.amount !== ""
            ? Number(product.unitPrice.amount)
            : null,
        measurementUnit: product.unitPrice?.measurementUnit || "",
      },
      packageDimensions: {
        length: Number(product.packageDimensions?.length) || 0,
        width: Number(product.packageDimensions?.width) || 0,
        height: Number(product.packageDimensions?.height) || 0,
        unit: product.packageDimensions?.unit || "cm",
      },
    };

    try {
      if (editing) {
        await updateProduct(id, payload, imageFiles);
      } else {
        await createProduct(payload, imageFiles);
      }

      navigate("/admin/products", {
        state: {
          message: editing
            ? "Product updated successfully."
            : "Product created successfully.",
        },
      });
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 p-8 text-slate-500">
        <LoaderCircle size={28} className="animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading product details...</p>
      </div>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <Field label="Product Title" required hint="The name shown to customers on your storefront.">
              <input
                className={inputClass}
                value={product.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Premium Cotton Crewneck T-Shirt"
                required
              />
            </Field>

            <Field label="Description" hint="Describe key features, sizing notes, or product highlights.">
              <textarea
                className={`${inputClass} min-h-36 resize-y`}
                value={product.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Write a compelling description for this product..."
                rows={5}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Store Status">
                <select
                  className={inputClass}
                  value={product.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="active">Active (Visible in store)</option>
                  <option value="draft">Draft (Admin only)</option>
                  <option value="archived">Archived (Hidden from catalog)</option>
                  <option value="unlisted">Unlisted (Available via direct link)</option>
                </select>
              </Field>

              <TextInput
                label="URL Handle (Slug)"
                value={product.handle}
                onChange={(v) => setField("handle", v)}
                placeholder="premium-cotton-crewneck"
                hint="Used to generate the product URL."
              />

              <TextInput
                label="Category"
                value={product.category}
                onChange={(v) => setField("category", v)}
                placeholder="Apparel > Menswear > Tops"
              />

              <TextInput
                label="Product Type"
                value={product.productType}
                onChange={(v) => setField("productType", v)}
                placeholder="e.g. T-Shirt, Footwear, Accessory"
              />

              <TextInput
                label="Vendor / Brand"
                value={product.vendor}
                onChange={(v) => setField("vendor", v)}
                placeholder="e.g. Empire Basics"
              />

              <Field label="Theme Template">
                <select
                  className={inputClass}
                  value={product.themeTemplate}
                  onChange={(e) => setField("themeTemplate", e.target.value)}
                >
                  <option value="Default Product">Default Product</option>
                  <option value="Featured Product">Featured Product</option>
                  <option value="Pre-order Product">Pre-order Product</option>
                  <option value="Digital Download">Digital Download</option>
                </select>
              </Field>
            </div>

            <Field label="Tags" hint="Separate tags with commas (e.g. summer, cotton, bestselling).">
              <input
                className={inputClass}
                value={
                  Array.isArray(product.tags) ? product.tags.join(", ") : product.tags
                }
                onChange={(e) =>
                  setField(
                    "tags",
                    e.target.value.split(",").map((v) => v.trim())
                  )
                }
                placeholder="organic, casual, new-release"
              />
            </Field>

            {/* Collection Visual Selector */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Layers size={16} className="text-indigo-600" />
                    Assign to Collections
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select which collections should display this product.
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {product.Collection.length} selected
                </span>
              </div>

              {loadingCollections ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
                  <LoaderCircle size={14} className="animate-spin" /> Loading collections...
                </div>
              ) : allCollections.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  No collections created yet. You can create collections in the Collections tab.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {allCollections.map((col) => {
                    const isSelected = product.Collection.includes(col._id);
                    return (
                      <button
                        type="button"
                        key={col._id}
                        onClick={() => toggleCollection(col._id)}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-medium transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={12} />}
                        </div>
                        <span className="truncate">{col.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case "media":
        return (
          <div className="space-y-6">
            {/* File Upload Box */}
            <div>
              <label className={labelClass}>Upload Images</label>
              <p className="mb-3 text-xs text-slate-400">
                Upload image files from your computer to be stored on the server.
              </p>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30">
                <div className="mb-3 rounded-2xl bg-white p-3.5 text-indigo-600 shadow-sm border border-slate-100">
                  <Upload size={24} />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  Click to select images or drag and drop
                </span>
                <span className="mt-1 text-xs text-slate-400">
                  Supports PNG, JPG, WEBP, GIF (Multiple files allowed)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFiles}
                />
              </label>
            </div>

            {/* New Images Queue */}
            {imagePreviews.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  New files to upload ({imagePreviews.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                    >
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute right-1.5 top-1.5 rounded-lg bg-slate-900/70 p-1 text-white hover:bg-red-600 transition"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                      <p className="truncate p-1.5 text-[11px] text-slate-600 font-medium">
                        {preview.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Media Gallery */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Existing Media Gallery
              </h4>

              {product.media && product.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.media.map((item, idx) => {
                    const resolved = getImageUrl(item.url);
                    return (
                      <div
                        key={idx}
                        className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                      >
                        <img
                          src={resolved}
                          alt={item.altText || `Media ${idx + 1}`}
                          className="h-28 w-full object-cover bg-slate-100"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="p-2 text-[11px]">
                          <span className="font-semibold text-slate-700">
                            Position #{item.position || idx + 1}
                          </span>
                          {item.altText && (
                            <p className="truncate text-slate-400 mt-0.5">
                              {item.altText}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No media currently attached to this product.
                </p>
              )}
            </div>

            {/* Primary Image URL Fallback */}
            <TextInput
              label="Primary Image URL (Direct link override)"
              value={product.image}
              onChange={(v) => setField("image", v)}
              placeholder="https://example.com/image.jpg"
              hint="If you already host images on a CDN or cloud storage, enter the direct URL here."
            />
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-6">
            {/* Base Unit Price */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Base Unit Price ($)" hint="Standard retail selling price before taxes.">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`${inputClass} pl-8`}
                    value={product.unitPrice?.amount ?? ""}
                    onChange={(e) =>
                      setNested(
                        "unitPrice",
                        "amount",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    placeholder="0.00"
                  />
                </div>
              </Field>

              <TextInput
                label="Measurement Unit"
                value={product.unitPrice?.measurementUnit}
                onChange={(v) => setNested("unitPrice", "measurementUnit", v)}
                placeholder="e.g. piece, kg, box, pair"
                hint="e.g. 'each', 'pack of 3', 'kg'."
              />
            </div>

            {/* Variants Toggle */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Product Variants
                  </h4>
                  <p className="text-xs text-slate-500">
                    Does this product have multiple options like different sizes or colors?
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={product.hasVariants}
                    onChange={(e) => setField("hasVariants", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Variants Builder */}
              {product.hasVariants && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      Variant List ({product.variants?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
                    >
                      <Plus size={14} /> Add Variant
                    </button>
                  </div>

                  {product.variants?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No variants added yet. Click &ldquo;Add Variant&rdquo; to create options.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {product.variants.map((variant, vIdx) => (
                        <div
                          key={vIdx}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-700">
                              Variant #{vIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeVariant(vIdx)}
                              className="text-slate-400 hover:text-red-600 transition"
                              title="Delete variant"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-600">
                                Title / Options
                              </label>
                              <input
                                className={inputClass}
                                value={variant.title}
                                onChange={(e) =>
                                  updateVariantField(vIdx, "title", e.target.value)
                                }
                                placeholder="e.g. Large / Blue"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-600">
                                Price ($)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                className={inputClass}
                                value={variant.price}
                                onChange={(e) =>
                                  updateVariantField(
                                    vIdx,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-600">
                                SKU Code
                              </label>
                              <input
                                className={inputClass}
                                value={variant.sku || ""}
                                onChange={(e) =>
                                  updateVariantField(vIdx, "sku", e.target.value)
                                }
                                placeholder="TSH-BLU-L"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-600">
                                Inventory Qty
                              </label>
                              <input
                                type="number"
                                min="0"
                                className={inputClass}
                                value={variant.inventoryQuantity || 0}
                                onChange={(e) =>
                                  updateVariantField(
                                    vIdx,
                                    "inventoryQuantity",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Advanced Options JSON */}
            <JsonTextarea
              label="Options Schema (Advanced)"
              value={product.options}
              onChange={(v) => setField("options", v)}
              hint='Optional: Define options like [{"name":"Size","position":1,"values":["S","M","L"]}].'
            />
          </div>
        );

      case "inventory":
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.inventoryTracked}
                  onChange={(e) => setField("inventoryTracked", e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                Track inventory quantities for this product
              </label>
              <p className="mt-1 ml-7 text-xs text-slate-500">
                When enabled, stock levels are decreased as customer orders are placed.
              </p>
            </div>

            {/* Warehouse Locations */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Warehouse size={16} className="text-indigo-600" />
                    Warehouse Locations
                  </h4>
                  <p className="text-xs text-slate-500">
                    Track stock by warehouse, retail store, or fulfillment center.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addInventoryLocation}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
                >
                  <Plus size={14} /> Add Location
                </button>
              </div>

              {product.inventoryLocations?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                  No warehouse locations added. Click &ldquo;Add Location&rdquo; to track multi-location stock.
                </p>
              ) : (
                <div className="space-y-3">
                  {product.inventoryLocations.map((loc, lIdx) => (
                    <div
                      key={lIdx}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 items-end"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Location Name
                        </label>
                        <input
                          className={inputClass}
                          value={loc.locationName}
                          onChange={(e) =>
                            updateLocationField(lIdx, "locationName", e.target.value)
                          }
                          placeholder="e.g. Central Warehouse"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">
                          Available Qty
                        </label>
                        <input
                          type="number"
                          min="0"
                          className={inputClass}
                          value={loc.available ?? loc.quantity ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateLocationField(lIdx, "available", val);
                            updateLocationField(lIdx, "quantity", val);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeInventoryLocation(lIdx)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Remove location"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isPhysicalProduct}
                  onChange={(e) => setField("isPhysicalProduct", e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                This is a physical product that requires shipping
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.isGiftCard}
                  onChange={(e) => setField("isGiftCard", e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                This product is a digital gift card
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                label="Package Type"
                value={product.packageType}
                onChange={(v) => setField("packageType", v)}
                placeholder="Store default box, poly mailer..."
              />

              <TextInput
                label="Country of Origin"
                value={product.countryOfOrigin}
                onChange={(v) => setField("countryOfOrigin", v)}
                placeholder="e.g. United States, India, Portugal"
              />

              <TextInput
                label="Harmonized Tariff (HS) Code"
                value={product.hsCode}
                onChange={(v) => setField("hsCode", v)}
                placeholder="e.g. 6109.10.00"
                hint="Used for international customs declarations."
              />

              <Field label="Dimensions Unit">
                <select
                  className={inputClass}
                  value={product.packageDimensions?.unit || "cm"}
                  onChange={(e) =>
                    setNested("packageDimensions", "unit", e.target.value)
                  }
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </Field>
            </div>

            {/* Package Dimensions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Package Dimensions
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {["length", "width", "height"].map((dimension) => (
                  <div key={dimension}>
                    <label className="text-xs font-semibold capitalize text-slate-600">
                      {dimension}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={product.packageDimensions?.[dimension] ?? 0}
                      onChange={(e) =>
                        setNested("packageDimensions", dimension, Number(e.target.value))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "publishing":
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Globe size={18} />
                <h4 className="text-sm font-semibold text-slate-900">
                  Sales Channels
                </h4>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.publishing?.allChannels ?? false}
                  onChange={(e) =>
                    setNested("publishing", "allChannels", e.target.checked)
                  }
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                Publish to all active sales channels
              </label>

              <Field
                label="Specific Sales Channels (comma-separated)"
                hint="e.g. Online Store, Point of Sale, Facebook Shop"
              >
                <input
                  className={inputClass}
                  value={(product.publishing?.salesChannels || []).join(", ")}
                  onChange={(e) =>
                    setNested(
                      "publishing",
                      "salesChannels",
                      e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="Online Store, Mobile App"
                />
              </Field>
            </div>

            {/* SEO Optimization */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Search size={18} />
                <h4 className="text-sm font-semibold text-slate-900">
                  Search Engine Listing (SEO)
                </h4>
              </div>

              <TextInput
                label="Page Title"
                value={product.seo?.pageTitle}
                onChange={(v) => setNested("seo", "pageTitle", v)}
                placeholder="SEO title tag"
                hint={`${(product.seo?.pageTitle || "").length} / 70 characters`}
              />

              <Field
                label="Meta Description"
                hint={`${(product.seo?.metaDescription || "").length} / 320 characters`}
              >
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={product.seo?.metaDescription}
                  onChange={(e) => setNested("seo", "metaDescription", e.target.value)}
                  placeholder="Summarize this product for search results..."
                  rows={3}
                />
              </Field>

              <TextInput
                label="SEO URL Handle"
                value={product.seo?.urlHandle}
                onChange={(v) => setNested("seo", "urlHandle", v)}
                placeholder="product-url-slug"
              />
            </div>
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-6">
            <JsonTextarea
              label="Custom Metafields"
              value={product.metafields}
              onChange={(v) => setField("metafields", v)}
              hint='Define custom schema attributes: [{"key":"material","value":"100% Cotton","namespace":"custom","type":"single_line_text_field"}].'
            />
          </div>
        );

      default:
        return null;
    }
  }

  const primaryImageSrc =
    imagePreviews[0]?.url ||
    product.image ||
    (product.media && product.media[0]?.url) ||
    "";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={16} /> Back to products
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {editing ? "Edit Product" : "Create Product"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure catalog details, pricing, uploaded media, and publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {editing ? "Save changes" : "Create product"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-700 hover:text-red-900"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Navigation Sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sticky top-6">
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Product Sections
          </p>

          <nav className="space-y-1">
            {SECTIONS.map(({ id: sectionId, label, icon: Icon }) => (
              <button
                key={sectionId}
                type="button"
                onClick={() => setActiveSection(sectionId)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                  activeSection === sectionId
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    activeSection === sectionId ? "text-indigo-600" : "text-slate-400"
                  }
                />
                {label}
              </button>
            ))}
          </nav>

          {/* Quick Summary Preview Box */}
          <div className="mt-4 border-t border-slate-100 p-3 pt-4">
            <div className="flex items-center gap-3">
              {primaryImageSrc ? (
                <img
                  src={getImageUrl(primaryImageSrc)}
                  alt="Thumbnail"
                  className="h-12 w-12 rounded-xl border border-slate-200 object-cover bg-slate-100 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 shrink-0">
                  <Package size={20} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {product.title || "Untitled Product"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {product.unitPrice?.amount != null
                    ? `$${Number(product.unitPrice.amount).toFixed(2)}`
                    : "Price unset"}
                </p>
                <span className="mt-1 inline-block text-[10px] font-medium capitalize text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {product.status}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Section Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {SECTIONS.find((s) => s.id === activeSection)?.label}
            </h2>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {editing ? "Edit Mode" : "New Product"}
            </span>
          </div>

          {renderSection()}
        </div>
      </div>
    </form>
  );
}