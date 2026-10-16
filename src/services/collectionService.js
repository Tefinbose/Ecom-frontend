import { apiRequest } from "./api";

// Get all collections
export const getCollections = async () => {
  return await apiRequest("/collections");
};

// Get single collection by ID
export const getCollectionById = async (id) => {
  return await apiRequest(`/collections/${id}`);
};

// Create a new collection (FormData with optional image file)
export const createCollection = async (formData) => {
  return await apiRequest("/collections/add", {
    method: "POST",
    body: formData,
  });
};

// Update an existing collection (FormData or object)
export const updateCollection = async (id, formData) => {
  return await apiRequest(`/collections/${id}`, {
    method: "PATCH",
    body: formData,
  });
};

// Delete a collection
export const deleteCollection = async (id) => {
  return await apiRequest(`/collections/${id}`, {
    method: "DELETE",
  });
};