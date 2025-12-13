import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProduct,
  ratingProduct,
} from "../Controller/product.controller.js";
import validateToken from "../Middleware/auth.middleware.js";
import upload from "../Middleware/uploadImg.js";

const router = express.Router();

// Create a product (with images)
router.post("/create", upload.array("media", 5), createProduct);

// Update product (optionally with new images)
router.put("/update/:id", upload.array("media", 5), updateProduct);

// Delete a product
router.delete("/delete/:id", validateToken, deleteProduct);

// Get a single product
router.get("/:id", getProduct);

// Get all products
router.get("/", getAllProduct);

// Rating
router.put("/rating/:productId", validateToken, ratingProduct);

export default router;
