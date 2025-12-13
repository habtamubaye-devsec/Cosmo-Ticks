import { useState, useEffect } from "react";
import { message } from "antd";
import {
  getUserCart,
  clearCart as clearCartService,
  updateCartItem,
  removeCartItemService,
} from "../api-service/cart-service";
import OrderModal from "../components/orderModals";
import { Trash2 } from "lucide-react";

function Cart({ userId }) {
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch cart data
  const getdata = async () => {
    try {
      setLoading(true);
      const data = await getUserCart(userId);
      setCartItems(data.products || []);
      const qty = {};
      data.products?.forEach((item) => {
        qty[item.product._id] = item.quantity;
      });
      setQuantities(qty);
    } catch (error) {
      message.error(error.message);
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
      message.success("Product removed");
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    }
  };

  const increase = async (id) => {
    const newQty = quantities[id] + 1;
    await updateCartItem(id, newQty);
    setQuantities((prev) => ({ ...prev, [id]: newQty }));
  };

  const decrease = async (id) => {
    const newQty = Math.max(1, quantities[id] - 1);
    await updateCartItem(id, newQty);
    setQuantities((prev) => ({ ...prev, [id]: newQty }));
  };

  const clearCart = async () => {
    try {
      await clearCartService();
      setCartItems([]);
      setQuantities({});
      message.success("Cart cleared");
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold my-6 text-center">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mx-4 lg:mx-10">
          {/* Cart Items */}
          <div className="flex-2 flex flex-col gap-6">
            {cartItems.map((item) => (
              <div
                key={item.product._id}
                className="p-4 rounded-lg flex flex-col md:flex-row items-center gap-4 shadow-md"
              >
                <img
                  src={item.product.img}
                  alt={item.product.title}
                  className="h-32 w-32 object-cover rounded-md"
                />

                <div className="flex-1 flex flex-col">
                  <h2 className="font-semibold text-lg">
                    {item.product.title}
                  </h2>
                  <p className="text-gray-700 mt-1">
                    {item.product.description}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-2 bg-gray-200 rounded"
                      onClick={() => decrease(item.product._id)}
                    >
                      -
                    </button>
                    <span className="w-12 text-center border rounded px-2">
                      {quantities[item.product._id]}
                    </span>
                    <button
                      className="px-2 bg-gray-500 text-white rounded"
                      onClick={() => increase(item.product._id)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-5">
                  <p>
                    $
                    {item.product.oridinaryPrice * quantities[item.product._id]}
                  </p>
                  <button
                    className="text-white bg-green-500 px-2 py-1 rounded"
                    onClick={() => {
                      setSelectedProduct(item);
                      setModalVisible(true);
                    }}
                  >
                    Check Out
                  </button>
                  <button
                    className="hover:cursor-pointer hover:bg-gray-100 p-5 rounded-full"
                    onClick={() => removeItem(item.product._id)}
                  >
                    <Trash2 className="text-red-600 font-bold text-right" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/4 shadow-md p-4 rounded-lg flex flex-col gap-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <p>
              Total Items:{" "}
              {cartItems.reduce(
                (sum, item) => sum + quantities[item.product._id],
                0
              )}
            </p>
            <p>
              Total Price: $
              {cartItems.reduce(
                (sum, item) =>
                  sum +
                  item.product.oridinaryPrice * quantities[item.product._id],
                0
              )}
            </p>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              Proceed Checkout
            </button>
            <button
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {modalVisible && selectedProduct && (
        <OrderModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          product={selectedProduct}
          productId={selectedProduct.product._id}
          quantity={quantities[selectedProduct.product._id]}
          total={
            selectedProduct.product.oridinaryPrice *
            quantities[selectedProduct.product._id]
          }
          refreshCart={getdata}
        />
      )}
    </div>
  );
}

export default Cart;
