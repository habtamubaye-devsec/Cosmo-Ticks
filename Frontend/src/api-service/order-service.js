import axios from "axios";

// Create Axios instance with base URL
const API = axios.create({
  baseURL: "http://localhost:8000/api/v1/order",
  withCredentials: true, // send cookies automatically
});
// Multiple items (cart)
export const createCartOrderService = async (orderData) => {
  try {
    const response = await API.post("/order/cart", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Single item
export const createSingleOrderService = async (orderData) => {
  try {
    const response = await API.post("/create-single", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserOrder = async (userId) => {
  try {
    const response = await API.get(`/${userId}`); // adjust endpoint as needed
    console.log("API Response:", response.data); // debug

    // Return the orders array from the response
    return response.data.orders || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error.response || error);
    throw error;
  }
};