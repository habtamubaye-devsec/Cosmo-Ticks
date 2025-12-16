import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  currentUser,
  oauthCallback,
} from "../Controller/auth.controller.js";
import { validateToken } from "../Middleware/auth.middleware.js";
import passport from "../config/passport.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/currentUser", validateToken, currentUser);
router.post("/logout", logout);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  oauthCallback
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["public_profile"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/auth/failure" }),
  oauthCallback
);

export default router;
