import { apiRequest } from "./api";

const JSON_FIELDS = new Set([
  "Collection",
  "tags",
  "unitPrice",
  "inventoryLocations",
  "options",
  "variants",
  "packageDimensions",
  "publishing",
  "seo",
  "metafields",
]);

/**
 * Converts a plain product data object into FormData if it isn't one already.
 * This satisfies the backend multerMiddleware.array("images") requirement
 * so req.files is always defined.
 */
export function buildProductFormData(data, imageFiles = []) {
  if (data instanceof FormData) {
    return data;
  }

  const formData = new FormData();

  // Append uploaded image files if provided
  if (Array.isArray(imageFiles) && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
  } else if (Array.isArray(data.images) && data.images[0] instanceof File) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  Object.entries(data).forEach(([key, value]) => {
    if (key === "images") return; // Handled separately
    if (value === undefined || value === null) return;

    if (JSON_FIELDS.has(key)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "boolean" || typeof value === "number") {
      formData.append(key, String(value));
    } else if (typeof value === "string") {
      formData.append(key, value);
    } else {
      formData.append(key, JSON.stringify(value));
    }
  });

  return formData;
}

// Get all products
export const getProducts = async () => {
  return await apiRequest("/products");
};

// Get a single product
export const getProductById = async (id) => {
  return await apiRequest(`/products/${id}`);
};

// Add a product (automatically converted to FormData for multer)
export const createProduct = async (productData, imageFiles = []) => {
  const payload = buildProductFormData(productData, imageFiles);
  return await apiRequest("/products/add", {
    method: "POST",
    body: payload,
  });
};

// Update a product
export const updateProduct = async (id, productData, imageFiles = []) => {
  const payload = buildProductFormData(productData, imageFiles);
  return await apiRequest(`/products/${id}`, {
    method: "PATCH",
    body: payload,
  });
};

// Delete a product
export const deleteProduct = async (id) => {
  return await apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
};
