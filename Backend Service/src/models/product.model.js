import mongoose from "mongoose";

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
    type: String,
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
  ratings: [
    {
      star: { type: Number },
      name: { type: String },
      comment: { type: String },
      postedBy: { type: String },
    },
  ],
 },{ timestamps: true }
);

productSchema.index({ "$**": "text" });
const Product = mongoose.model("Product", productSchema);
export default Product;