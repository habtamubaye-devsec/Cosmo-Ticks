import { useState, useEffect } from "react";
import { Heart, Star, Plus, Filter, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { getAllProducts } from "../api-service/products-service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useShop } from "../context/ShopContext";

const Shop = () => {
    const { category, subcategory } = useParams();
    const { search } = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(search);
    const searchQuery = queryParams.get("search") || "";

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [minRating, setMinRating] = useState(0);

    const {
        handleAddToCart: addToCartContext,
        handleAddToWishlist,
        handleRemoveFromWishlist,
        wishlistIds,
    } = useShop();

    const pageSize = 16;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params = {
                    category: category || undefined,
                    subCategory: subcategory || undefined,
                    search: searchQuery || undefined,
                    minPrice: priceRange[0] || undefined,
                    maxPrice: priceRange[1] || undefined,
                    minRating: minRating || undefined,
                };
                const response = await getAllProducts(params);
                setProducts(response.product || []);
                setPage(1);
            } catch (error) {
                console.error("Failed to fetch products", error);
                message.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category, subcategory, searchQuery, priceRange, minRating]);

    const getBadges = (index) => {
        // Simple deterministic badge assignment
        if (index % 4 === 0) return [{ text: "Bestseller", bg: "bg-white", textCol: "text-gray-900" }];
        if (index % 5 === 0) return [{ text: "New", bg: "bg-black", textCol: "text-white" }];
        return [];
    };

    const getRatingSummary = (product) => {
        const ratings = Array.isArray(product?.ratings) ? product.ratings : [];
        const count = ratings.length;
        const avg = count
            ? ratings.reduce((sum, r) => sum + Number(r?.star || 0), 0) / count
            : 0;
        return { count, avg, label: avg ? avg.toFixed(1) : "0.0" };
    };

    const totalPages = Math.max(1, Math.ceil((products?.length || 0) / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const visibleProducts = (products || []).slice(startIndex, startIndex + pageSize);

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-100 gap-4">
                    <p className="text-gray-500">{products.length} Product{products.length !== 1 ? 's' : ''}</p>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {searchQuery && (
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-600">
                                <span>Search: {searchQuery}</span>
                                <button onClick={() => navigate("/shop")}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 font-medium transition-colors ${showFilters ? 'text-[#c17f59]' : 'text-gray-900'} hover:text-[#c17f59]`}
                        >
                            <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Filter'}
                        </button>
                    </div>
                </div>

                {/* Filter Sidebar/Drawer placeholder */}
                {showFilters && (
                    <div className="bg-[#fcfaf7] rounded-2xl p-6 mb-12 border border-[#f3eee7] animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Price Range */}
                            <div>
                                <h4 className="font-serif text-lg mb-4">Price Range</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-400 uppercase block mb-1">Min Price</label>
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#c17f59]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-400 uppercase block mb-1">Max Price</label>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#c17f59]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <h4 className="font-serif text-lg mb-4">Minimum Rating</h4>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setMinRating(minRating === star ? 0 : star)}
                                            className="hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                size={24}
                                                fill={star <= minRating ? "#c17f59" : "none"}
                                                className={star <= minRating ? "text-[#c17f59]" : "text-gray-300"}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">
                                        {minRating > 0 ? `${minRating}+ Stars` : "Any Rating"}
                                    </span>
                                </div>
                            </div>

                            {/* Reset */}
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setPriceRange([0, 1000]);
                                        setMinRating(0);
                                    }}
                                    className="text-sm font-medium text-gray-500 hover:text-[#c17f59] underline underline-offset-4"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c17f59] mb-4"></div>
                        <p className="text-gray-400 font-serif">Curating collection...</p>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                            {visibleProducts.map((product, index) => (
                                (() => {
                                    const { count, avg, label } = getRatingSummary(product);
                                    return (
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
                                                    {getBadges(startIndex + index).map((badge, i) => (
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (wishlistIds.has(product._id)) {
                                                            handleRemoveFromWishlist(product._id);
                                                        } else {
                                                            handleAddToWishlist(product._id);
                                                        }
                                                    }}
                                                >
                                                    <Heart
                                                        size={16}
                                                        className={wishlistIds.has(product._id) ? "text-red-500 fill-red-500" : "text-gray-900"}
                                                        fill={wishlistIds.has(product._id) ? "currentColor" : "none"}
                                                    />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCartContext(product._id);
                                                    }}
                                                    className="absolute bottom-4 right-4 w-10 h-10 bg-gray-900 !text-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-black z-10"
                                                >
                                                    <Plus size={20} className="text-white" />
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

                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex text-[#c17f59]">
                                                        {[...Array(5)].map((_, i) => {
                                                            const filled = avg >= i + 1 - 0.5;
                                                            return <Star key={i} size={14} fill={filled ? "currentColor" : "none"} />;
                                                        })}
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {label} ({count} {count === 1 ? "review" : "reviews"})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ))}
                        </div>

                        {products.length > 0 && (
                            <div className="flex justify-center mt-14">
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-full border text-sm font-medium transition-colors ${p === safePage
                                                ? "bg-[#c17f59] text-white border-[#c17f59] shadow-sm"
                                                : "bg-white text-gray-900 border-gray-200 supports-[hover:hover]:hover:border-gray-400"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400 font-serif mb-4">No products match your criteria.</p>
                        <button
                            onClick={() => {
                                navigate('/shop');
                                setPriceRange([0, 1000]);
                                setMinRating(0);
                            }}
                            className="px-8 py-3 bg-gray-900 !text-white rounded-full hover:bg-black transition-colors"
                        >
                            View All Products
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Shop;
