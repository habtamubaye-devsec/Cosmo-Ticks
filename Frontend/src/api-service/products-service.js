import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // send cookies automatically
});

// Fetch all products
export const getAllProducts = async () => {
  const response = await API.get("/products/");
  return response.data;
};


export const getProductById = async (id) => {
  const response = await API.get(`products/${id}`);
  return response.data;
};

// Add review
export const addProductReview = async (id, reviewData) => {
  const response = await API.post(`/products/${id}/reviews`, reviewData);
  return response.data;
};

// Update review (same as add: backend upserts)
export const updateProductReview = async (id, reviewData) => {
  const response = await API.put(`/products/${id}/reviews`, reviewData);
  return response.data;
};

// Delete current user's review
export const deleteProductReview = async (id) => {
  const response = await API.delete(`/products/${id}/reviews`);
  return response.data;
};
