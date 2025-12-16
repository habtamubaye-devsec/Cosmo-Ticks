import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    avatar: {
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User;
