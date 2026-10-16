import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Package,
  Search,
  Pencil,
  RefreshCw,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Layers,
  ArrowUpDown,
} from "lucide-react";

import {
  getProducts,
  deleteProduct,
} from "../../services/productService";
import { getImageUrl } from "../../services/api";

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts();

      // Backend returns { message: "...", products: [...] }
      const productList = Array.isArray(response)
        ? response
        : response.products || response.data?.products || response.data || [];

      setProducts(productList);
    } catch (err) {
      setError(err.message || "Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      await deleteProduct(deletingId);
      setProducts((current) => current.filter((p) => p._id !== deletingId));
      setMessage("Product deleted successfully.");
      setDeletingId(null);
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Derive unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const draft = products.filter((p) => p.status === "draft").length;
    const outOfStock = products.filter((p) => {
      if (p.variants && p.variants.length > 0) {
        return p.variants.every((v) => (v.inventoryQuantity ?? 0) <= 0);
      }
      return false;
    }).length;

    return { total, active, draft, outOfStock };
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const query = search.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (product.title || "").toLowerCase().includes(query) ||
          (product.handle || "").toLowerCase().includes(query) ||
          (product.vendor || "").toLowerCase().includes(query) ||
          (product.tags || []).some((t) => t.toLowerCase().includes(query));

        if (!matchesSearch) return false;

        if (statusFilter !== "all" && product.status !== statusFilter) {
          return false;
        }

        if (categoryFilter !== "all" && product.category !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title-asc") {
          return (a.title || "").localeCompare(b.title || "");
        }
        if (sortBy === "title-desc") {
          return (b.title || "").localeCompare(a.title || "");
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        // newest default
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, search, statusFilter, categoryFilter, sortBy]);

  // Helper to format price display
  const formatPrice = (product) => {
    if (product.unitPrice?.amount != null) {
      return `$${Number(product.unitPrice.amount).toFixed(2)}${
        product.unitPrice.measurementUnit ? ` / ${product.unitPrice.measurementUnit}` : ""
      }`;
    }

    if (product.variants && product.variants.length > 0) {
      const prices = product.variants
        .map((v) => Number(v.price))
        .filter((p) => !isNaN(p));
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max
          ? `$${min.toFixed(2)}`
          : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
      }
    }

    return "—";
  };

  // Helper to get total inventory
  const getInventoryStatus = (product) => {
    if (!product.inventoryTracked) {
      return { label: "Not tracked", color: "bg-slate-100 text-slate-600" };
    }

    let totalQty = 0;
    if (product.variants && product.variants.length > 0) {
      totalQty = product.variants.reduce(
        (sum, v) => sum + (Number(v.inventoryQuantity) || 0),
        0
      );
    } else if (product.inventoryLocations && product.inventoryLocations.length > 0) {
      totalQty = product.inventoryLocations.reduce(
        (sum, loc) => sum + (Number(loc.available ?? loc.quantity) || 0),
        0
      );
    }

    if (totalQty <= 0) {
      return { label: "Out of stock (0)", color: "bg-red-50 text-red-700 border-red-200" };
    }
    if (totalQty <= 10) {
      return { label: `Low stock (${totalQty})`, color: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: `${totalQty} available`, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const s = (status || "draft").toLowerCase();
    switch (s) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "draft":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "archived":
        return "bg-slate-200 text-slate-700 border-slate-300";
      case "unlisted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-indigo-600">
            <Package size={17} />
            <span className="font-semibold">Catalog management</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Products
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create, manage and organize inventory items for your online storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/products/new")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus size={18} />
          Add product
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Products
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Package size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Active in Store
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {stats.active}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Drafts & Unlisted
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600">
                {stats.draft}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Tag size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Out of Stock
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {stats.outOfStock}
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {message && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage("")}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadProducts}
            className="inline-flex items-center gap-1.5 font-semibold text-red-800 underline hover:no-underline"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, vendor, handle, or tags..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-9 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 shadow-sm"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="unlisted">Unlisted</option>
          </select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 shadow-sm"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 shadow-sm"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={loadProducts}
            title="Refresh product list"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 hover:bg-slate-100 shadow-sm transition"
          >
            <RefreshCw size={17} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-900">All Products</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {(search || statusFilter !== "all" || categoryFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-sm text-slate-500">
            <RefreshCw size={24} className="animate-spin text-indigo-600" />
            <span>Loading products catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-600">
              <Package size={36} />
            </div>

            <h3 className="text-base font-semibold text-slate-900">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "No matching products found"
                : "No products in store yet"}
            </h3>

            <p className="mt-1.5 max-w-sm text-sm text-slate-500">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search terms or clearing current filter selections."
                : "Get started by adding your first product to build your catalog."}
            </p>

            {search || statusFilter !== "all" || categoryFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear all filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/admin/products/new")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
              >
                <Plus size={17} />
                Add first product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Inventory</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const imageSrc =
                    product.image ||
                    (product.media && product.media[0]?.url) ||
                    "";
                  const inventoryInfo = getInventoryStatus(product);

                  return (
                    <tr
                      key={product._id}
                      className="transition hover:bg-slate-50/80"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {imageSrc ? (
                            <img
                              src={getImageUrl(imageSrc)}
                              alt={product.title}
                              className="h-12 w-12 rounded-xl border border-slate-200 object-cover bg-slate-100 shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}

                          <div
                            style={{ display: imageSrc ? "none" : "flex" }}
                            className="h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 shrink-0"
                          >
                            <Package size={22} />
                          </div>

                          <div className="max-w-xs">
                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              className="font-semibold text-slate-900 hover:text-indigo-600 transition truncate block"
                            >
                              {product.title}
                            </Link>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                              <span>{product.vendor || "No vendor"}</span>
                              {product.handle && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[11px] text-slate-400 truncate">
                                    /{product.handle}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(
                            product.status
                          )}`}
                        >
                          {product.status || "draft"}
                        </span>
                      </td>

                      {/* Inventory */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${inventoryInfo.color}`}
                        >
                          {inventoryInfo.label}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-slate-600">
                        {product.category ? (
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatPrice(product)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/products/${product._id}/edit`)
                            }
                            title="Edit product"
                            aria-label={`Edit ${product.title}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingId(product._id)}
                            title="Delete product"
                            aria-label={`Delete ${product.title}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Product
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete this product? All associated inventory records and images will be removed.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirm delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
