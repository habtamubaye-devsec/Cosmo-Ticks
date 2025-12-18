import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // send cookies automatically
});

// Fetch all categories
export const getAllCategories = async () => {
  const response = await API.get("/category/");
  return response.data;
};

// Create category
export const createCategory = async (data) => {
  const response = await API.post("/category/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log(response.data);
  return response.data;
};

// Update category
export const updateCategory = async (id, data) => {
  const response = await API.put(`/category/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete category
export const deleteCategory = async (id) => {
  const response = await API.delete(`/category/${id}`);
  return response.data;
};

// Get single category by ID
export const getCategoryById = async (id) => {
  const response = await API.get(`/categories/${id}`);
  return response.data;
};
