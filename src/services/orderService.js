import { apiRequest } from "./api";

// Fetch all orders
export const getOrders = async () => {
  return await apiRequest("/orders");
};

// Fetch order statistics (totalSales, statusCounts, etc.)
export const getOrderStats = async () => {
  return await apiRequest("/orders/stats");
};

// Search orders with pagination and status filter
export const searchOrders = async ({ search = "", status = "", page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status && status !== "all") params.append("status", status.toLowerCase());
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  return await apiRequest(`/orders/search?${params.toString()}`);
};

// Fetch single order by ID
export const getOrderById = async (id) => {
  return await apiRequest(`/orders/${id}`);
};

// Update order fulfillment / delivery status
export const updateOrderStatus = async (id, status) => {
  return await apiRequest(`/orders/${id}/status`, {
    method: "PATCH",
    body: { status: status.toLowerCase() },
  });
};

// Create a new order
export const createOrder = async (orderData) => {
  return await apiRequest("/orders", {
    method: "POST",
    body: orderData,
  });
};
