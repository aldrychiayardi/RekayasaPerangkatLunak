import { Router } from "express";
import type { RepositoryResponse, RepositorySyncOutcome, SyncResult } from "@lecturer-github-tracker/shared";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import {
  getRequestBody,
  parseGithubRepositoryUrl,
  requireParam,
  requireString
} from "../lib/validation.js";
import { synchronizeRepository } from "../lib/github.js";

export const repositoryRouter = Router();
export const studentRepositoryRouter = Router({ mergeParams: true });

export function toRepository(repository: {
  Id: string;
  StudentId: string;
  Name: string;
  RepositoryUrl: string;
  Owner: string;
  RepositoryName: string;
  IsActive: boolean;
  LastSyncedAt: Date | null;
  CreatedAt: Date;
  _count?: { Commits: number };
}): RepositoryResponse {
  return {
    Id: repository.Id,
    StudentId: repository.StudentId,
    Name: repository.Name,
    RepositoryUrl: repository.RepositoryUrl,
    Owner: repository.Owner,
    RepositoryName: repository.RepositoryName,
    IsActive: repository.IsActive,
    LastSyncedAt: repository.LastSyncedAt?.toISOString() ?? null,
    CreatedAt: repository.CreatedAt.toISOString(),
    CommitCount: repository._count?.Commits ?? 0
  };
}

const repositoryInclude = { _count: { select: { Commits: true } } } as const;

studentRepositoryRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const StudentId = requireParam(request.params.Id, "ID mahasiswa");
    const student = await prisma.student.findUnique({ where: { Id: StudentId }, select: { Id: true } });
    if (!student) {
      throw new ApiError(404, "Mahasiswa tidak ditemukan.");
    }
    const repositories = await prisma.repository.findMany({
      where: { StudentId },
      include: repositoryInclude,
      orderBy: { CreatedAt: "desc" }
    });
    response.json(repositories.map(toRepository));
  })
);

studentRepositoryRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const StudentId = requireParam(request.params.Id, "ID mahasiswa");
    const student = await prisma.student.findUnique({ where: { Id: StudentId }, select: { Id: true } });
    if (!student) {
      throw new ApiError(404, "Mahasiswa tidak ditemukan.");
    }
    const body = getRequestBody(request.body);
    const githubRepository = parseGithubRepositoryUrl(body.RepositoryUrl);
    const repository = await prisma.repository.create({
      data: {
        StudentId,
        ...githubRepository,
        Name: typeof body.Name === "string" && body.Name.trim()
          ? body.Name.trim()
          : githubRepository.RepositoryName,
        IsActive: typeof body.IsActive === "boolean" ? body.IsActive : true
      },
      include: repositoryInclude
    });
    response.status(201).json(toRepository(repository));
  })
);

repositoryRouter.put(
  "/:Id",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID repositori");
    const body = getRequestBody(request.body);
    const existing = await prisma.repository.findUnique({ where: { Id } });
    if (!existing) {
      throw new ApiError(404, "Repositori tidak ditemukan.");
    }

    const data: {
      Name?: string;
      RepositoryUrl?: string;
      Owner?: string;
      RepositoryName?: string;
      IsActive?: boolean;
    } = {};

    if (body.RepositoryUrl !== undefined) {
      Object.assign(data, parseGithubRepositoryUrl(body.RepositoryUrl));
    }
    if (body.Name !== undefined) {
      data.Name = requireString(body.Name, "Nama repositori");
    }
    if (body.IsActive !== undefined) {
      if (typeof body.IsActive !== "boolean") {
        throw new ApiError(400, "Status aktif repositori harus berupa boolean.");
      }
      data.IsActive = body.IsActive;
    }
    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "Tidak ada data repositori yang diperbarui.");
    }

    const repository = await prisma.repository.update({
      where: { Id },
      data,
      include: repositoryInclude
    });
    response.json(toRepository(repository));
  })
);

repositoryRouter.delete(
  "/:Id",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID repositori");
    await prisma.repository.delete({ where: { Id } });
    response.status(204).end();
  })
);

repositoryRouter.post(
  "/:Id/sync",
  asyncHandler(async (request, response) => {
    const Id = requireParam(request.params.Id, "ID repositori");
    const result: SyncResult = await synchronizeRepository(Id);
    response.json(result);
  })
);

export async function synchronizeCourseRepositories(CourseId: string) {
  const course = await prisma.course.findUnique({
    where: { Id: CourseId },
    select: { Id: true }
  });
  if (!course) {
    throw new ApiError(404, "Mata kuliah tidak ditemukan.");
  }

  const repositories = await prisma.repository.findMany({
    where: {
      IsActive: true,
      Student: { CourseId }
    },
    select: { Id: true, LastSyncedAt: true },
    orderBy: { Id: "asc" }
  });
  const Results: RepositorySyncOutcome[] = [];

  for (const repository of repositories) {
    try {
      Results.push({ ...(await synchronizeRepository(repository.Id)), Success: true });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "Terjadi kesalahan saat menyinkronkan repositori.";
      if (!(error instanceof ApiError)) {
        console.error(`Sinkronisasi repositori ${repository.Id} gagal:`, error);
      }
      Results.push({
        RepositoryId: repository.Id,
        Success: false,
        FetchedCommitCount: 0,
        NewCommitCount: 0,
        ExistingCommitCount: 0,
        LastSyncedAt: repository.LastSyncedAt?.toISOString() ?? null,
        Message: message
      });
    }
  }

  return { Results };
}
