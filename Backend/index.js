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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to DB
dbConnection();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser()); // Initialize cookie-parser

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/banner", bannerRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);

// Error handlers (should come last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
});
