import express from "express";
import { createBanner, deleteBanner, getAllBanner, getRandomBanner } from "../Controller/banner.controller.js";

const router = express.Router();

router.post("/create", createBanner);
router.delete("delete", deleteBanner);
router.get("get-all-banner", getAllBanner);
router.get("get-random-banner", getRandomBanner);

export default router;