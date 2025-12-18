import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnection from "./src/config/db-connection.js";
import { errorHandler, notFound } from "./src/Middleware/error.middleware.js";
import authRoutes from "./src/Route/authRoute.js";
import productRoutes from "./src/Route/productRoute.js";
import bannerRoutes from "./src/Route/bannerRoute.js";
import userRoutes from "./src/Route/userRoute.js";
import cartRoutes from './src/Route/cartRoute.js'
import orderRoutes from "./src/Route/orderRoutes.js";
import wishlistRoutes from "./src/Route/wishlistRoute.js";
import categoryRoutes from "./src/Route/categoryRoute.js";
import { handleStripeWebhook } from "./src/Controller/order.controller.js";
import passport from "./src/config/passport.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Connect to DB
dbConnection();

// ✅ 1. RAW body ONLY for Stripe webhook
app.post(
  "/api/v1/order/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser()); // Initialize cookie-parser
app.use(passport.initialize()); // Initialize Passport

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/banner", bannerRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/category", categoryRoutes);

// Error handlers (should come last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
});
