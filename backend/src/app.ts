import cors from "cors";
import express from "express";
import { errorHandler, ApiError } from "./lib/errors.js";
import { apiRouter } from "./routes/api.js";

export const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRouter);
app.use((_request, _response, next) => {
  next(new ApiError(404, "Rute API tidak ditemukan."));
});
app.use(errorHandler);
