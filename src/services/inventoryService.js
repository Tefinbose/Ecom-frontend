import { apiRequest } from "./api";

// Fetch all inventory records from backend
export const getAllInventory = async () => {
  return await apiRequest("/inventory");
};

// Add a new inventory record
export const addInventory = async (inventoryData) => {
  return await apiRequest("/inventory/add", {
    method: "POST",
    body: inventoryData,
  });
};

// Update an existing inventory record
export const updateInventory = async (id, inventoryData) => {
  return await apiRequest(`/inventory/${id}`, {
    method: "PATCH",
    body: inventoryData,
  });
};

// Delete an inventory record
export const deleteInventory = async (id) => {
  return await apiRequest(`/inventory/${id}`, {
    method: "DELETE",
  });
};
