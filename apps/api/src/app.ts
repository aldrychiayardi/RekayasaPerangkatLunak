import cors from "cors";
import express from "express";
import { ApiError, asyncHandler, errorHandler } from "./lib/errors.js";
import { requireParam } from "./lib/validation.js";
import { courseRouter } from "./routes/courses.js";
import { courseStudentRouter, studentRouter } from "./routes/students.js";
import { repositoryRouter, studentRepositoryRouter, synchronizeCourseRepositories } from "./routes/repositories.js";
import { dashboardRouter } from "./routes/dashboard.js";

export const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ Status: "ok" });
});

app.use("/api/courses", courseRouter);
app.use("/api/courses/:CourseId/students", courseStudentRouter);
app.use("/api/students", studentRouter);
app.use("/api/students/:Id/repositories", studentRepositoryRouter);
app.use("/api/repositories", repositoryRouter);
app.post(
  "/api/courses/:CourseId/sync",
  asyncHandler(async (request, response) => {
    const result = await synchronizeCourseRepositories(
      requireParam(request.params.CourseId, "ID mata kuliah")
    );
    response.status(result.Results.some((entry) => !entry.Success) ? 207 : 200).json(result);
  })
);
app.use(dashboardRouter);
app.use((_request, _response, next) => {
  next(new ApiError(404, "Rute API tidak ditemukan."));
});
app.use(errorHandler);
