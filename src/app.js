// import express from "express";
// import dotenv from "dotenv";
// import sequelize from "./config/db.js";
// import urlRoutes from "./routes/url.routes.js";

// dotenv.config();
// const app = express();
// app.use(express.json());

// app.use("/", urlRoutes);

// sequelize
//   .sync({ alter: true })
//   .then(() => console.log("✅ Database connected & synced"))
//   .catch((err) => console.error("❌ DB Connection Error:", err));

// export default app;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import urlRoutes from "./routes/url.routes.js";

dotenv.config();

const app = express();

// ✅ Enable CORS for frontend (Vite)
app.use(
  cors({
    origin: "http://localhost:5173", // Allow your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", urlRoutes);

export default app;
