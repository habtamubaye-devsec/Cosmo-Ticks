import { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../api-service/products-service";
import { addToCart, getUserCart } from "../api-service/cart-service";
import { ShoppingCart } from "lucide-react";

function Products() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // Fetch products from API
  const getProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      setProducts(response.product || []); // adjust according to your API response
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's cart to sync state
  const getCart = async () => {
    try {
      const cart = await getUserCart();
      setCartItems(cart.products || []);
    } catch (error) {
      console.log("Could not fetch cart:", error.message);
    }
  };

  useEffect(() => {
    getProducts();
    getCart();
  }, []);

  // Add product to cart
  const handleAddToCart = async (product, e) => {
    e.stopPropagation(); // Prevent navigating to product page

    try {
      const data = await addToCart(product._id);
      setCartItems(data.cart.products || []);
      message.success(`${product.title} added to cart`);
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading products...</p>;

  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {products.map((product) => (
        <div
          key={product._id}
          className="flex flex-col items-center bg-white shadow-md rounded-lg p-4 w-[90%] sm:w-[45%] lg:w-[22%] cursor-pointer hover:shadow-xl transition"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {/* Product Image */}
          {product.img?.[0] && (
            <img
              src={product.img[0]}
              alt={product.title}
              className="h-[250px] sm:h-[300px] lg:h-[250px] w-full object-cover rounded-lg"
            />
          )}

          {/* Title */}
          <h2 className="mt-2 font-semibold text-lg text-center">{product.title}</h2>

          {/* Price and Add to Cart */}
          <div className="flex w-full justify-between items-center mt-4">
            <span className="text-lg">$ {product.oridinaryPrice}</span>
            <button
              onClick={(e) => handleAddToCart(product, e)}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
            >
              <ShoppingCart size={20} className="text-white"/>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Products;
