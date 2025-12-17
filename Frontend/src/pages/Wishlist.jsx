import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { message, Spin } from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getWishlist } from "../api-service/wishlist-service";
import { useShop } from "../context/ShopContext";

function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    // Use Context
    const { handleAddToCart: addToCartContext, handleRemoveFromWishlist } = useShop();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await getWishlist();
            // Backend returns: { wishlist: { products: [ { product: {...} } ] } }
            // We map it to get the product details directly
            const items = data.wishlist?.products.map(item => item.product) || [];
            setWishlistItems(items);
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
            // Don't show error for empty/new users (404 handled in backend as empty or error)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const onAddToCart = async (product) => {
        await addToCartContext(product._id);
    };

    const onRemoveFromWishlist = async (id) => {
        // Optimistic update: Remove immediately from UI
        setWishlistItems(prev => prev.filter(item => item._id !== id));

        // Sync with backend (context handles error/refresh)
        await handleRemoveFromWishlist(id);
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="pt-32 pb-12">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">Your Wishlist</h1>
                        <p className="text-gray-500">Save your favorites for later</p>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl">
                            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                            <p className="text-gray-500 mb-8">Browse our collection to find your new favorites.</p>
                            <Link
                                to="/shop"
                                className="inline-block bg-black !text-white px-8 py-3 rounded-full hover:bg-[#c17f59] transition-colors"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {wishlistItems.map((product) => (
                                <div key={product._id} className="group relative">
                                    <div className="aspect-[4/5] bg-[#f5f5f3] rounded-2xl overflow-hidden mb-4 relative">
                                        <img
                                            src={Array.isArray(product.img) ? product.img[0] : product.img}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* Actions overlay */}
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => onAddToCart(product)}
                                                className="bg-white p-3 rounded-full hover:bg-black hover:text-white transition-colors shadow-lg"
                                            >
                                                <ShoppingBag size={20} />
                                            </button>
                                            <button
                                                onClick={() => onRemoveFromWishlist(product._id)}
                                                className="bg-white p-3 rounded-full hover:bg-red-50 text-red-500 transition-colors shadow-lg"
                                            >
                                                <Heart size={20} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category?.[0] || 'Uncategorized'}</p>
                                        <h3 className="font-serif text-lg text-gray-900 group-hover:text-[#c17f59] transition-colors">
                                            <Link to={`/product/${product._id}`}>{product.title}</Link>
                                        </h3>
                                        <p className="text-gray-900 font-medium mt-1">${product.oridinaryPrice?.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Wishlist;
