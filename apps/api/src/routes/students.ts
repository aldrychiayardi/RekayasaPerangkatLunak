import { Router } from "express";
import type { Student } from "@lecturer-github-tracker/shared";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import {
  getRequestBody,
  requireEmail,
  requireParam,
  requireString
} from "../lib/validation.js";

export const studentRouter = Router();
export const courseStudentRouter = Router({ mergeParams: true });

function toStudent(student: {
  Id: string;
  CourseId: string;
  StudentNumber: string;
  Name: string;
  Email: string;
  GithubUsername: string;
  CreatedAt: Date;
}): Student {
  return { ...student, CreatedAt: student.CreatedAt.toISOString() };
}

courseStudentRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const CourseId = requireParam(request.params.CourseId, "ID mata kuliah");
    const course = await prisma.course.findUnique({ where: { Id: CourseId }, select: { Id: true } });
    if (!course) {
      throw new ApiError(404, "Mata kuliah tidak ditemukan.");
    }
    const students = await prisma.student.findMany({
      where: { CourseId },
      orderBy: { StudentNumber: "asc" }
    });
    response.json(students.map(toStudent));
  })
);

courseStudentRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const CourseId = requireParam(request.params.CourseId, "ID mata kuliah");
    const course = await prisma.course.findUnique({ where: { Id: CourseId }, select: { Id: true } });
    if (!course) {
      throw new ApiError(404, "Mata kuliah tidak ditemukan.");
    }
    const body = getRequestBody(request.body);
    const student = await prisma.student.create({
      data: {
        CourseId,
        StudentNumber: requireString(body.StudentNumber, "NIM"),
        Name: requireString(body.Name, "Nama mahasiswa"),
        Email: requireEmail(body.Email),
        GithubUsername: requireString(body.GithubUsername, "Username GitHub")
      }
    });
    response.status(201).json(toStudent(student));
  })
);

studentRouter.put(
  "/:Id",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID mahasiswa");
    const body = getRequestBody(request.body);
    const student = await prisma.student.update({
      where: { Id },
      data: {
        StudentNumber: requireString(body.StudentNumber, "NIM"),
        Name: requireString(body.Name, "Nama mahasiswa"),
        Email: requireEmail(body.Email),
        GithubUsername: requireString(body.GithubUsername, "Username GitHub")
      }
    });
    response.json(toStudent(student));
  })
);

studentRouter.delete(
  "/:Id",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID mahasiswa");
    await prisma.student.delete({ where: { Id } });
    response.status(204).end();
  })
);
