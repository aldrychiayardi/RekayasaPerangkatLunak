import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  constructor(
    public readonly StatusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
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
    response.status(error.StatusCode).json({ message: error.message });
    return;
  }

  console.error("Unhandled API error:", error);
  response.status(500).json({ message: "Terjadi kesalahan pada server." });
}
