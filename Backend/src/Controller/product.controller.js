import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";

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
  const product = await Product.findById(req.params.id);

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
    product = await Product.find().sort({ createdAt: -1 });
  } else if (qCategory) {
    product = await Product.find({ category: { $in: [qCategory] } });
  } else if (qSearch) {
    product = await Product.find({
      $text: {
        $search: qSearch,
        $caseSensitive: false,
        $diacriticSensitive: false,
      },
    });
  } else {
    product = await Product.find().sort({ createdAt: -1 });
  }
  res.status(200).json({ message: "Products fetched successfully", product });
});

//RATING PRODUCT
const ratingProduct = asyncHandler(async (req, res) => {
  const { star, name, commnet, postedBY } = req.body;
  if (star && name && commnet && postedBY) {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { ratings: { star, name, commnet, postedBY } } },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Product Was Rated Successfully", product });
  } else {
    res.status(404);
    throw new Error("Product Not Rated");
  }
});


export { createProduct, updateProduct, deleteProduct, getProduct, getAllProduct, ratingProduct}