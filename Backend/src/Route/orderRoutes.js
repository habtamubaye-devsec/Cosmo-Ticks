import express from "express";
import {
  updateOrder,
  deleteOrder,
  getUserOrder,
  getAllOrders,
  createSingleCheckoutSession,
  createCartCheckoutSession,
  handleStripeWebhook,
  confirmCheckoutSession,
} from "../Controller/order.controller.js";
import { validateAdmin, validateToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

// ------------------- STRIPE PAYMENT / CHECKOUT -------------------
// Single product checkout session
router.post(
  "/checkout/single/:productId",
  validateToken,
  createSingleCheckoutSession
);

// Cart checkout session
router.post("/checkout/cart", validateToken, createCartCheckoutSession);

// Confirm checkout session (fallback for localhost when webhooks aren't delivered)
router.post("/confirm", validateToken, confirmCheckoutSession);

// Stripe webhook (no token validation needed; raw body required)
router.post("/webhook", handleStripeWebhook);

// ------------------- ORDERS CRUD -------------------
router.put("/update/:id", validateAdmin, updateOrder);
router.delete("/delete/:id", validateAdmin, deleteOrder);
router.get("/user/:userId", validateToken, getUserOrder);
router.get("/", validateAdmin, getAllOrders);

export default router;
