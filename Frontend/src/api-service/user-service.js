import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

export const loginUser = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    else throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/currentUser");
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    else throw error;
  }
};

export const registerUser = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    else throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    else throw error;
  }
};
