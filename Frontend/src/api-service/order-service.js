import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1/order",
  withCredentials: true,
});

// ------------------- CREATE SINGLE PRODUCT CHECKOUT SESSION -------------------
export const createSingleCheckoutSessionService = async (productId, quantity) => {
  try {
    const res = await API.post(`/checkout/single/${productId}`, { quantity });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// ------------------- CREATE CART CHECKOUT SESSION -------------------
export const createCartCheckoutSessionService = async (products) => {
  try {
    const response = await API.post("/checkout/cart", { products });
    return response.data; // { success: true, url: "<Stripe Checkout URL>" }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ------------------- GET USER ORDERS -------------------
export const getUserOrder = async (userId) => {
  try {
    const response = await API.get(`/user/${userId}`);
    return response.data.orders || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};
