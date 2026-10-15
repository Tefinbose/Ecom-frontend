
import { useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  X,
  Plus,
  ChevronDown,
  Save,
  Package,
  Search,
  Trash2,
  Tag,
  Truck,
  Layers3,
  Eye,
  CheckCircle2,
} from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  status: "Draft",
  category: "",
  vendor: "",
  collections: "",
  tags: "",
  price: "",
  compareAtPrice: "",
  cost: "",
  quantity: "0",
  sku: "",
  barcode: "",
  trackInventory: true,
  continueSelling: false,
  physicalProduct: true,
  weight: "",
  weightUnit: "kg",
  length: "",
  width: "",
  height: "",
  size: "",
  color: "",
  seoTitle: "",
  seoDescription: "",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function AddProduct() {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showSeo, setShowSeo] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImages(event) {
    const files = Array.from(event.target.files || []);
    const remaining = Math.max(0, 8 - images.length);
    const selected = files.slice(0, remaining);

    const nextImages = selected.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...nextImages]);
    event.target.value = "";
  }

  function removeImage(id) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) URL.revokeObjectURL(image.url);
      return current.filter((item) => item.id !== id);
    });
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        size: "",
        color: "",
        price: form.price,
        sku: "",
        quantity: "0",
      },
    ]);
  }

  function updateVariant(id, key, value) {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === id ? { ...variant, [key]: value } : variant
      )
    );
  }

  function removeVariant(id) {
    setVariants((current) =>
      current.filter((variant) => variant.id !== id)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!form.title.trim()) {
      setMessage("Please enter a product title.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setMessage("Please enter a valid product price.");
      return;
    }

    if (!API_URL) {
      setMessage(
        "VITE_API_URL is missing. Configure your backend API URL in the frontend .env file."
      );
      return;
    }

    setSaving(true);

    try {
      const body = new FormData();

      body.append("title", form.title.trim());
      body.append("description", form.description);
      body.append("status", form.status.toLowerCase());
      body.append("category", form.category);
      body.append("vendor", form.vendor);
      body.append(
        "collections",
        JSON.stringify(
          form.collections.split(",").map((item) => item.trim()).filter(Boolean)
        )
      );
      body.append(
        "tags",
        JSON.stringify(
          form.tags.split(",").map((item) => item.trim()).filter(Boolean)
        )
      );
      body.append("price", form.price);
      body.append("compareAtPrice", form.compareAtPrice);
      body.append("cost", form.cost);
      body.append("quantity", form.quantity);
      body.append("sku", form.sku);
      body.append("barcode", form.barcode);
      body.append("trackInventory", String(form.trackInventory));
      body.append("continueSelling", String(form.continueSelling));
      body.append("physicalProduct", String(form.physicalProduct));
      body.append("weight", form.weight);
      body.append("weightUnit", form.weightUnit);
      body.append("dimensions", JSON.stringify({
        length: form.length,
        width: form.width,
        height: form.height,
      }));
      body.append("variants", JSON.stringify(variants));
      body.append("seoTitle", form.seoTitle);
      body.append("seoDescription", form.seoDescription);

      images.forEach((image) => {
        body.append("images", image.file);
      });

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/admin/products`, {
        method: "POST",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        body,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save product.");
      }

      setMessage(data.message || "Product created successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the product."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Products / New product</p>
              <h1 className="truncate text-lg font-bold text-slate-900">
                Add product
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                images.forEach((image) => URL.revokeObjectURL(image.url));
                setImages([]);
                setVariants([]);
                setMessage("");
              }}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => document.getElementById("product-form")?.requestSubmit()}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save product"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {message && (
          <div
            role="status"
            className={`mb-5 flex items-start gap-2 rounded-lg border p-4 text-sm ${
              message.toLowerCase().includes("success")
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
            <button
              type="button"
              className="ml-auto"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(290px,0.95fr)]"
        >
          {/* Main column */}
          <div className="space-y-6">
            <Card title="Product information" subtitle="Add the essential product details">
              <Field label="Title">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Classic cotton T-shirt"
                  required
                />
              </Field>

              <Field label="Description">
                <textarea
                  className={`${inputClass} min-h-36 resize-y`}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe your product, its features, materials, and benefits..."
                  rows={6}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Write a clear description to help customers understand your product.
                </p>
              </Field>
            </Card>

            <Card
              title="Media"
              subtitle="Upload product images (up to 8)"
              action={<ImagePlus size={19} className="text-slate-400" />}
            >
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">
                <div className="mb-3 rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <ImagePlus size={25} />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Click to upload images
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  PNG, JPG, WEBP · Select multiple files
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImages}
                  disabled={images.length >= 8}
                />
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                    >
                      <img
                        src={image.url}
                        alt={`Product preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded bg-slate-900/80 px-2 py-1 text-[10px] font-medium text-white">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute right-2 top-2 rounded-md bg-white p-1.5 text-rose-600 shadow hover:bg-rose-50"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Pricing" subtitle="Set your selling price and costs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Price">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className={`${inputClass} pl-8`}
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </Field>

                <Field label="Compare-at price">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${inputClass} pl-8`}
                      value={form.compareAtPrice}
                      onChange={(e) => updateField("compareAtPrice", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </Field>

                <Field label="Cost per item">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${inputClass} pl-8`}
                      value={form.cost}
                      onChange={(e) => updateField("cost", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </Field>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Estimated margin</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {form.price !== "" && form.cost !== "" && Number(form.price) > 0
                      ? `${(((Number(form.price) - Number(form.cost)) / Number(form.price)) * 100).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Inventory" subtitle="Manage stock and product identifiers">
              <Toggle
                label="Track inventory"
                description="Keep track of available stock"
                checked={form.trackInventory}
                onChange={(value) => updateField("trackInventory", value)}
              />

              {form.trackInventory && (
                <Field label="Available quantity">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                  />
                </Field>
              )}

              <Toggle
                label="Continue selling when out of stock"
                checked={form.continueSelling}
                onChange={(value) => updateField("continueSelling", value)}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="SKU">
                  <input
                    className={inputClass}
                    value={form.sku}
                    onChange={(e) => updateField("sku", e.target.value)}
                    placeholder="e.g. TSHIRT-001"
                  />
                </Field>
                <Field label="Barcode">
                  <input
                    className={inputClass}
                    value={form.barcode}
                    onChange={(e) => updateField("barcode", e.target.value)}
                    placeholder="Enter barcode"
                  />
                </Field>
              </div>
            </Card>

            <Card title="Shipping" subtitle="Physical product and package details">
              <Toggle
                label="Physical product"
                description="This product requires shipping"
                checked={form.physicalProduct}
                onChange={(value) => updateField("physicalProduct", value)}
              />

              {form.physicalProduct && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
                    <Field label="Weight">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={form.weight}
                        onChange={(e) => updateField("weight", e.target.value)}
                        placeholder="0.00"
                      />
                    </Field>
                    <Field label="Unit">
                      <select
                        className={inputClass}
                        value={form.weightUnit}
                        onChange={(e) => updateField("weightUnit", e.target.value)}
                      >
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="lb">Pounds</option>
                        <option value="oz">Ounces</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Package dimensions (cm)">
                    <div className="grid grid-cols-3 gap-2">
                      {["length", "width", "height"].map((dimension) => (
                        <input
                          key={dimension}
                          type="number"
                          min="0"
                          className={inputClass}
                          value={form[dimension]}
                          onChange={(e) =>
                            updateField(dimension, e.target.value)
                          }
                          placeholder={dimension[0].toUpperCase() + dimension.slice(1)}
                          aria-label={dimension}
                        />
                      ))}
                    </div>
                  </Field>
                </>
              )}
            </Card>

            <Card
              title="Variants"
              subtitle="Offer different sizes, colors, or other options"
              action={
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={15} />
                  Add variant
                </button>
              }
            >
              {variants.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
                  <Layers3 size={24} className="mx-auto text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    No variants added
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a variant for different product options.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">
                          Variant {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="text-rose-500 hover:text-rose-700"
                          aria-label="Remove variant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          ["size", "Size", "e.g. Medium"],
                          ["color", "Color", "e.g. Navy"],
                          ["price", "Price (₹)", "0.00"],
                          ["sku", "SKU", "Variant SKU"],
                          ["quantity", "Quantity", "0"],
                        ].map(([key, label, placeholder]) => (
                          <Field key={key} label={label}>
                            <input
                              type={["price", "quantity"].includes(key) ? "number" : "text"}
                              min={["price", "quantity"].includes(key) ? "0" : undefined}
                              className={inputClass}
                              value={variant[key]}
                              onChange={(e) =>
                                updateVariant(variant.id, key, e.target.value)
                              }
                              placeholder={placeholder}
                            />
                          </Field>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Search engine listing" subtitle="Preview and customize how this product may appear in search results">
              <button
                type="button"
                onClick={() => setShowSeo((current) => !current)}
                className="flex w-full items-center justify-between text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <span className="flex items-center gap-2">
                  <Search size={16} />
                  {showSeo ? "Hide SEO settings" : "Edit SEO settings"}
                </span>
                <ChevronDown
                  size={17}
                  className={`transition-transform ${showSeo ? "rotate-180" : ""}`}
                />
              </button>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-emerald-700">yourstore.com/products/your-product</p>
                <p className="mt-1 font-medium text-blue-700">
                  {form.seoTitle || form.title || "Product title"}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                  {form.seoDescription || form.description || "Your product description will appear here."}
                </p>
              </div>

              {showSeo && (
                <>
                  <Field label="SEO title">
                    <input
                      className={inputClass}
                      maxLength={70}
                      value={form.seoTitle}
                      onChange={(e) => updateField("seoTitle", e.target.value)}
                      placeholder={form.title || "Search result title"}
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      {form.seoTitle.length}/70 characters
                    </p>
                  </Field>
                  <Field label="SEO description">
                    <textarea
                      className={inputClass}
                      rows={3}
                      maxLength={320}
                      value={form.seoDescription}
                      onChange={(e) => updateField("seoDescription", e.target.value)}
                      placeholder="Summarize your product for search engines..."
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      {form.seoDescription.length}/320 characters
                    </p>
                  </Field>
                </>
              )}
            </Card>
          </div>

          {/* Right column */}
          <aside className="space-y-6 xl:sticky xl:top-[92px]">
            <Card title="Status">
              <Field label="Product status">
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </Field>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`h-2 w-2 rounded-full ${
                    form.status === "Active"
                      ? "bg-emerald-500"
                      : form.status === "Draft"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                {form.status === "Active"
                  ? "Available for publishing"
                  : form.status === "Draft"
                  ? "Not visible to customers"
                  : "Archived product"}
              </div>
            </Card>

            <Card title="Publishing">
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <Eye size={18} className="mt-0.5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Sales channels
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Availability on storefronts is managed by your backend.
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Product organization">
              <Field label="Category">
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="">Choose a category</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home">Home & Living</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Food">Food & Beverages</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Vendor">
                <input
                  className={inputClass}
                  value={form.vendor}
                  onChange={(e) => updateField("vendor", e.target.value)}
                  placeholder="Brand or vendor name"
                />
              </Field>

              <Field label="Collections">
                <input
                  className={inputClass}
                  value={form.collections}
                  onChange={(e) => updateField("collections", e.target.value)}
                  placeholder="e.g. Summer, Featured"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Separate multiple collections with commas.
                </p>
              </Field>

              <Field label="Tags">
                <input
                  className={inputClass}
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  placeholder="e.g. new, trending, cotton"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Separate multiple tags with commas.
                </p>
              </Field>
            </Card>

            <Card title="Product summary">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Selling price</p>
                    <p className="text-sm font-bold text-slate-900">
                      {form.price !== "" ? `₹${Number(form.price).toFixed(2)}` : "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                    <Layers3 size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Inventory</p>
                    <p className="text-sm font-bold text-slate-900">
                      {form.trackInventory ? `${form.quantity || 0} units` : "Not tracked"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Fulfillment</p>
                    <p className="text-sm font-bold text-slate-900">
                      {form.physicalProduct ? "Physical shipping" : "Non-physical"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                    <Tag size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Variants</p>
                    <p className="text-sm font-bold text-slate-900">
                      {variants.length} added
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </form>

        {/* Bottom action bar */}
        <div className="mt-8 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            Review your product information before saving.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => document.getElementById("product-form")?.requestSubmit()}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save product"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
