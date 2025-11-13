{
  // import { nanoid } from "nanoid";
  // import URL from "../models/url.model.js";
  // import dotenv from "dotenv";
  // dotenv.config();
  // const BASE_URL = process.env.BASE_URL;
  // // CREATE new short URL
  // export const createShortUrl = async (req, res) => {
  //   try {
  //     const { originalUrl } = req.body;
  //     console.log(originalUrl);
  //     if (!originalUrl)
  //       return res.status(400).json({ message: "Original URL required" });
  //     const shortCode = nanoid(6);
  //     const shortUrl = `${BASE_URL}/${shortCode}`;
  //     const newUrl = await URL.create({ originalUrl, shortCode });
  //     res.status(201).json({ shortUrl, originalUrl });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // };
  // // GET original URL from short code
  // export const getOriginalUrl = async (req, res) => {
  //   try {
  //     const { code } = req.params;
  //     const url = await URL.findOne({ where: { shortCode: code } });
  //     if (!url) return res.status(404).json({ message: "URL not found" });
  //     url.accessCount += 1;
  //     await url.save();
  //     res.redirect(url.originalUrl);
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // };
  // // UPDATE short URL
  // export const updateShortUrl = async (req, res) => {
  //   try {
  //     const { code } = req.params;
  //     const { newOriginalUrl } = req.body;
  //     console.log(newOriginalUrl);
  //     const url = await URL.findOne({ where: { shortCode: code } });
  //     if (!url) return res.status(404).json({ message: "URL not found" });
  //     url.originalUrl = newOriginalUrl;
  //     await url.save();
  //     res.json({ message: "URL updated", url });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // };
  // // DELETE short URL
  // export const deleteShortUrl = async (req, res) => {
  //   try {
  //     const { code } = req.params;
  //     const deleted = await URL.destroy({ where: { shortCode: code } });
  //     if (!deleted) return res.status(404).json({ message: "URL not found" });
  //     res.json({ message: "URL deleted successfully" });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // };
  // // GET statistics
  // export const getStats = async (req, res) => {
  //   try {
  //     const { code } = req.params;
  //     const url = await URL.findOne({ where: { shortCode: code } });
  //     if (!url) return res.status(404).json({ message: "URL not found" });
  //     res.json({
  //       shortUrl: `${BASE_URL}/${url.shortCode}`,
  //       originalUrl: url.originalUrl,
  //       accessCount: url.accessCount,
  //       createdAt: url.createdAt,
  //       updatedAt: url.updatedAt,
  //     });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // };
  // export const getAllUrls = async (req, res) => {
  //   try {
  //     const url = await URL.findAll();
  //     console.log(url);
  //     res.status(200).send({ url });
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //   }
  // };
}

import pool from "../config/db.js";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL;

// Create a new short URL
export const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL required" });
    }

    // Check if it already exists
    const [existing] = await pool.query(
      "SELECT * FROM urls WHERE originalUrl = ?",
      [originalUrl]
    );

    if (existing.length > 0) {
      const url = existing[0];
      return res.status(200).json({
        message: "Short URL already exists",
        shortUrl: `${BASE_URL}/${url.shortCode}`,
        originalUrl,
      });
    }

    // Otherwise, create new
    const shortCode = nanoid(6);
    const shortUrl = `${BASE_URL}/${shortCode}`;

    await pool.query(
      "INSERT INTO urls (originalUrl, shortCode) VALUES (?, ?)",
      [originalUrl, shortCode]
    );

    res.status(201).json({
      message: "Short URL created",
      shortUrl,
      originalUrl,
    });
  } catch (err) {
    console.error("Error creating short URL:", err);
    res.status(500).json({ error: err.message });
  }
};

// Retrieve the original URL (redirect)
export const getOriginalUrl = async (req, res) => {
  try {
    const { code } = req.params;
    // console.log(code, "Code");
    const [rows] = await pool.query("SELECT * FROM urls WHERE shortCode = ?", [
      code,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ message: "URL not found" });

    const url = rows[0];

    // Increment access count
    await pool.query(
      "UPDATE urls SET accessCount = accessCount + 1 WHERE id = ?",
      [url.id]
    );

    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an existing short URL
export const updateShortUrl = async (req, res) => {
  try {
    const { code } = req.params;
    const { newOriginalUrl } = req.body;

    const [rows] = await pool.query("SELECT * FROM urls WHERE shortCode = ?", [
      code,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "URL not found" });

    await pool.query("UPDATE urls SET originalUrl = ? WHERE shortCode = ?", [
      newOriginalUrl,
      code,
    ]);

    res.json({ message: "URL updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a short URL
export const deleteShortUrl = async (req, res) => {
  try {
    const { code } = req.params;
    const [result] = await pool.query("DELETE FROM urls WHERE shortCode = ?", [
      code,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "URL not found" });

    res.json({ message: "URL deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get stats for a short URL
export const getStats = async (req, res) => {
  try {
    const { code } = req.params;
    const [rows] = await pool.query("SELECT * FROM urls WHERE shortCode = ?", [
      code,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ message: "URL not found" });

    const url = rows[0];

    res.json({
      shortUrl: `${BASE_URL}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      accessCount: url.accessCount,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUrls = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM urls");
    console.log("Fetched URLs:", rows);

    if (rows.length === 0)
      return res.status(404).json({ message: "No URLs found" });

    res.json(rows);
  } catch (err) {
    console.error("Error fetching URLs:", err);
    res.status(500).json({ error: err.message });
  }
};
