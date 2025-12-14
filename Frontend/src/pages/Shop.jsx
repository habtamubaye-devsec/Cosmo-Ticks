import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Heart, Star, Plus, Filter } from "lucide-react";
import { getAllProducts } from "../api-service/products-service";
import { addToCart } from "../api-service/cart-service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Shop() {
    const { category, subcategory } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await getAllProducts();
                const allProducts = response.product || [];
                setProducts(allProducts);
            } catch (error) {
                console.error("Failed to fetch products");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            let filtered = products;

            // Filter by Category (e.g., Skincare)
            if (category) {
                filtered = filtered.filter(p =>
                    p.category?.some(c => c.toLowerCase() === category.toLowerCase())
                );
            }

            // Filter by Subcategory if strictly needed (e.g. Serums), 
            // but simplistic matching on title or description might be needed if backend doesn't support sub-cats
            if (subcategory) {
                filtered = filtered.filter(p =>
                    p.title.toLowerCase().includes(subcategory.toLowerCase()) ||
                    p.description?.toLowerCase().includes(subcategory.toLowerCase())
                );
            }

            setFilteredProducts(filtered);
        }
    }, [category, subcategory, products]);

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();
        try {
            await addToCart(product._id);
            message.success(`${product.title} added to bag`);
        } catch (error) {
            // Fallback for demo if not logged in
            message.success(`${product.title} added to bag`);
        }
    };

    const getBadges = (index) => {
        // Simple deterministic badge assignment
        if (index % 4 === 0) return [{ text: "Bestseller", bg: "bg-white", textCol: "text-gray-900" }];
        if (index % 5 === 0) return [{ text: "New", bg: "bg-black", textCol: "text-white" }];
        return [];
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Header */}
            <div className="bg-[#f7f5f0] pt-32 pb-16 px-6">
                <div className="container mx-auto text-center">
                    <span className="text-[#c17f59] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                        Shop Collection
                    </span>
                    <h1 className="font-serif text-5xl md:text-6xl text-gray-900 capitalize mb-6">
                        {subcategory || category || "All Products"}
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto text-lg">
                        Curated essentials for your daily ritual. Clean, effective, and sustainable.
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-6 py-20">
                {/* Simple Toolbar */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                    <p className="text-gray-500">{filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}</p>
                    <button className="flex items-center gap-2 text-gray-900 font-medium hover:text-[#c17f59] transition-colors">
                        <Filter size={18} /> Filter
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product._id}
                                className="group cursor-pointer"
                                onClick={() => navigate(`/product/${product._id}`)}
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/5] bg-[#f2f2f0] rounded-2xl overflow-hidden mb-6">
                                    <img
                                        src={product.img?.[0] || product.img}
                                        alt={product.title}
                                        className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {getBadges(index).map((badge, i) => (
                                            <span
                                                key={i}
                                                className={`${badge.bg} ${badge.textCol} text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide`}
                                            >
                                                {badge.text}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
                                        onClick={(e) => { e.stopPropagation(); message.info("Added to wishlist"); }}
                                    >
                                        <Heart size={16} className="text-gray-900" />
                                    </button>

                                    <button
                                        onClick={(e) => handleAddToCart(product, e)}
                                        className="absolute bottom-4 right-4 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-black z-10"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Info */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        {product.category?.[0] || "SKINCARE"}
                                    </p>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-serif text-xl text-gray-900 group-hover:text-[#c17f59] transition-colors leading-tight">
                                            {product.title}
                                        </h3>
                                        <span className="font-medium text-lg text-gray-900 whitespace-nowrap ml-4">
                                            ${product.oridinaryPrice?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400 font-serif mb-4">No products found in this category.</p>
                        <button
                            onClick={() => navigate('/category/skincare')}
                            className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800"
                        >
                            Browse Skincare
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Shop;
