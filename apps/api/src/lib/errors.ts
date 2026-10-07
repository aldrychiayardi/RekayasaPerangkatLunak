import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Prisma } from "../generated/prisma/index.js";

export class ApiError extends Error {
  constructor(
    public readonly StatusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function asyncHandler(
  handler: (request: Request, response: Response) => Promise<void>
): RequestHandler {
  return (request, response, next: NextFunction) => {
    void handler(request, response).catch(next);
  };
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
): void {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.StatusCode).json({ Message: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response.status(409).json({ Message: "Data dengan nilai tersebut sudah tersedia." });
      return;
    }
    if (error.code === "P2025") {
      response.status(404).json({ Message: "Data tidak ditemukan." });
      return;
    }
    if (error.code === "P2003") {
      response.status(400).json({ Message: "Relasi data tidak valid." });
      return;
    }
  }

  console.error("Kesalahan API tidak tertangani:", error);
  response.status(500).json({ Message: "Terjadi kesalahan pada server." });
}
