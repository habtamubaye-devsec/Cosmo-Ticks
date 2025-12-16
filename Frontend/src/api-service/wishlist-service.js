import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

export const getWishlist = async () => {
    try {
        const response = await api.get("/wishlist");
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw error;
    }
};

export const addToWishlist = async (productId) => {
    try {
        const response = await api.post("/wishlist/add", { productId });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw error;
    }
};

export const removeFromWishlist = async (productId) => {
    try {
        const response = await api.post("/wishlist/remove", { productId });
        return response.data;
    } catch (error) {
        if (error.response) throw error.response.data;
        else throw error;
    }
};
