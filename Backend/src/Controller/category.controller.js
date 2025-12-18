import asyncHandler from "express-async-handler";
import categoryModel from "../models/category.model.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const exists = await categoryModel.findOne({ name });
  if (exists) {
    res.status(409);
    throw new Error("Category already exists");
  }

  if (!req.files?.categoryImage?.length) {
    res.status(400);
    throw new Error("Category image is required");
  }

  const categoryImage = req.files.categoryImage[0].path;

  let subCategory = [];

  if (req.body.subCategory) {
    const parsedSubCategory = JSON.parse(req.body.subCategory);
    let subImageIndex = 0;

    subCategory = parsedSubCategory.map((sub) => {
      const hasNewImage = req.files?.subImages && subImageIndex < req.files.subImages.length;
      const imagePath = hasNewImage ? req.files.subImages[subImageIndex++].path : null;

      if (!imagePath) {
        throw new Error(`Image required for subcategory: ${sub.name}`);
      }

      return {
        name: sub.name,
        image: imagePath
      };
    });
  }

  const category = await categoryModel.create({
    name,
    image: categoryImage,
    subCategory
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category
  });
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel.find();

  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    categories
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await categoryModel.findById(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (req.body.name) {
    category.name = req.body.name;
  }

  if (req.files?.categoryImage?.length) {
    category.image = req.files.categoryImage[0].path;
  }

  if (req.body.subCategory) {
    const parsedSubCategory = JSON.parse(req.body.subCategory);
    let subImageIndex = 0;

    category.subCategory = parsedSubCategory.map((sub) => {
      let imagePath = sub.image;

      if (sub.isNewImage && req.files?.subImages?.[subImageIndex]) {
        imagePath = req.files.subImages[subImageIndex++].path;
      }

      return {
        name: sub.name,
        image: imagePath
      };
    });
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel.findByIdAndDelete(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    category
  });
});
