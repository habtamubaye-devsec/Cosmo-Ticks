import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message, Tabs } from "antd";
import { Star, Heart, Truck, RotateCcw, ShieldCheck } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      setProduct(response.product || null);
    } catch (error) {
      message.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Product not found.</p>
    </div>
  );

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id);
      message.success(`${product.title} added to cart`);
    } catch (error) {
      message.error("Could not add to cart");
    }
  };

  const productImages = Array.isArray(product.img) ? product.img : [product.img];
  const avgRating = product.ratings?.length > 0
    ? (product.ratings.reduce((a, b) => a + b.star, 0) / product.ratings.length).toFixed(1)
    : "4.8";

  const tabItems = [
    {
      key: '1',
      label: 'Description',
      children: (
        <div className="text-gray-600 leading-relaxed py-4">
          <p>{product.description}</p>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Ingredients',
      children: (
        <div className="text-gray-600 leading-relaxed py-4">
          <p>Clean, sustainable ingredients carefully selected for your skin.</p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li>Hyaluronic Acid</li>
            <li>Vitamin C</li>
            <li>Niacinamide</li>
            <li>Organic Aloe Vera</li>
          </ul>
        </div>
      ),
    },
    {
      key: '3',
      label: `Reviews (${product.ratings?.length || 0})`,
      children: (
        <div className="py-4 space-y-4">
          {(!product.ratings || product.ratings.length === 0) && (
            <p className="text-gray-400 italic">No reviews yet. Be the first!</p>
          )}
          {product.ratings?.map((r, i) => (
            <div key={i} className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} fill={idx < r.star ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="font-medium text-sm">{r.name}</span>
              </div>
              <p className="text-gray-600 text-sm">{r.comment}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

            {/* Gallery */}
            <div className="lg:w-1/2">
              <div className="aspect-square bg-[#f5f5f3] rounded-2xl overflow-hidden mb-4">
                <img
                  src={productImages[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3 overflow-x-auto">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-gray-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2">
              <p className="text-sm text-[#c17f59] tracking-widest uppercase mb-2">
                {product.category?.[0] || "Skincare"}
              </p>

              <h1 className="font-serif text-4xl text-gray-900 mb-4">{product.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">{avgRating}</span>
                </div>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">{product.ratings?.length || 0} reviews</span>
              </div>

              <p className="text-3xl font-medium text-gray-900 mb-6">
                ${product.oridinaryPrice?.toFixed(2)}
              </p>

              <p className="text-gray-600 leading-relaxed mb-8">
                {product.description?.substring(0, 200)}...
              </p>

              {/* Quantity & Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-full">
                  <button
                    className="px-4 py-2 text-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button
                    className="px-4 py-2 text-lg"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Add to Cart
                </button>

                <button className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors">
                  <Heart size={20} className="text-gray-600" />
                </button>
              </div>

              <button
                onClick={() => setModalVisible(true)}
                className="w-full py-3.5 border border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-colors mb-8"
              >
                Buy Now
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck size={18} /> Free Shipping
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw size={18} /> Easy Returns
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck size={18} /> Secure Checkout
                </div>
              </div>

              {/* Tabs */}
              <Tabs items={tabItems} className="mt-6" />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {modalVisible && (
        <OrderModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          product={product}
          quantity={quantity}
          total={product.oridinaryPrice * quantity}
        />
      )}
    </div>
  );
}

export default ProductDetail;
