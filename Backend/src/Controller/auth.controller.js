import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//REGISTER USER
//route POST /api/v1/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//LOGIN USER
//route POST /api/v1/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "5h",
      }
    );

    return res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "Strict",
      })
      .json({ token, message: "Login Success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// OAuth Callback Ha    ndler
const oauthCallback = asyncHandler(async (req, res) => {
  try {
    // User is attached to req.user by Passport
    const user = req.user;

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "5h" }
    );

    // Set cookie and redirect to frontend
    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "Strict",
      })
      .redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/success?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/failure`);
  }
});


const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res
      .status(200)
      .json({ data: user, message: "User fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//LOGOUT
//route POST /api/v1/logout
//@access private
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(200).json({ message: "Logout Successfully" });
});

export { registerUser, loginUser, currentUser, logout, oauthCallback };
