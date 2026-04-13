import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

connectDB();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (origin === CLIENT_URL) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));