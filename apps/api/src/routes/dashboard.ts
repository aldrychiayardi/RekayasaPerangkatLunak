import { ActivityStatus, type DashboardResponse, type StudentProgressResponse } from "@lecturer-github-tracker/shared";
import { Router } from "express";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { requireParam } from "../lib/validation.js";
import { toRepository } from "./repositories.js";

export const dashboardRouter = Router();

function toStudent(student: {
  Id: string;
  CourseId: string;
  StudentNumber: string;
  Name: string;
  Email: string;
  GithubUsername: string;
  CreatedAt: Date;
}) {
  return { ...student, CreatedAt: student.CreatedAt.toISOString() };
}

function getActivityStatus(latestCommitAt: Date | null): ActivityStatus {
  if (!latestCommitAt) {
    return ActivityStatus.NO_COMMIT;
  }
  const activityThreshold = Date.now() - 14 * 24 * 60 * 60 * 1000;
  return latestCommitAt.getTime() < activityThreshold
    ? ActivityStatus.INACTIVE
    : ActivityStatus.ACTIVE;
}

dashboardRouter.get(
  "/courses/:CourseId/dashboard",
  asyncHandler(async (request, response) => {
    const CourseId = requireParam(request.params.CourseId, "ID mata kuliah");
    const course = await prisma.course.findUnique({ where: { Id: CourseId } });
    if (!course) {
      throw new ApiError(404, "Mata kuliah tidak ditemukan.");
    }

    const students = await prisma.student.findMany({
      where: { CourseId },
      orderBy: { StudentNumber: "asc" },
      include: {
        Repositories: {
          include: {
            Commits: { select: { CommittedAt: true } }
          }
        }
      }
    });

    const studentRows = students.map((student) => {
      const commitDates = student.Repositories.flatMap((repository) =>
        repository.Commits.map((commit) => commit.CommittedAt)
      );
      const LatestCommitAt = commitDates.length
        ? new Date(Math.max(...commitDates.map((date) => date.getTime())))
        : null;
      const TotalCommits = commitDates.length;

      return {
        StudentId: student.Id,
        StudentName: student.Name,
        StudentNumber: student.StudentNumber,
        RepositoryCount: student.Repositories.length,
        TotalCommits,
        LatestCommitAt: LatestCommitAt?.toISOString() ?? null,
        ActivityStatus: getActivityStatus(LatestCommitAt)
      };
    });

    const Summary = {
      TotalStudents: students.length,
      TotalRepositories: students.reduce((total, student) => total + student.Repositories.length, 0),
      TotalCommits: studentRows.reduce((total, student) => total + student.TotalCommits, 0),
      ActiveStudents: studentRows.filter((student) => student.ActivityStatus === ActivityStatus.ACTIVE).length,
      InactiveStudents: studentRows.filter((student) => student.ActivityStatus === ActivityStatus.INACTIVE).length,
      StudentsWithoutCommits: studentRows.filter(
        (student) => student.ActivityStatus === ActivityStatus.NO_COMMIT
      ).length
    };

    const result: DashboardResponse = {
      Course: { ...course, CreatedAt: course.CreatedAt.toISOString() },
      Summary,
      Students: studentRows
    };
    response.json(result);
  })
);

dashboardRouter.get(
  "/students/:Id/progress",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID mahasiswa");
    const student = await prisma.student.findUnique({
      where: { Id },
      include: {
        Repositories: {
          include: {
            _count: { select: { Commits: true } },
            Commits: true
          }
        }
      }
    });
    if (!student) {
      throw new ApiError(404, "Mahasiswa tidak ditemukan.");
    }

    const allCommits = student.Repositories.flatMap((repository) => repository.Commits)
      .sort((first, second) => second.CommittedAt.getTime() - first.CommittedAt.getTime());
    const latestCommitAt = allCommits[0]?.CommittedAt ?? null;
    const result: StudentProgressResponse = {
      Student: toStudent(student),
      Repositories: student.Repositories.map(toRepository),
      TotalCommits: allCommits.length,
      LatestCommitAt: latestCommitAt?.toISOString() ?? null,
      Commits: allCommits.map((commit) => ({
        ...commit,
        CommittedAt: commit.CommittedAt.toISOString(),
        CreatedAt: commit.CreatedAt.toISOString()
      }))
    };
    response.json(result);
  })
);
