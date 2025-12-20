import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

// UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
  // Security: normal users can only update themselves.
  if (String(req.user?._id) !== String(req.params.id) && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Only admin can change role/status.
  if (req.user?.role !== "admin") {
    delete req.body.role;
    delete req.body.status;
  }

  // Whitelist fields that are allowed to be updated.
  const allowed = ["name", "email", "password", "avatar", "address", "phone", "role", "status"];
  const nextBody = {};
  for (const key of allowed) {
    if (typeof req.body[key] !== "undefined") nextBody[key] = req.body[key];
  }

  if (nextBody.password) {
    nextBody.password = await bcrypt.hash(nextBody.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: nextBody },
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
