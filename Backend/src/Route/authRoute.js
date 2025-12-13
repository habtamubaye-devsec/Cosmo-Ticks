import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  currentUser,
} from "../Controller/auth.controller.js";
import validateToken from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/currentUser", validateToken, currentUser);
router.post("/logout", logout);

export default router;
