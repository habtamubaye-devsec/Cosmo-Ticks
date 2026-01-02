import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    products: {
      type: Array,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },

    // Email idempotency flags (do not overload order status)
    pendingEmailSent: {
      type: Boolean,
      default: false,
    },
    pendingEmailSentAt: {
      type: Date,
    },
    deliveredEmailSent: {
      type: Boolean,
      default: false,
    },
    deliveredEmailSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order