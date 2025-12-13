import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1, // ensures no negative or zero quantities
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: Number,
      default: 0, // 0 = active cart, 1 = checked out, etc.
    },
  },
  { timestamps: true }
);

// Optionally calculate total before saving
cartSchema.pre("save", async function (next) {
  if (!this.isModified("products")) return next();

  // Populate product prices
  await this.populate("products.product", "price");

  this.total = this.products.reduce((acc, item) => {
    return acc + item.quantity * (item.product?.price || 0);
  }, 0);

  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;