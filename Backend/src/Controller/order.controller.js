import asyncHandler from "express-async-handler";
import Order from "../models/order.model.js";
import User from '../models/user.model.js';
import Cart from "../models/cart.model.js";
import Product from '../models/product.model.js'

// Create order from multiple items (cart)
const createCartOrder = asyncHandler(async (req, res) => {
  const { products, total, address, phone } = req.body;
  const userId = req.user?._id;

  if (!products || !products.length) {
    res.status(400);
    throw new Error("Products are required");
  }
  if (!total) {
    res.status(400);
    throw new Error("Total is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const order = await Order.create({
    name: user.name,
    email: user.email,
    user: userId,
    products, // array of product IDs
    total,
    address,
    phone,
  });

  res.status(201).json({ message: "Cart order created successfully", order });
});

// Create order for single item
const createSingleOrder = asyncHandler(async (req, res) => {
  const { cartProduct, quantity, total, address, phone } = req.body;
  const userId = req.user?._id;

  if (!cartProduct) {
    res.status(400);
    throw new Error("Product ID is required");
  }
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }
  if (!total) {
    res.status(400);
    throw new Error("Total is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Create order
  const order = await Order.create({
    name: user.name,
    email: user.email,
    user: userId,
    products: [cartProduct], // single product as an array
    total,
    address,
    phone,
  });

  // Remove the ordered product from cart
 await Cart.updateOne(
    { user: userId },
    { $pull: { products: { product: cartProduct } } }
  );

  // await Product.updateOne(
  //   { _id: cartProduct },
  //   { $inc: { quantity: -quantity } } // decrease stock
  // );
  res.status(201).json({ message: "Single item order created successfully", order });
});

// UPDATE ORDER
const updateOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { $set: req.body },
    { new: true }
  );

  if (updatedOrder) {
    res
      .status(200)
      .json({ message: "Order Updated Successfully", order: updatedOrder });
  } else {
    res.status(404);
    throw new Error("Order Not Found");
  }
});

// DELETE ORDER
const deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const deletedOrder = await Order.findByIdAndDelete(orderId);

  if (deletedOrder) {
    res
      .status(200)
      .json({ message: "Order Deleted Successfully", deletedOrder });
  } else {
    res.status(404);
    throw new Error("Order Not Found");
  }
});

// GET USER ORDERS
const getUserOrder = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const orders = await Order.find({ user: userId })
    .populate("products", "title img discountedPrice")
    .sort({ createdAt: -1 });

  if (orders && orders.length > 0) {
    res.status(200).json({ message: "Orders Fetched Successfully", orders });
  } else {
    res.status(404);
    throw new Error("Orders Not Found");
  }
});

// GET ALL ORDERS
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email") // populate user details
    .populate("products", "title discountedPrice") // populate products
    .sort({ createdAt: -1 });

  if (orders && orders.length > 0) {
    res.status(200).json({
      message: "Orders Fetched Successfully",
      data: orders,
    });
  } else {
    res.status(404).json({ message: "No Orders Found" });
  }
});

export { createSingleOrder, createCartOrder, updateOrder, deleteOrder, getUserOrder, getAllOrders };
