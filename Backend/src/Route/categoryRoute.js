import express from "express";
import upload from "../Middleware/uploadImg.js";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from "../Controller/category.controller.js";
import {validateAdmin} from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "categoryImage", maxCount: 1 },
    { name: "subImages", maxCount: 10 }
  ]),
  validateAdmin,
  createCategory
);

router.get("/", getAllCategories);

router.put(
  "/:id",
  upload.fields([
    { name: "categoryImage", maxCount: 1 },
    { name: "subImages", maxCount: 10 }
  ]), validateAdmin, 
  updateCategory
);

router.delete("/:id", validateAdmin, deleteCategory);

export default router;
