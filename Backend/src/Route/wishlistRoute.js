import express from "express";
import { addProductToWishlist, getWishlist, removeProductFromWishlist } from "../Controller/wishlist.controller.js";
import { validateToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", validateToken, addProductToWishlist);
router.get("/", validateToken, getWishlist);
router.post("/remove", validateToken, removeProductFromWishlist);

export default router;