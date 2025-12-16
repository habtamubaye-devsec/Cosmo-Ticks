import express from "express";
import {
  updateUser,
  deleteUser,
  getUser,
  getAllUser,
} from "../Controller/user.controller.js";
import { validateAdmin, validateToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.put("/update/:id", validateToken, updateUser);
router.delete("/delete/:id", validateAdmin, deleteUser);
router.get("/:id", validateAdmin, getUser);
router.get("/", validateAdmin, getAllUser);

export default router;
