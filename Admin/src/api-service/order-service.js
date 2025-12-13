import axios from "axios";

// Create Axios instance with base URL
const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // send cookies automatically
});
// Fetch all orders
export const getAllOrders = async () => {
  const response = await API.get("/order/");
  return response.data; // assume { orders: [...] }
};

// Mark order as delivered (status)
export const updateOrder = async (orderId, status) => {
  const response = await API.put(`/order/update/${orderId}`, { status });
  return response.data;
};


// Undo delivered status (set back to Pending, status = 0)
export const undoOrderDelivered = async (orderId) => {
  const response = await API.put(`/order/update/${orderId}`, { status: 0 });
  return response.data;
};
