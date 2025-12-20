import axios from "axios";

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "/api/v1"),
  withCredentials: true, // send cookies automatically
});

// Fetch all products
export const getAllProducts = async () => {
  const response = await API.get("/products/");
  return response.data;
};

// Create product
export const createProducts = async (data) => {
  const response = await API.post("/products/create", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/delete/${id}`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await API.put(`/products/update/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
