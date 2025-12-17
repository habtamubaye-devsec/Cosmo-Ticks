import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../api-service/user-service";
import { getUserCart, addToCart, removeCartItemService, updateCartItem, clearCart as clearCartService } from "../api-service/cart-service";
import { getWishlist, addToWishlist, removeFromWishlist } from "../api-service/wishlist-service";
import { message } from "antd";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    // Fetch all data
    const refreshShop = async () => {
        try {
            // 1. Get User
            const userData = await getCurrentUser();
            if (userData?.data) {
                setUser(userData.data);

                // 2. Get Cart
                try {
                    const cart = await getUserCart(userData.data._id);
                    setCartCount(cart.products?.length || 0);
                } catch (e) {
                    setCartCount(0);
                }

                // 3. Get Wishlist
                try {
                    const wishlistData = await getWishlist();
                    const items = wishlistData.wishlist?.products || [];
                    setWishlistCount(items.length);
                    setWishlistIds(new Set(items.map(item => item.product._id)));
                } catch (e) {
                    setWishlistCount(0);
                    setWishlistIds(new Set());
                }

            } else {
                setUser(null);
                setCartCount(0);
                setWishlistCount(0);
                setWishlistIds(new Set());
            }
        } catch (error) {
            console.error("Error refreshing shop context:", error);
            // If user fetch fails (401 etc), reset everything
            setUser(null);
            setCartCount(0);
            setWishlistCount(0);
            setWishlistIds(new Set());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshShop();
    }, []);

    // Cart Actions
    const handleAddToCart = async (productId) => {
        if (!user) {
            message.error("Please login to add items to cart");
            return false;
        }
        try {
            await addToCart(productId);
            await refreshShop(); // Sync count
            message.success("Added to bag");
            return true;
        } catch (error) {
            message.error("Could not add to bag");
            return false;
        }
    };

    // Wishlist Actions
    const handleAddToWishlist = async (productId) => {
        if (!user) {
            message.error("Please login to use wishlist");
            return false;
        }
        try {
            await addToWishlist(productId);
            await refreshShop(); // Sync count & IDs
            message.success("Added to wishlist");
            return true;
        } catch (error) {
            message.error(error.message);
            return false;
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await removeFromWishlist(productId);
            await refreshShop(); // Sync count & IDs
            return true;
        } catch (error) {
            message.error("Could not remove from wishlist");
            return false;
        }
    };

    return (
        <ShopContext.Provider
            value={{
                user,
                cartCount,
                wishlistCount,
                wishlistIds,
                loading,
                refreshShop,
                handleAddToCart,
                handleAddToWishlist,
                handleRemoveFromWishlist
            }}
        >
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => useContext(ShopContext);
