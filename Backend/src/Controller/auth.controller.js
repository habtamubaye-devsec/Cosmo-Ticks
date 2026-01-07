import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendMail from "../utils/mailer.js";
import { buildResetPasswordEmail } from "../utils/templates/resetPasswordTemplate.js";


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

// CHANGE PASSWORD (Authenticated)
// route POST /api/v1/auth/change-password
// @access private
export const changePassword = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// REQUEST PASSWORD RESET (Public)
// route POST /api/v1/auth/password/reset-request
// @access public
export const requestPasswordReset = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always return generic message to avoid user enumeration

    const token = user
      ? jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: "1h" })
      : null;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = token ? `${frontendUrl}/reset-password?token=${token}` : null;

    try {
      if (token) {
        await sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER || process.env.NODEMAILER_EMAIL,
          to: email,
          subject: "Reset your Cosmo-ticks password",
          html: buildResetPasswordEmail(resetLink),
        });
      }
    } catch (mailErr) {
      console.error("Failed to send reset email:", mailErr);
      // We still return generic success to avoid enumeration and UX leakage
    }

    return res.status(200).json({ message: "If the email exists, a reset link was sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// RESET PASSWORD (Public via token)
// route POST /api/v1/auth/password/reset
// @access public
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(payload._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
