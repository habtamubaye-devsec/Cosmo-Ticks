import express from "express";
import {
  updateOrder,
  deleteOrder,
  getUserOrder,
  getAllOrders,
  createSingleOrder,
  createCartOrder,
} from "../Controller/order.controller.js";
import { validateToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-cart", validateToken, createCartOrder);
router.post("/create-single", validateToken, createSingleOrder);
router.put("/update/:id", validateToken, updateOrder);
router.delete("delete", deleteOrder);
router.get("/:userId", getUserOrder);
router.get("/", validateToken, getAllOrders);

export default router;
