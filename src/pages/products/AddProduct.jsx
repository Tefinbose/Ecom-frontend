import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Pencil, RefreshCw, Package } from "lucide-react";

const INITIAL_PRODUCTS = [
  { _id: "prod-1", name: "Classic White Tee", description: "100% premium organic cotton t-shirt", price: 29.99, stock: 120 },
  { _id: "prod-2", name: "Denim Jacket", description: "Timeless vintage wash denim jacket", price: 89.99, stock: 45 },
  { _id: "prod-3", name: "Running Shoes", description: "Lightweight and breathable athletic shoes", price: 79.99, stock: 12 },
  { _id: "prod-4", name: "Everyday Backpack", description: "Durable water-resistant canvas travel backpack", price: 49.99, stock: 8 },
  { _id: "prod-5", name: "Minimalist Watch", description: "Elegant quartz watch with leather strap", price: 149.00, stock: 24 }
];

function getStoredProducts() {
  try {
    const raw = localStorage.getItem("empire_mock_products");
    if (raw) return JSON.parse(raw);
    localStorage.setItem("empire_mock_products", JSON.stringify(INITIAL_PRODUCTS));
  } catch {
    // fallback
  }
  return INITIAL_PRODUCTS;
}

export default function AddProduct() {
  const [products, setProducts] = useState(getStoredProducts);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  function refreshList() {
    setLoading(true);
    setTimeout(() => {
      setProducts(getStoredProducts());
      setLoading(false);
    }, 200);
  }

  const filteredProducts = products.filter((product) =>
    (product.name || product.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function deleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const updated = products.filter((p) => p._id !== id);
    setProducts(updated);
    try {
      localStorage.setItem("empire_mock_products", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your catalogue, prices, and available stock.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="mb-5 flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full py-2.5 text-sm outline-none bg-transparent"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={refreshList}
          className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 hover:bg-slate-50 transition-colors"
          title="Refresh products list"
          aria-label="Refresh products"
        >
          <RefreshCw size={18} className={`text-slate-600 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">Loading catalogue...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <Package size={36} className="text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or add a new product.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const stockQty = Number(product.stock ?? product.quantity ?? 0);
                return (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">
                        {product.name || product.title || "Untitled"}
                      </div>
                      {product.description && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      ₹{Number(product.price || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-700">
                      {stockQty} units
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        stockQty <= 0
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : stockQty <= 10
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {stockQty <= 0 ? "Out of Stock" : stockQty <= 10 ? "Low Stock" : "Active"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          aria-label="Edit product"
                        >
                          <Pencil size={17} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
