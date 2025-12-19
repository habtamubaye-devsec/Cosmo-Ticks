import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    star: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    // User who posted the review (populate name/email from User model)
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
 {
   title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  whatInbox: {
    type: String,
    required: true,
  },
  img: {
    type: Array,
    required: true,
  },
  video: {
    type: String,
  },
  wholeSalePrice: {
    type: Number,
  },
  WholeSaleMinimumQuantity: {
    type: Number,
  },
  category: {
    type: Array,
  },
  concern: {
    type: Array,
  },
  brand: {
    type: String,
  },
  skinType: {
    type: String,
  },
  oridinaryPrice: {
    type: Number,
  },
  discountedPrice: {
    type: Number,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  ratings: [ratingSchema],
 },{ timestamps: true }
);
  
productSchema.index({ "$**": "text" });
const Product = mongoose.model("Product", productSchema);
export default Product;