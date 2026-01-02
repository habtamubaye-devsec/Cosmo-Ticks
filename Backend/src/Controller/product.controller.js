import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const safeJsonParse = (value) => {
  if (typeof value !== "string") return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const parseStringArray = (value) => {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === "string") {
    const parsed = safeJsonParse(value);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
    // fallback: allow comma/newline separated strings
    return value
      .split(/\r?\n|,/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
};

const toNumberOrUndefined = (value) => {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

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

  const category = parseStringArray(req.body.category);
  const whatInbox = parseStringArray(req.body.whatInbox);
  const quantity = toNumberOrUndefined(req.body.quantity);

  const newProduct = new Product({
    ...req.body,
    category: category ?? req.body.category,
    whatInbox: whatInbox ?? req.body.whatInbox,
    quantity: quantity ?? req.body.quantity,
    inStock: typeof quantity === "number" ? quantity > 0 : true,
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
  const category = parseStringArray(req.body.category);
  const whatInbox = parseStringArray(req.body.whatInbox);
  const quantity = toNumberOrUndefined(req.body.quantity);

  const existingImagesRaw = req.body.existingImages;
  const existingImages = Array.isArray(existingImagesRaw)
    ? existingImagesRaw
    : typeof existingImagesRaw === "string" && existingImagesRaw
      ? [existingImagesRaw]
      : [];

  const newUploads = Array.isArray(req.files) ? req.files.map((f) => f.path) : [];

  const update = {
    ...req.body,
    category: category ?? req.body.category,
    whatInbox: whatInbox ?? req.body.whatInbox,
  };

  if (typeof quantity === "number") {
    update.quantity = quantity;
    // Keep inStock consistent with quantity.
    update.inStock = quantity > 0;
  }

  // If the client sent existingImages and/or uploaded new files, update img.
  if (existingImages.length || newUploads.length) {
    update.img = [...existingImages, ...newUploads];
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });

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

// Helper to escape regex special characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

//GET ALL PRODUCT
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const { new: qNew, category, subCategory, search, minPrice, maxPrice, minRating, sortBy, order } = req.query;

    let query = {};

    // Search filter (title, description, category, subCategory)
    if (search) {
      const escapedSearch = escapeRegExp(search);
      const searchRegex = new RegExp(escapedSearch, "i");
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { subCategory: { $regex: searchRegex } }
      ];
    }

    // Category filter
    if (category) {
      query.category = { $in: [category] };
    }

    // Subcategory filter
    if (subCategory) {
      query.subCategory = subCategory;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.oridinaryPrice = {};
      if (minPrice) query.oridinaryPrice.$gte = Number(minPrice);
      if (maxPrice) query.oridinaryPrice.$lte = Number(maxPrice);
    }

    // Build Sort Object
    let sortObj = {};
    if (sortBy === "price") {
      sortObj.oridinaryPrice = order === "asc" ? 1 : -1;
    } else if (sortBy === "rating") {
      sortObj.avgRating = -1; // Highest rating first
    } else if (qNew) {
      sortObj.createdAt = -1;
    } else {
      sortObj.createdAt = -1; // Default
    }

    // Rating filter & Sorting
    const minR = Number(minRating || 0);

    // We use aggregation to calculate avgRating for both filtering and sorting
    let products = await Product.aggregate([
      { $match: query },
      {
        $addFields: {
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$ratings", []] } }, 0] },
              then: { $avg: "$ratings.star" },
              else: 0
            }
          }
        }
      },
      { $match: { avgRating: { $gte: minR } } },
      { $sort: Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 } },
      // Optional: use $unwind and $lookup if you want to populate in aggregation
      // For now, let's just make the manual populate safer by filtering out invalid IDs or using a try-catch
    ]);

    // Populate manually - Safe version
    if (products && products.length > 0) {
      try {
        await Product.populate(products, {
          path: "ratings.postedBy",
          model: "User",
          select: "name email",
        });
      } catch (popError) {
        console.error("Population error (likely invalid user ID):", popError.message);
        // We continue anyway, products will just have unpopulated user IDs
      }
    }

    res.status(200).json({ message: "Products fetched successfully", product: products });
  } catch (error) {
    console.error("Error in getAllProduct:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
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