import Stripe from "stripe";
import asyncHandler from "express-async-handler";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log("Stripe Key Loaded:", !!process.env.STRIPE_SECRET_KEY);
console.log(
  "Stripe Webhook Secret Loaded:",
  !!process.env.STRIPE_WEBHOOK_SECRET
);

const coerceQuantity = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.floor(n);
};

const decrementStockOrThrow = async (items) => {
  const processed = [];

  try {
    for (const item of items) {
      const productId = String(item.productId);
      const quantity = coerceQuantity(item.quantity);

      const result = await Product.updateOne(
        {
          _id: productId,
          $expr: { $gte: [{ $ifNull: ["$quantity", 0] }, quantity] },
        },
        [
          {
            $set: {
              quantity: {
                $subtract: [{ $ifNull: ["$quantity", 0] }, quantity],
              },
            },
          },
          {
            $set: {
              inStock: { $gt: ["$quantity", 0] },
            },
          },
        ]
      );

      if (result.modifiedCount !== 1) {
        const err = new Error(`Insufficient stock for product ${productId}`);
        err.statusCode = 400;
        throw err;
      }

      processed.push({ productId, quantity });
    }
  } catch (error) {
    // Best-effort rollback for any already-decremented products
    await Promise.all(
      processed.map((p) =>
        Product.updateOne({ _id: p.productId }, [
          {
            $set: {
              quantity: { $add: [{ $ifNull: ["$quantity", 0] }, p.quantity] },
            },
          },
          {
            $set: {
              inStock: { $gt: ["$quantity", 0] },
            },
          },
        ])
      )
    );

    throw error;
  }
};

const incrementStockBestEffort = async (items) => {
  await Promise.all(
    items.map((item) => {
      const productId = String(item.productId);
      const quantity = coerceQuantity(item.quantity);
      return Product.updateOne({ _id: productId }, [
        {
          $set: {
            quantity: { $add: [{ $ifNull: ["$quantity", 0] }, quantity] },
          },
        },
        {
          $set: {
            inStock: { $gt: ["$quantity", 0] },
          },
        },
      ]);
    })
  );
};

