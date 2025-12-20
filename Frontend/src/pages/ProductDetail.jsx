import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message, Modal, Tabs, Rate, Input } from "antd";
import { Star, Heart, Truck, RotateCcw, ShieldCheck, PencilLine, Trash2 } from "lucide-react";
import { getProductById, addProductReview, deleteProductReview } from "../api-service/products-service";
import { addToCart } from "../api-service/cart-service";
import { createSingleCheckoutSessionService } from "../api-service/order-service";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useShop } from "../context/ShopContext";

function ProductDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ star: 5, comment: "" });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    user,
    handleAddToCart: addToCartContext,
    handleAddToWishlist,
    handleRemoveFromWishlist,
    wishlistIds,
  } = useShop();

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

  useEffect(() => { fetchProduct(); }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Product not found.</p></div>;

  const handleAddToCart = async () => { await addToCartContext(product._id, quantity); };

  const handleReviewSubmit = async () => {
    try {
      if (!user?._id) {
        message.error("Please login to write a review");
        return;
      }
      if (!reviewForm.comment) return message.warning("Please write a comment");
      setLoading(true);
      await addProductReview(product._id, reviewForm);
      message.success(isEditingReview ? "Review updated successfully" : "Review submitted successfully");
      setReviewModalVisible(false);
      setReviewForm({ star: 5, comment: "" });
      setIsEditingReview(false);
      fetchProduct();
    } catch (error) {
      message.error("Failed to submit review");
    } finally { setLoading(false); }
  };

  const openReviewModal = () => {
    if (!user?._id) {
      message.error("Please login to write a review");
      return;
    }

    const myReview = product?.ratings?.find((r) => String(r.postedBy?._id ?? r.postedBy) === String(user._id));
    if (myReview) {
      setReviewForm({ star: myReview.star || 5, comment: myReview.comment || "" });
      setIsEditingReview(true);
    } else {
      setReviewForm({ star: 5, comment: "" });
      setIsEditingReview(false);
    }
    setReviewModalVisible(true);
  };

  const handleDeleteReview = async () => {
    try {
      if (!user?._id) {
        message.error("Please login first");
        return;
      }
      setLoading(true);
      await deleteProductReview(product._id);
      message.success("Review deleted successfully");
      setReviewForm({ star: 5, comment: "" });
      setIsEditingReview(false);
      fetchProduct();
    } catch (error) {
      message.error("Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      // Free product -> add to cart
      if (!product.oridinaryPrice || product.oridinaryPrice === 0) {
        await addToCartContext(product._id, quantity);
        message.success("Product added to cart");
        return;
      }

      // Paid product -> create Stripe checkout session
      const sessionData = await createSingleCheckoutSessionService(product._id, quantity);
      if (sessionData.url) {
        window.location.href = sessionData.url; // Redirect user to Stripe checkout
      } else {
        throw new Error("Checkout session creation failed");
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to checkout";
      message.error(msg);
    }
  };

  const productImages = Array.isArray(product.img) ? product.img : [product.img];
  const reviewCount = product.ratings?.length || 0;
  const avgRatingNumber = reviewCount
    ? product.ratings.reduce((sum, r) => sum + Number(r.star || 0), 0) / reviewCount
    : 0;
  const avgRatingLabel = avgRatingNumber ? avgRatingNumber.toFixed(1) : "0.0";
  const myReview = user?._id
    ? product?.ratings?.find((r) => String(r.postedBy?._id ?? r.postedBy) === String(user._id))
    : null;

  const tabItems = [
    { key: '1', label: 'Description', children: <div className="text-gray-600 leading-relaxed py-4">{product.description}</div> },
    { key: '2', label: 'Ingredients', children: <div className="text-gray-600 leading-relaxed py-4"><ul className="list-disc list-inside mt-4 space-y-2"><li>Hyaluronic Acid</li><li>Vitamin C</li><li>Niacinamide</li><li>Organic Aloe Vera</li></ul></div> },
    { key: '3', label: `Reviews (${product.ratings?.length || 0})`, children: (
      <div className="py-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-serif">Customer Reviews</h3>
          <button onClick={openReviewModal} className="px-4 py-2 border border-gray-900 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors">{user ? (myReview ? 'Edit Your Review' : 'Write a Review') : 'Write a Review'}</button>
        </div>
        {(!product.ratings || product.ratings.length === 0) && <p className="text-gray-400 italic">No reviews yet. Be the first!</p>}

        {(() => {
          const uid = user?._id ? String(user._id) : null;
          const ratings = Array.isArray(product.ratings) ? product.ratings : [];
          const my = uid ? ratings.find((r) => String(r.postedBy?._id ?? r.postedBy) === uid) : null;
          const others = uid ? ratings.filter((r) => String(r.postedBy?._id ?? r.postedBy) !== uid) : ratings;
          const ordered = my ? [my, ...others] : others;

          return ordered.map((r, i) => {
            const isMine = uid && String(r.postedBy?._id ?? r.postedBy) === uid;
            return (
          <div key={i} className="border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-yellow-400">{[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill={idx < r.star ? "currentColor" : "none"} />)}</div>
              <span className="font-medium text-sm">{r.postedBy?.name || r.name || "Anonymous"}</span>
              {isMine && <span className="text-xs text-gray-400">(Your review)</span>}
            </div>
            <p className="text-gray-600 text-sm">{r.comment}</p>

            {isMine && (
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={openReviewModal}
                  aria-label="Edit review"
                  title="Edit"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-900 supports-[hover:hover]:hover:border-gray-400 transition-colors"
                  type="button"
                >
                  <PencilLine size={18} />
                </button>
                <button
                  onClick={handleDeleteReview}
                  aria-label="Delete review"
                  title="Delete"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-red-600 supports-[hover:hover]:hover:border-red-300 transition-colors"
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
            );
          });
        })()}
      </div>
    )},
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
                <img src={productImages[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3 overflow-x-auto">
                {productImages.map((img, idx) => (
                  <button key={idx} className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-gray-900' : 'border-transparent opacity-60 hover:opacity-100'}`} onClick={() => setSelectedImage(idx)}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2">
              <p className="text-sm text-[#c17f59] tracking-widest uppercase mb-2">{product.category?.[0] || "Skincare"}</p>
              <h1 className="font-serif text-4xl text-gray-900 mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => {
                      const filled = avgRatingNumber >= i + 1 - 0.5;
                      return <Star key={i} size={16} fill={filled ? "currentColor" : "none"} />;
                    })}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">{avgRatingLabel}</span>
                </div>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>

                {myReview ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openReviewModal}
                      aria-label="Edit review"
                      title="Edit"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-900 supports-[hover:hover]:hover:border-gray-400 transition-colors"
                    >
                      <PencilLine size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteReview}
                      aria-label="Delete review"
                      title="Delete"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-red-600 supports-[hover:hover]:hover:border-red-300 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openReviewModal}
                    className="text-sm font-medium text-gray-900 supports-[hover:hover]:hover:underline"
                  >
                    Write a review
                  </button>
                )}
              </div>

              <p className="text-3xl font-medium text-gray-900 mb-6">${product.oridinaryPrice?.toFixed(2)}</p>
              <p className="text-gray-600 leading-relaxed mb-8">{product.description?.substring(0, 200)}...</p>

              {/* Quantity & Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-full">
                  <button className="px-4 py-2 text-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button className="px-4 py-2 text-lg" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>

                <button onClick={handleAddToCart} className="flex-1 py-3.5 bg-gray-900 !text-white rounded-full font-medium hover:bg-gray-800 transition-colors">Add to Cart</button>

                <button
                  type="button"
                  onClick={() => {
                    if (wishlistIds.has(product._id)) {
                      handleRemoveFromWishlist(product._id);
                    } else {
                      handleAddToWishlist(product._id);
                    }
                  }}
                  className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Heart size={20} className={wishlistIds.has(product._id) ? "text-red-500 fill-red-500" : "text-gray-600"} fill={wishlistIds.has(product._id) ? "currentColor" : "none"} />
                </button>
              </div>

              <button onClick={handleBuyNow} className="w-full py-3.5 bg-white text-gray-900 border border-gray-900 rounded-full font-medium transition-shadow mb-8 supports-[hover:hover]:hover:shadow-lg">Buy Now</button>

              <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600"><Truck size={18} /> Free Shipping</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><RotateCcw size={18} /> Easy Returns</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><ShieldCheck size={18} /> Secure Checkout</div>
              </div>

              <Tabs items={tabItems} className="mt-6" />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Modal
        title={isEditingReview ? "Edit Your Review" : "Write a Review"}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setIsEditingReview(false);
        }}
        onOk={handleReviewSubmit}
        okText={isEditingReview ? "Update Review" : "Submit Review"}
        okButtonProps={{ className: "bg-gray-900 !text-white hover:bg-black" }}
      >
        <div className="flex flex-col gap-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <Rate value={reviewForm.star} onChange={(val) => setReviewForm({ ...reviewForm, star: val })} className="text-yellow-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
            <Input.TextArea rows={4} placeholder="Share your thoughts about this product..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProductDetail;
