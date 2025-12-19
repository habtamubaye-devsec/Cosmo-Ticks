import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const normalizeRatingsForUser = (ratings, userId) => {
  const uid = String(userId || "");
  const list = Array.isArray(ratings) ? ratings : [];

  const getPostedById = (rating) => {
    const postedBy = rating?.postedBy;
    // When populated, postedBy is an object like { _id, name }
    return String(postedBy?._id ?? postedBy ?? "");
  };

  const my = list.find((r) => getPostedById(r) === uid);
  const others = list
    .filter((r) => getPostedById(r) !== uid)
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  return my ? [my, ...others] : others;
};

//CREATE PRODUCT
const createProduct = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No images uploaded");
  }

  const mediaUrls = req.files.map((file) => file.path);

  const newProduct = new Product({
    ...req.body,
    img: mediaUrls,
  });

  const product = await newProduct.save();

  if (product) {
    res.status(201).json({ message: "Product Created Successfully", product });
  } else {
    res.status(400);
    throw new Error("Product Not Created");
  }
});


//UPDATE PRODUCT
const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );

  if (updatedProduct) {
    res.status(200).json({
      message: "Product Updated Successfully",
      product: updatedProduct,
    });
  } else {
    res.status(400);
    throw new Error("Product Not Updated");
  }
});

//DELETE PRODUCT
const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (deletedProduct) {
    res.status(200).json({
      message: "Product Deleted Successfully",
    });
  } else {
    res.status(404);
    throw new Error("Product Not Deleted");
  }
});

//GET PRODUCT
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: "ratings.postedBy",
    select: "name email",
  });

  // Fallback for legacy data where postedBy was stored as a string.
  // If populate can't resolve, attach a lightweight postedBy object.
  if (product?.ratings?.length) {
    const legacyIds = product.ratings
      .map((r) => r?.postedBy)
      .filter((pb) => typeof pb === "string" && mongoose.Types.ObjectId.isValid(pb));

    if (legacyIds.length) {
      const users = await User.find({ _id: { $in: legacyIds } }).select("name email");
      const byId = new Map(users.map((u) => [String(u._id), u]));
      product.ratings.forEach((r) => {
        if (typeof r.postedBy === "string") {
          const u = byId.get(String(r.postedBy));
          if (u) r.postedBy = { _id: u._id, name: u.name, email: u.email };
        }
      });
    }
  }

  if (product) {
    res.status(200).json({
      message: "Product Fetched Successfully",
      product,
    });
  } else {
    res.status(404);
    throw new Error("Product Not Found");
  }
});

//GET ALL PRODUCT
const getAllProduct = asyncHandler(async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qSearch = req.query.search;
  let product ;

  if (qNew) {
    product = await Product.find().sort({ createdAt: -1 }).populate({
      path: "ratings.postedBy",
      select: "name email",
    });
  } else if (qCategory) {
    product = await Product.find({ category: { $in: [qCategory] } }).populate({
      path: "ratings.postedBy",
      select: "name email",
    });
  } else if (qSearch) {
    product = await Product.find({
      $text: {
        $search: qSearch,
        $caseSensitive: false,
        $diacriticSensitive: false,
      },
    }).populate({
      path: "ratings.postedBy",
      select: "name email",
    });
  } else {
    product = await Product.find().sort({ createdAt: -1 }).populate({
      path: "ratings.postedBy",
      select: "name email",
    });
  }
  res.status(200).json({ message: "Products fetched successfully", product });
});

//RATING PRODUCT
const ratingProduct = asyncHandler(async (req, res) => {
  // Backward compatible handler. Prefer /products/:id/reviews endpoints.
  const productId = req.params.productId || req.params.id;
  const star = Number(req.body.star);
  const comment = req.body.comment ?? req.body.commnet;

  if (!star || !comment) {
    return res.status(400).json({ message: "Star and comment are required" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product Not Found" });

  const userId = String(req.user?._id);
  const existing = product.ratings.find((r) => String(r.postedBy?._id ?? r.postedBy) === userId);

  if (existing) {
    existing.star = star;
    existing.comment = comment;
    existing.updatedAt = new Date();
  } else {
    product.ratings.unshift({ star, comment, postedBy: req.user._id });
  }

  product.ratings = normalizeRatingsForUser(product.ratings, userId);
  const saved = await product.save();
  res.status(200).json({ message: "Review saved successfully", product: saved });
});

// REVIEWS (one per user per product)
// POST/PUT /api/v1/products/:id/reviews
const upsertProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product Not Found" });

  const star = Number(req.body.star);
  const comment = req.body.comment;
  const userId = String(req.user?._id);

  if (!star || !comment) {
    return res.status(400).json({ message: "Star and comment are required" });
  }

  const existing = product.ratings.find((r) => String(r.postedBy?._id ?? r.postedBy) === userId);
  if (existing) {
    existing.star = star;
    existing.comment = comment;
    existing.updatedAt = new Date();
  } else {
    product.ratings.unshift({ star, comment, postedBy: req.user._id });
  }

  product.ratings = normalizeRatingsForUser(product.ratings, userId);
  const saved = await product.save();
  res.status(200).json({ message: "Review saved successfully", product: saved });
});

// DELETE /api/v1/products/:id/reviews
const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product Not Found" });

  const userId = String(req.user?._id);
  const before = product.ratings.length;
  product.ratings = product.ratings.filter((r) => String(r.postedBy?._id ?? r.postedBy) !== userId);

  if (product.ratings.length === before) {
    return res.status(404).json({ message: "Review not found" });
  }

  const saved = await product.save();
  res.status(200).json({ message: "Review deleted successfully", product: saved });
});


export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProduct,
  ratingProduct,
  upsertProductReview,
  deleteProductReview,
}