// ========================
// Create Stripe Checkout Session for Single Product
// POST /api/v1/order/checkout/single/:productId
// ========================
export const createSingleCheckoutSession = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });

  const q = coerceQuantity(quantity);
  const available = Number(product.quantity) || 0;
  if (available < q) {
    return res
      .status(400)
      .json({ success: false, message: "Insufficient stock" });
  }

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
          quantity: q,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/order/success?productId=${product._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/order/cancel`,
      metadata: {
        userId: userId.toString(),
        productId: product._id.toString(),
        quantity: q.toString(),
      },
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

  if (!products || !products.length)
    return res
      .status(400)
      .json({ success: false, message: "No products provided" });

  const line_items = [];
  let total = 0;

  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product)
      return res
        .status(404)
        .json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });

    const q = coerceQuantity(item.quantity || 1);
    const available = Number(product.quantity) || 0;
    if (available < q) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Insufficient stock for product: ${item.productId}`,
        });
    }

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: product.title },
        unit_amount: Math.round(product.discountedPrice * 100),
      },
      quantity: q,
    });

    total += product.discountedPrice * q;
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
    return res
      .status(400)
      .json({ success: false, message: "sessionId is required" });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Stripe typically sets payment_status to 'paid' for successful card payments
  if (session.payment_status !== "paid") {
    return res
      .status(400)
      .json({
        success: false,
        message: `Session not paid (status=${session.payment_status})`,
      });
  }

  const sessionUserId = session?.metadata?.userId;
  if (!sessionUserId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing userId in session metadata" });
  }

  // Ensure the logged-in user is the one who paid
  if (sessionUserId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const paymentId = session.payment_intent;
  if (!paymentId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing payment_intent on session" });
  }

  const existingOrder = await Order.findOne({ user: req.user._id, paymentId });
  if (existingOrder) {
    return res
      .status(200)
      .json({
        success: true,
        message: "Order already confirmed",
        order: existingOrder,
      });
  }

  // Single product flow
  if (session.metadata.productId) {
    const productId = session.metadata.productId;
    const quantity = parseInt(session.metadata.quantity, 10) || 1;

    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const available = Number(product.quantity) || 0;
    if (available < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    const stockItems = [{ productId, quantity }];
    let stockDecremented = false;

    try {
      await decrementStockOrThrow(stockItems);
      stockDecremented = true;

      const order = await Order.create({
        name: req.user.name,
        email: req.user.email,
        user: req.user._id,
        products: [{ product: productId, quantity }],
        total: product.discountedPrice * quantity,
        paymentId,
      });

      await Cart.updateOne(
        { user: req.user._id },
        { $pull: { products: { product: productId } } }
      );
      return res
        .status(201)
        .json({ success: true, message: "Order confirmed", order });
    } catch (e) {
      if (stockDecremented) {
        await incrementStockBestEffort(stockItems);
      }
      return res
        .status(e.statusCode || 500)
        .json({
          success: false,
          message: e.message || "Failed to confirm order",
        });
    }
  }

  // Cart flow
  if (session.metadata.products) {
    const cartItems = JSON.parse(session.metadata.products);

    let total = 0;
    const productsArray = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
      }
      const itemQuantity = coerceQuantity(item.quantity || 1);

      const available = Number(product.quantity) || 0;
      if (available < itemQuantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Insufficient stock for product: ${item.productId}`,
          });
      }

      productsArray.push({ product: item.productId, quantity: itemQuantity });
      total += product.discountedPrice * itemQuantity;
    }

    const stockItems = cartItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity || 1,
    }));
    let stockDecremented = false;

    try {
      await decrementStockOrThrow(stockItems);
      stockDecremented = true;

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

      return res
        .status(201)
        .json({ success: true, message: "Order confirmed", order });
    } catch (e) {
      if (stockDecremented) {
        await incrementStockBestEffort(stockItems);
      }
      return res
        .status(e.statusCode || 500)
        .json({
          success: false,
          message: e.message || "Failed to confirm order",
        });
    }
  }

  return res
    .status(400)
    .json({ success: false, message: "No order metadata found in session" });
});

// ========================
// Stripe Webhook to Create Orders
// POST /api/v1/order/webhook
// ========================
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
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
      if (!user) {
        console.error("User not found for session:", session.id);
      }

      const product = await Product.findById(productId);
      if (!product) {
        console.error("Product not found for session:", session.id);
      }

      if (!user || !product) {
        // Always acknowledge the webhook; just skip creating an invalid order.
      } else {
        const existingOrder = await Order.findOne({
          user: userId,
          paymentId: session.payment_intent,
        });
        if (existingOrder) {
          console.log("Order already exists for session:", session.id);
        } else {
          const available = Number(product.quantity) || 0;
          const stockItems = [{ productId, quantity }];
          let canCreate = true;
          let stockDecremented = false;

          if (available < quantity) {
            console.error("Insufficient stock for product:", productId);
            canCreate = false;
          }

          if (!canCreate) {
            console.error(
              "Skipping single product order creation due to validation errors"
            );
          } else {
            try {
              await decrementStockOrThrow(stockItems);
              stockDecremented = true;

              const order = await Order.create({
                name: user.name,
                email: user.email,
                user: userId,
                products: [{ product: productId, quantity }],
                total: product.discountedPrice * quantity,
                paymentId: session.payment_intent,
              });

              await Cart.updateOne(
                { user: userId },
                { $pull: { products: { product: productId } } }
              );
              console.log(
                "Single product order created via webhook:",
                order._id
              );
            } catch (e) {
              if (stockDecremented) {
                await incrementStockBestEffort(stockItems);
              }
              console.error(
                "Single product webhook order creation failed:",
                e.message
              );
            }
          }
        }
      }
    }

    // Cart
    if (session.metadata.products) {
      const cartItems = JSON.parse(session.metadata.products);

      const user = await User.findById(userId);
      if (!user) {
        console.error("User not found for session:", session.id);
      }

      if (!user) {
        // Always acknowledge the webhook; just skip creating an invalid order.
      } else {
        let total = 0;
        const productsArray = [];
        let canCreate = true;

        for (const item of cartItems) {
          const product = await Product.findById(item.productId);
          if (!product) {
            console.error(`Product not found: ${item.productId}`);
            canCreate = false;
            break;
          }

          const itemQuantity = coerceQuantity(item.quantity || 1);
          const available = Number(product.quantity) || 0;
          if (available < itemQuantity) {
            console.error("Insufficient stock for product:", item.productId);
            canCreate = false;
            break;
          }

          productsArray.push({
            product: item.productId,
            quantity: itemQuantity,
          });
          total += product.discountedPrice * itemQuantity;
        }

        const existingOrder = await Order.findOne({
          user: userId,
          paymentId: session.payment_intent,
        });
        if (existingOrder) {
          console.log("Cart order already exists for session:", session.id);
          canCreate = false;
        }

        const stockItems = cartItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity || 1,
        }));
        let stockDecremented = false;

        if (!canCreate) {
          console.error(
            "Skipping cart order creation due to validation errors"
          );
        } else {
          try {
            await decrementStockOrThrow(stockItems);
            stockDecremented = true;

            const order = await Order.create({
              name: user.name,
              email: user.email,
              user: userId,
              products: productsArray,
              total,
              paymentId: session.payment_intent,
            });

            // Remove from cart
            const productIds = cartItems.map((i) => i.productId);
            await Cart.updateOne(
              { user: userId },
              { $pull: { products: { product: { $in: productIds } } } }
            );
            console.log("Cart order created via webhook:", order._id);
          } catch (e) {
            if (stockDecremented) {
              await incrementStockBestEffort(stockItems);
            }
            console.error("Cart webhook order creation failed:", e.message);
          }
        }
      }
    }
  }

  res.json({ received: true });
});

// ------------------- UPDATE ORDER -------------------
const updateOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  // Admin-only endpoint: only allow updating status from the dashboard.
  const status = Number(req.body?.status);
  if (!Number.isInteger(status) || status < 0 || status > 4) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order Not Found");
  }

  // Keep inventory consistent: once cancelled, do not allow changing back.
  if (Number(order.status) === 4 && status !== 4) {
    return res
      .status(400)
      .json({ message: "Cannot change status of a cancelled order" });
  }

  const prevStatus = Number(order.status);

  // Prevent cancelling after delivery (inventory + fulfillment correctness)
  if (prevStatus === 3 && status === 4) {
    return res.status(400).json({ message: "Cannot cancel a delivered order" });
  }

  // Enforce simple transitions:
  // - allow no-op
  // - allow forward/back by 1 within 0..3
  // - allow cancel (4) only from 0..2
  if (status !== prevStatus) {
    if (status === 4) {
      if (![0, 1, 2].includes(prevStatus)) {
        return res.status(400).json({ message: "Invalid status transition" });
      }
    } else {
      if (![0, 1, 2, 3].includes(prevStatus) || ![0, 1, 2, 3].includes(status)) {
        return res.status(400).json({ message: "Invalid status transition" });
      }
      if (Math.abs(status - prevStatus) !== 1) {
        return res.status(400).json({ message: "Invalid status transition" });
      }
    }
  }

  // If cancelling, restore stock exactly once.
  if (status === 4 && !order.stockRestored) {
    const stockItems = (order.products || []).map((p) => ({
      productId: p.product,
      quantity: p.quantity,
    }));

    await incrementStockBestEffort(stockItems);
    order.stockRestored = true;
    order.stockRestoredAt = new Date();
  }

  order.status = status;
  const updatedOrder = await order.save();

  res
    .status(200)
    .json({ message: "Order Updated Successfully", order: updatedOrder });
});

// ------------------- DELETE ORDER -------------------
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
    .populate("products.product", "title img discountedPrice oridinaryPrice")
    .sort({ createdAt: -1 });

  if (orders && orders.length > 0) {
    res
      .status(200)
      .json({ message: "Orders Fetched Successfully", data: orders });
  } else {
    res.status(404).json({ message: "No Orders Found" });
  }
});

export { updateOrder, deleteOrder, getUserOrder, getAllOrders };
