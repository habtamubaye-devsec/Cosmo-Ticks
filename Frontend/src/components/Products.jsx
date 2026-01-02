import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../api-service/products-service";
import { Heart, Plus, Star, Filter, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { message } from "antd";

function Products() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const navigate = useNavigate();
  const { handleAddToCart, handleAddToWishlist, handleRemoveFromWishlist, wishlistIds } = useShop();

  const pageSize = 16;

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        minPrice: priceRange[0] || undefined,
        maxPrice: priceRange[1] || undefined,
        minRating: minRating || undefined,
      };
      const response = await getAllProducts(params);
      setProducts(response.product || []);
    } catch (error) {
      console.log("Could not fetch products", error);
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [priceRange, minRating]);

  const getBadges = (index) => {
    const badgeOptions = [
      [{ text: "Bestseller", bg: "bg-white", textCol: "text-gray-900" }],
      [{ text: "Vegan", bg: "bg-white", textCol: "text-gray-900" }],
      [{ text: "Cruelty-Free", bg: "bg-[#f5f5f3]", textCol: "text-gray-600" }],
      [{ text: "New", bg: "bg-black", textCol: "text-white" }],
    ];
    return badgeOptions[index % badgeOptions.length];
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

  if (loading) return (
    <div className="flex justify-center py-20 bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl text-gray-900 mb-4">Bestselling Essentials</h2>
          <p className="text-gray-500 text-lg">Discover our curated collection of clean, effective skincare</p>
        </div>

        {/* Unified Filter Toolbar */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
          <p className="text-gray-500">{products.length} Product{products.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 font-medium transition-colors ${showFilters ? 'text-[#c17f59]' : 'text-gray-900'} hover:text-[#c17f59]`}
            id="filter-toggle-home"
          >
            <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Filter'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-[#fcfaf7] rounded-2xl p-6 mb-12 border border-[#f3eee7] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {/* Price Range */}
              <div>
                <h4 className="font-serif text-lg mb-4 text-gray-900">Price Range</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 uppercase block mb-1">Min ($)</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#c17f59] text-gray-900"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 uppercase block mb-1">Max ($)</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#c17f59] text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-serif text-lg mb-4 text-gray-900">Minimum Rating</h4>
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
                  <span className="ml-2 text-sm text-gray-500 font-medium">
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
                  className="text-sm font-semibold text-gray-500 hover:text-[#c17f59] underline underline-offset-4 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}

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
                  {/* Image Container - Specific Beige Background (matches global now or transparent) */}
                  <div className="relative aspect-[4/5] bg-[#f9f7f2] rounded-2xl overflow-hidden mb-6 transition-all duration-500 supports-[hover:hover]:hover:shadow-lg group-hover:-translate-y-1">
                    <img
                      src={product.img?.[0]}
                      alt={product.title}
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                    />

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

                    {/* Wishlist Heart - Toggle Logic */}
                    <button
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm supports-[hover:hover]:hover:shadow-md transition-all supports-[hover:hover]:hover:scale-110 z-10"
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
                        size={18}
                        className={`transition-colors duration-300 ${wishlistIds.has(product._id) ? "text-red-500 fill-red-500" : "text-gray-900"}`}
                        fill={wishlistIds.has(product._id) ? "currentColor" : "none"}
                      />
                    </button>

                    {/* Quick Add Button (Visible on Hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product._id);
                      }}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-gray-900 !text-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl supports-[hover:hover]:hover:bg-black hover:scale-105 z-10"
                    >
                      <Plus size={22} className="text-white" />
                    </button>
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {product.category?.[0] || "SKINCARE"}
                    </p>

                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif text-xl text-gray-900 group-hover:text-[#c17f59] transition-colors leading-tight max-w-[80%]">
                        {product.title}
                      </h3>
                      <span className="font-medium text-lg text-gray-900">
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
      </div>
    </div>
  );
}

export default Products;
