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
