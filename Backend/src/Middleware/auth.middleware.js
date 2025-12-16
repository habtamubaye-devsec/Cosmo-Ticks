import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const validateToken = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decryptObj = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decryptObj._id);

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid Token" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

const validateAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decryptObj = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(decryptObj._id);

        if (!user) return res.status(401).json({ message: "User not found" });

        if (user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid Token" });
        }
        res.status(500).json({ message: "Server Error" });
    }
});

export  { validateToken, validateAdmin };