import express from "express";
import {
  createShortUrl,
  getOriginalUrl,
  updateShortUrl,
  deleteShortUrl,
  getStats,
  getAllUrls,
} from "../controllers/url.controller.js";

const router = express.Router();

router.post("/shorten", createShortUrl);
router.get("/urls", getAllUrls); // must come before /:code
router.get("/:code", getOriginalUrl);
router.put("/:code", updateShortUrl);
router.delete("/:code", deleteShortUrl);
router.get("/:code/stats", getStats);

export default router;
