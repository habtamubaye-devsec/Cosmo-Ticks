import Banner from "../models/banner.model.js";
import asyncHandler from "express-async-handler";

//CREATE BANNER
const createBanner = asyncHandler(async (req, res) => {
  const newBanner = new Banner(req.body);
  const savedBanner = await newBanner.save();

  if (savedBanner) {
    res
      .status(201)
      .json({ message: "Banner Created Successfully", savedBanner });
  } else {
    res.status(400);
    throw new Error("Banner Not Created");
  }
});

//DELETE BANNER
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (banner) {
    res.status(200).json({ message: "Banner Deleted Successfully" });
  } else {
    res.status(404);
    throw new Error("Banner Not Deleted");
  }
});

//GET ALL BANNER
const getAllBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.find();

  if (banner) {
    res.status(200).json({ message: "Banner Fecthed Successfully" , banner});
  } else {
    res.status(404);
    throw new Error("Banner Not Fetched");
  }
});

//GET RANDOM BANNER
const getRandomBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.find();

  if (banner) {
    const randomIndex = Math.floor(Math.random() * banner.length);
    const randomBanner = banner[randomIndex];
    res
      .status(200)
      .json({ message: "Banner Fecthed Successfully", randomBanner });
  } else {
    res.status(404);
    throw new Error("Banner Not Fetched");
  }
});


export {createBanner, deleteBanner, getAllBanner, getRandomBanner};