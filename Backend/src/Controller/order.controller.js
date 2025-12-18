  import Stripe from "stripe";
  import asyncHandler from "express-async-handler";
  import Order from "../models/order.model.js";
  import User from "../models/user.model.js";
  import Cart from "../models/cart.model.js";
  import Product from "../models/product.model.js";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("Stripe Key Loaded:", !!process.env.STRIPE_SECRET_KEY);
  console.log("Stripe Webhook Secret Loaded:", !!process.env.STRIPE_WEBHOOK_SECRET);

  // ========================
  // Create Stripe Checkout Session for Single Product
  // POST /api/v1/order/checkout/single/:productId
  // ========================
  export const createSingleCheckoutSession = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: product.title },
              unit_amount: Math.round(product.discountedPrice * 100),
            },
            quantity,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/order/success?productId=${product._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/order/cancel`,
        metadata: {
          userId: userId.toString(),
          productId: product._id.toString(),
          quantity: (quantity || 1).toString(),
        }
      });

      res.status(200).json({ success: true, url: session.url });
    } catch (err) {
      console.error("Stripe Checkout Session Error:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ========================
  // Create Stripe Checkout Session for Cart (Multiple Products)
  // POST /api/v1/order/checkout/cart
  // ========================
  export const createCartCheckoutSession = asyncHandler(async (req, res) => {
    const { products } = req.body; // [{ productId, quantity }]
    const userId = req.user._id;

    if (!products || !products.length) return res.status(400).json({ success: false, message: "No products provided" });

    const line_items = [];
    let total = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });

      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: product.title },
          unit_amount: Math.round(product.discountedPrice * 100),
        },
        quantity: item.quantity || 1,
      });

      total += product.discountedPrice * (item.quantity || 1);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        success_url: `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/order/cancel`,
        metadata: {
          userId: userId.toString(),
          total: total.toString(),
          products: JSON.stringify(products),
        },
      });

      res.status(200).json({ success: true, url: session.url });
    } catch (err) {
      console.error("Cart Checkout Session Error:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ========================
  // Confirm Stripe Checkout Session (fallback when webhooks can't reach localhost)
  // POST /api/v1/order/confirm
  // Body: { sessionId }
  // ========================
  export const confirmCheckoutSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Stripe typically sets payment_status to 'paid' for successful card payments
    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: `Session not paid (status=${session.payment_status})` });
    }

    const sessionUserId = session?.metadata?.userId;
    if (!sessionUserId) {
      return res.status(400).json({ success: false, message: "Missing userId in session metadata" });
    }

    // Ensure the logged-in user is the one who paid
    if (sessionUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const paymentId = session.payment_intent;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: "Missing payment_intent on session" });
    }

    const existingOrder = await Order.findOne({ user: req.user._id, paymentId });
    if (existingOrder) {
      return res.status(200).json({ success: true, message: "Order already confirmed", order: existingOrder });
    }

    // Single product flow
    if (session.metadata.productId) {
      const productId = session.metadata.productId;
      const quantity = parseInt(session.metadata.quantity, 10) || 1;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      const order = await Order.create({
        name: req.user.name,
        email: req.user.email,
        user: req.user._id,
        products: [{ product: productId, quantity }],
        total: product.discountedPrice * quantity,
        paymentId,
      });

      await Cart.updateOne({ user: req.user._id }, { $pull: { products: { product: productId } } });
      return res.status(201).json({ success: true, message: "Order confirmed", order });
    }

    // Cart flow
    if (session.metadata.products) {
      const cartItems = JSON.parse(session.metadata.products);

      let total = 0;
      const productsArray = [];

      for (const item of cartItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
        }
        const itemQuantity = item.quantity || 1;
        productsArray.push({ product: item.productId, quantity: itemQuantity });
        total += product.discountedPrice * itemQuantity;
      }

      const order = await Order.create({
        name: req.user.name,
        email: req.user.email,
        user: req.user._id,
        products: productsArray,
        total,
        paymentId,
      });

      const productIds = cartItems.map((i) => i.productId);
      await Cart.updateOne(
        { user: req.user._id },
        { $pull: { products: { product: { $in: productIds } } } }
      );

      return res.status(201).json({ success: true, message: "Order confirmed", order });
    }

    return res.status(400).json({ success: false, message: "No order metadata found in session" });
  });

  // ========================
  // Stripe Webhook to Create Orders
  // POST /api/v1/order/webhook
  // ========================
  export const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Webhook event type:", event.type);

    if (event.type === "checkout.session.completed") {
      console.log("Processing checkout session completed");
      const session = event.data.object;
      const userId = session.metadata.userId;

      console.log("Session metadata:", session.metadata);

      // Single product
      if (session.metadata.productId) {
        const productId = session.metadata.productId;
        const quantity = parseInt(session.metadata.quantity, 10) || 1;

        const user = await User.findById(userId);
        if (!user) return console.error("User not found for session:", session.id);

        const product = await Product.findById(productId);
        if (!product) return console.error("Product not found for session:", session.id);

        const existingOrder = await Order.findOne({ user: userId, paymentId: session.payment_intent });
        if (existingOrder) return console.log("Order already exists for session:", session.id);

        const order = await Order.create({
          name: user.name,
          email: user.email,
          user: userId,
          products: [{ product: productId, quantity }],
          total: product.discountedPrice * quantity,
          paymentId: session.payment_intent,
        });

        await Cart.updateOne({ user: userId }, { $pull: { products: { product: productId } } });
        console.log("Single product order created via webhook:", order._id);
      }

      // Cart
      if (session.metadata.products) {
        const cartItems = JSON.parse(session.metadata.products);

        const user = await User.findById(userId);
        if (!user) return console.error("User not found for session:", session.id);

        let total = 0;
        const productsArray = [];

        for (const item of cartItems) {
          const product = await Product.findById(item.productId);
          if (!product) {
            console.error(`Product not found: ${item.productId}`);
            continue;
          }
          productsArray.push({ product: item.productId, quantity: item.quantity || 1 });
          total += product.discountedPrice * (item.quantity || 1);
        }

        const existingOrder = await Order.findOne({ user: userId, paymentId: session.payment_intent });
        if (existingOrder) return console.log("Cart order already exists for session:", session.id);

        const order = await Order.create({
          name: user.name,
          email: user.email,
          user: userId,
          products: productsArray,
          total,
          paymentId: session.payment_intent,
        });

        // Remove from cart
        const productIds = cartItems.map(i => i.productId);
        await Cart.updateOne({ user: userId }, { $pull: { products: { product: { $in: productIds } } } });
        console.log("Cart order created via webhook:", order._id);
      }
    }

    res.json({ received: true });
  });


  // ------------------- UPDATE ORDER -------------------
  const updateOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: req.body }, { new: true });

    if (updatedOrder) {
      res.status(200).json({ message: "Order Updated Successfully", order: updatedOrder });
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  });

  // ------------------- DELETE ORDER -------------------
  const deleteOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (deletedOrder) {
      res.status(200).json({ message: "Order Deleted Successfully", deletedOrder });
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  });

  // ------------------- GET USER ORDERS -------------------
  const getUserOrder = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const orders = await Order.find({ user: userId })
      .populate("products.product", "title img discountedPrice")
      .sort({ createdAt: -1 });

    if (orders && orders.length > 0) {
      res.status(200).json({ message: "Orders Fetched Successfully", orders });
    } else {
      res.status(404);
      throw new Error("Orders Not Found");
    }
  });

  // ------------------- GET ALL ORDERS -------------------
  const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "title discountedPrice")
      .sort({ createdAt: -1 });

    if (orders && orders.length > 0) {
      res.status(200).json({ message: "Orders Fetched Successfully", data: orders });
    } else {
      res.status(404).json({ message: "No Orders Found" });
    }
  });

  export {

    updateOrder,
    deleteOrder,
    getUserOrder,
    getAllOrders,
  };
