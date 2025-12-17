import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../api-service/products-service";
import { Heart, Plus, Star } from "lucide-react";
import { useShop } from "../context/ShopContext";

function Products() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { handleAddToCart, handleAddToWishlist, wishlistIds } = useShop();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Note: getAllProducts fetches everything. Optimally we'd paginate.
      const response = await getAllProducts();
      setProducts(response.product || []);
    } catch (error) {
      console.log("Could not fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBadges = (index) => {
    const badgeOptions = [
      [{ text: "Bestseller", bg: "bg-white", textCol: "text-gray-900" }],
      [{ text: "Vegan", bg: "bg-white", textCol: "text-gray-900" }],
      [{ text: "Cruelty-Free", bg: "bg-[#f5f5f3]", textCol: "text-gray-600" }],
      [{ text: "New", bg: "bg-black", textCol: "text-white" }],
    ];
    return badgeOptions[index % badgeOptions.length];
  };

  const getRandomRating = () => (Math.random() * 0.5 + 4.5).toFixed(1);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {products.slice(0, 6).map((product, index) => (
            <div
              key={product._id}
              className="group cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              {/* Image Container - Specific Beige Background */}
              <div className="relative aspect-[4/5] bg-[#f2f2f0] rounded-2xl overflow-hidden mb-6 transition-all duration-500 hover:shadow-lg">
                <img
                  src={product.img?.[0]}
                  alt={product.title}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                />

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

                {/* Wishlist Heart */}
                <button
                  className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(product._id);
                  }}
                >
                  <Heart
                    size={16}
                    className={wishlistIds.has(product._id) ? "text-red-500 fill-red-500" : "text-gray-900"}
                    fill={wishlistIds.has(product._id) ? "currentColor" : "none"}
                  />
                </button>

                {/* Quick Add Button (Visible on Hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product._id);
                  }}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-gray-900 !text-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-black"
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
                  <h3 className="font-serif text-xl text-gray-900 group-hover:text-[#c17f59] transition-colors leading-tight max-w-[80%]">
                    {product.title}
                  </h3>
                  <span className="font-medium text-lg text-gray-900">
                    ${product.oridinaryPrice?.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-[#c17f59]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{getRandomRating()} (128 reviews)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;
