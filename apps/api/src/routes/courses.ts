import { Router } from "express";
import type { Course } from "@lecturer-github-tracker/shared";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { getRequestBody, requireParam, requireString, requireYear } from "../lib/validation.js";

export const courseRouter = Router();

function toCourse(course: {
  Id: string;
  Name: string;
  Semester: string;
  Year: number;
  CreatedAt: Date;
}): Course {
  return { ...course, CreatedAt: course.CreatedAt.toISOString() };
}

courseRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const courses = await prisma.course.findMany({ orderBy: { CreatedAt: "desc" } });
    response.json(courses.map(toCourse));
  })
);

courseRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const body = getRequestBody(request.body);
    const course = await prisma.course.create({
      data: {
        Name: requireString(body.Name, "Nama mata kuliah"),
        Semester: requireString(body.Semester, "Semester"),
        Year: requireYear(body.Year)
      }
    });
    response.status(201).json(toCourse(course));
  })
);

courseRouter.get(
  "/:Id",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID mata kuliah");
    const course = await prisma.course.findUnique({ where: { Id } });
    if (!course) {
      throw new ApiError(404, "Mata kuliah tidak ditemukan.");
    }
    response.json(toCourse(course));
  })
);

courseRouter.put(
  "/:Id",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID mata kuliah");
    const body = getRequestBody(request.body);
    const course = await prisma.course.update({
      where: { Id },
      data: {
        Name: requireString(body.Name, "Nama mata kuliah"),
        Semester: requireString(body.Semester, "Semester"),
        Year: requireYear(body.Year)
      }
    });
    response.json(toCourse(course));
  })
);

courseRouter.delete(
  "/:Id",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID mata kuliah");
    await prisma.course.delete({ where: { Id } });
    response.status(204).end();
  })
);
