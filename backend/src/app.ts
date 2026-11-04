import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler, ApiError } from "./lib/errors.js";
import { apiRouter } from "./routes/api.js";
import { authRouter } from "./routes/auth.js";

export const app = express();

// Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true
  })
);

// General Rate Limiter to protect API from denial of service (250 req per 15 min per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: { message: "Terlalu banyak permintaan dari IP ini. Silakan coba beberapa saat lagi." },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter Rate Limiter for Authentication to mitigate Brute-Force / Credential Stuffing (20 req per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Terlalu banyak percobaan autentikasi. Silakan coba lagi setelah 15 menit." },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.json({ limit: "1mb" }));
app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api", apiRouter);
app.use((_request, _response, next) => {
  next(new ApiError(404, "Rute API tidak ditemukan."));
});
app.use(errorHandler);
