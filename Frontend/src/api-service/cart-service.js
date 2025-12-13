import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/cart";

// Add a product to cart (quantity = 1)
export const addToCart = async (productId) => {
  const response = await axios.post(
    `${API_URL}/create`,
    { productId },
    { withCredentials: true } // send cookies automatically
  );
  return response.data;
};

// Update product quantity or add if not exists
export const updateCartItem = async (productId, quantity) => {
  const response = await axios.put(
    `${API_URL}/update`,
    { productId, quantity },
    { withCredentials: true }
  );
  return response.data;
};

// Get cart by user ID
export const getUserCart = async (userId) => {
  const response = await axios.get(`${API_URL}`, {
    withCredentials: true,
  });
  return response.data;
};

// Clear the entire cart for the logged-in user
export const clearCart = async () => {
  const response = await axios.delete(`${API_URL}/clear`, {
    withCredentials: true,
  });
  return response.data;
};
export const removeCartItemService = async (productId) => {
  const response = await axios.delete(`${API_URL}/remove`, {
    data: { productId },
    withCredentials: true,
  });
  return response.data;
};
