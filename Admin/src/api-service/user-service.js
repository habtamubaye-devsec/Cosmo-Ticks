import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "/api/v1"}/user`,
  withCredentials: true, // 🔑 this sends cookies (JWT token)
});

// Get all users
export const getAllUser = async () => {
  const response = await api.get("/");
  return response.data;
};

// Delete user
export const deletedUser = async (id) => {
  const response = await api.delete(`/delete/${id}`);
  return response.data;
};

// Update user
export const updateUserData = async (userId, data) => {
  const response = await api.put(`/update/${userId}`, data);
  return response.data;
};
