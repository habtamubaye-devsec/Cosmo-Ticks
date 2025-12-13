import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

// UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  ).select("-password"); // exclude password

  if (updatedUser) {
    res.status(200).json({
      message: "User Updated Successfully",
      updatedUser,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

// DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (deletedUser) {
    res.status(200).json({
      message: "User Deleted Successfully",
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

// GET ONE USER
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.status(200).json({
      message: "User Fetched Successfully",
      user,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

// GET ALL USERS
const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  if (users && users.length > 0) {
    res.status(200).json({
      message: "Users Fetched Successfully",
      data: users,
    });
  } else {
    res.status(404);
    throw new Error("No Users Found");
  }
});

export { updateUser, deleteUser, getUser, getAllUser };
