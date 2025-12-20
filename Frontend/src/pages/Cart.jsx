import { useState, useEffect } from "react";
import { message } from "antd";
import {
  getUserCart,
  clearCart as clearCartService,
  updateCartItem,
  removeCartItemService,
} from "../api-service/cart-service";
import { createCartCheckoutSessionService } from "../api-service/order-service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { refreshShop, handleAddToWishlist } = useShop();

  const getdata = async () => {
    try {
      setLoading(true);
      const data = await getUserCart();
      setCartItems(data.products || []);
      const qty = {};
      data.products?.forEach((item) => {
        qty[item.product._id] = item.quantity;
      });
      setQuantities(qty);
    } catch (error) {
      console.log("Cart empty or error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getdata();
  }, []);

  const removeItem = async (productId) => {
    try {
      const data = await removeCartItemService(productId);
      setCartItems(data.cart.products || []);
      setQuantities((prev) => {
        const newQty = { ...prev };
        delete newQty[productId];
        return newQty;
      });
      message.success("Item removed");
      refreshShop(); // Update global cart count
    } catch (error) {
      message.error("Could not remove item");
    }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    setQuantities((prev) => ({ ...prev, [id]: newQty }));
    try {
      await updateCartItem(id, newQty);
      // Debounced refresh could be better but this is fine for now
      refreshShop();
    } catch (error) {
      getdata();
    }
  };

  const clearCart = async () => {
    try {
      await clearCartService();
      setCartItems([]);
      setQuantities({});
      message.success("Cart cleared");
      refreshShop(); // Update global cart count
    } catch (error) {
      message.error(error.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) =>
      sum + (item.product.oridinaryPrice * quantities[item.product._id]), 0
    );
  };

  const handleCheckout = async () => {
    try {
      if (!cartItems.length) return;
      setLoading(true);

      const products = cartItems.map((item) => ({
        productId: item.product._id,
        quantity: quantities[item.product._id] || item.quantity || 1,
      }));

      const sessionData = await createCartCheckoutSessionService(products);
      if (sessionData?.url) {
        window.location.href = sessionData.url;
        return;
      }

      throw new Error("Checkout session creation failed");
    } catch (error) {
      console.error(error);
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to checkout";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h1 className="font-serif text-4xl text-gray-900 mb-10">Shopping Bag</h1>

          {cartItems.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBag size={64} className="text-gray-200 mb-6" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">Your bag is empty</h2>
              <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gray-900 !text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Cart Items */}
              <div className="flex-1 space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex gap-6 p-4 border border-gray-100 rounded-2xl"
                  >
                    <div className="w-28 h-28 flex-shrink-0 bg-[#f5f5f3] rounded-xl overflow-hidden">
                      <img
                        src={item.product.img}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                          <p className="text-sm text-gray-500">{item.product.category?.[0]}</p>
                        </div>
                        <p className="font-medium">${item.product.oridinaryPrice?.toFixed(2)}</p>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2">
                          <button
                            className="p-2"
                            onClick={() => updateQuantity(item.product._id, quantities[item.product._id] - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{quantities[item.product._id]}</span>
                          <button
                            className="p-2"
                            onClick={() => updateQuantity(item.product._id, quantities[item.product._id] + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              await handleAddToWishlist(item.product._id);
                              await removeItem(item.product._id);
                              message.success("Moved to wishlist");
                            }}
                            className="text-gray-400 hover:text-[#c17f59] transition-colors p-2"
                            title="Move to Wishlist"
                          >
                            <Heart size={18} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:underline"
                >
                  Clear bag
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:w-[380px] flex-shrink-0">
                <div className="bg-[#f7f5f0] p-6 rounded-2xl sticky top-24">
                  <h2 className="font-serif text-xl text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-3.5 bg-gray-900 !text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    Checkout <ArrowRight size={18} />
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    Taxes calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
