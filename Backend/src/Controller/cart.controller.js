import asyncHandler from "express-async-handler";
import Cart from "../models/cart.model.js";

// CREATE CART / ADD PRODUCT
const createCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    // Remove any null products (deleted references)
    cart.products = cart.products.filter((item) => item.product);

    // Check if product already exists
    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex > -1) {
      // Increment quantity if exists
      cart.products[productIndex].quantity += 1;
    } else {
      // Add new product
      cart.products.push({ product: productId, quantity: 1 });
    }
  } else {
    // Create cart if it doesn't exist
    cart = new Cart({
      user: req.user._id,
      products: [{ product: productId, quantity: 1 }],
    });
  }

  const savedCart = await cart.save();

  res.status(201).json({
    message: "Product added to cart successfully",
    cart: savedCart,
  });
});

// UPDATE PRODUCT QUANTITY
const updateCartItem = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  const { productId, quantity } = req.body;

  if (!productId || quantity == null) {
    res.status(400);
    throw new Error("Product ID and quantity are required");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const productIndex = cart.products.findIndex(
    (item) => item.product.toString() === productId
  );

  if (productIndex > -1) {
    if (quantity <= 0) {
      // remove product if quantity is 0
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = quantity;
    }
    const updatedCart = await cart.save();
    res.json({ message: "Cart updated", cart: updatedCart });
  } else {
    res.status(404);
    throw new Error("Product not found in cart");
  }
});

// GET CART BY USER ID
const getCartByUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // only use logged-in user

  if (!userId) {
    res.status(400);
    throw new Error("User not authenticated");
  }

  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product",
    "title oridinaryPrice img description"
  );

  // Return empty cart if none exists
  if (!cart) {
    return res.json({ user: userId, products: [] });
  }

  res.json(cart);
});

// CLEAR CART
const clearCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { products: [], total: 0 } },
    { new: true }
  );

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  res.json({ message: "Cart cleared", cart });
});

// DELETE /api/v1/cart/remove
const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const index = cart.products.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index > -1) {
    cart.products.splice(index, 1); // remove product
    await cart.save();
    res.json({ message: "Product removed from cart", cart });
  } else {
    res.status(404);
    throw new Error("Product not found in cart");
  }
});


export { createCart, updateCartItem, getCartByUser, clearCart ,removeCartItem};
