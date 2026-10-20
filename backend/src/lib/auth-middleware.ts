import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "./jwt.js";
import { ApiError } from "./errors.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(optional = false) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (optional) {
        return next();
      }
      return next(new ApiError(401, "Sesi login tidak ditemukan. Silakan login terlebih dahulu."));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      if (optional) {
        return next();
      }
      return next(
        new ApiError(401, "Token autentikasi tidak valid atau sudah kedaluwarsa. Silakan login kembali.")
      );
    }

    req.user = decoded;
    next();
  };
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Silakan login terlebih dahulu."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Akses ditolak. Fitur ini hanya dapat diakses oleh peran: ${allowedRoles.join(", ")}.`
        )
      );
    }

    next();
  };
}

