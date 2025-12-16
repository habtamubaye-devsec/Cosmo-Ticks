import express from "express";
import { clearCart, createCart, getCartByUser, removeCartItem, updateCartItem} from "../Controller/cart.controller.js";
import {validateToken} from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", validateToken, createCart);
router.put("/update", validateToken, updateCartItem);
router.get("/", validateToken, getCartByUser);
router.delete("/clear", validateToken, clearCart);
router.delete("/remove", validateToken, removeCartItem);

export default router;