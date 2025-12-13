import express from "express";
import {
  updateUser,
  deleteUser,
  getUser,
  getAllUser,
} from "../Controller/user.controller.js";
import validateToken from "../Middleware/auth.middleware.js";

const router = express.Router();

router.put("/update/:id", validateToken, updateUser);
router.delete("/delete/:id", validateToken, deleteUser);
router.get("/:id", validateToken, getUser);
router.get("/", validateToken, getAllUser);

export default router;
