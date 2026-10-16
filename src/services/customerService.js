import { apiRequest } from "./api";

// Fetch all registered customers
export const getCustomers = async () => {
  return await apiRequest("/users");
};

// Delete a customer by ID (Admin only)
export const deleteCustomer = async (id) => {
  return await apiRequest(`/users/${id}`, {
    method: "DELETE",
  });
};
