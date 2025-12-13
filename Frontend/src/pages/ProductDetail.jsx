import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message, Spin, Button, Form, InputNumber } from "antd";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { getProductById } from "../api-service/products-service";
import { addToCart } from "../api-service/cart-service";
import OrderModal from "../components/orderModals";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ProductDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [form] = Form.useForm();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      setProduct(response.product || null);
    } catch (error) {
      message.error(error.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <Spin
        tip="Loading product..."
        className="mt-20 w-full flex justify-center"
      />
    );

  if (!product) return <p className="text-center mt-20">Product not found.</p>;

  const avgRating =
    product.ratings?.length > 0
      ? product.ratings.reduce((sum, r) => sum + r.star, 0) / product.ratings.length
      : 0;

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id);
      message.success(`${product.title} added to cart`);
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    }
  };

  const handleBuy = (values) => {
    const qty = values.quantity;
    if (qty < 1) {
      message.error("Quantity must be at least 1");
      return;
    }
    setSelectedQty(qty); // store quantity
    setModalVisible(true); // open modal
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header><Navbar /></header>

      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {Array.isArray(product.img) ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.img.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={product.title}
                      className="w-full h-[200px] object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={product.img}
                  alt={product.title}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              )}
              {product.video && (
                <video controls className="w-full h-[300px] mt-4 rounded-lg">
                  <source src={product.video} type="video/mp4" />
                </video>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <p className="text-gray-700">{product.description}</p>

              <div className="flex items-center gap-4 mt-2">
                <span className="text-xl font-bold">${product.oridinaryPrice}</span>
                {product.discountedPrice && product.discountedPrice !== product.oridinaryPrice && (
                  <span className="text-red-500 font-semibold line-through">${product.discountedPrice}</span>
                )}
              </div>

              <p className={`mt-1 font-semibold ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </p>

              <p><span className="font-semibold">Brand:</span> {product.brand}</p>
              <p><span className="font-semibold">Category:</span> {product.category?.join(", ")}</p>
              <p><span className="font-semibold">Concern:</span> {product.concern?.join(", ")}</p>
              <p><span className="font-semibold">Skin Type:</span> {product.skinType}</p>

              <div className="flex items-center gap-2 mt-2">
                <FaStar className="text-yellow-400" />
                <span className="font-semibold">{avgRating.toFixed(1)} / 5</span>
                <span className="text-gray-500">({product.ratings?.length || 0} reviews)</span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  type="primary"
                  icon={<FaShoppingCart />}
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>

                <Form form={form} layout="inline" onFinish={handleBuy} initialValues={{ quantity: 1 }} className="mt-2">
                  <Form.Item name="quantity" rules={[
                    { required: true, message: "Please enter quantity" },
                    { type: "number", min: 1, message: "Quantity must be at least 1" }
                  ]}>
                    <InputNumber min={1} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<FaShoppingCart />} className="bg-green-500 hover:bg-green-600">
                      Buy
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {(!product.ratings || product.ratings.length === 0) && <p>No reviews yet.</p>}
            {product.ratings?.map((r) => (
              <div key={r._id || Math.random()} className="border-b py-2">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">{r.star} / 5</span>
                  <span className="text-gray-600">by {r.name}</span>
                </div>
                <p className="ml-6">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer><Footer /></footer>

      {modalVisible && (
        <OrderModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          product={product}
          quantity={selectedQty}
          total={product.oridinaryPrice * selectedQty}
        />
      )}
    </div>
  );
}

export default ProductDetail;
