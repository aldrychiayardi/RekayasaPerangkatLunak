import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import { signToken, verifyToken, type TokenPayload } from "../lib/jwt.js";
import { authenticate, requireRole } from "../lib/auth-middleware.js";
import { ApiError } from "../lib/errors.js";
import { recordCourierCheckpoint } from "../services/courier.service.js";

describe("Security & Authentication Verification", () => {
  describe("JWT Cryptographic Security", () => {
    const payload: TokenPayload = {
      id: "user-123",
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "CUSTOMER"
    };

    it("successfully issues and verifies a valid cryptographic token", () => {
      const token = signToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // Header.Payload.Signature

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(payload.id);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it("rejects tampered or forged tokens with signature mismatch", () => {
      const token = signToken(payload);
      const parts = token.split(".");
      // Tamper with payload segment
      const tamperedPayload = Buffer.from(
        JSON.stringify({ ...payload, role: "OWNER" })
      ).toString("base64url");
      const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const result = verifyToken(forgedToken);
      expect(result).toBeNull();
    });

    it("rejects malformed token strings", () => {
      expect(verifyToken("invalid.token")).toBeNull();
      expect(verifyToken("")).toBeNull();
      expect(verifyToken("random-unencoded-garbage")).toBeNull();
    });
  });

  describe("Password Hashing & Protection (bcrypt)", () => {
    it("hashes passwords securely with unique salts", async () => {
      const plainPassword = "SuperSecretPassword123!";
      const hash1 = await bcrypt.hash(plainPassword, 10);
      const hash2 = await bcrypt.hash(plainPassword, 10);

      // Hashes must be non-identical due to distinct salt rounds
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(plainPassword);

      // Verification succeeds for true password
      const isMatch = await bcrypt.compare(plainPassword, hash1);
      expect(isMatch).toBe(true);

      // Verification fails for incorrect password
      const isWrongMatch = await bcrypt.compare("WrongPassword123!", hash1);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe("Authentication Middleware", () => {
    const mockRes = {} as Response;

    it("rejects missing Authorization header with HTTP 401", () => {
      const middleware = authenticate();
      const mockReq = { headers: {} } as Request;
      const mockNext = vi.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0] as ApiError;
      expect(error.StatusCode).toBe(401);
    });

    it("attaches decoded user on valid Bearer token", () => {
      const payload: TokenPayload = {
        id: "owner-1",
        name: "Owner Nusantara",
        email: "owner@nusantara.com",
        role: "OWNER"
      };
      const token = signToken(payload);

      const middleware = authenticate();
      const mockReq = {
        headers: { authorization: `Bearer ${token}` }
      } as Request;
      const mockNext = vi.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user?.role).toBe("OWNER");
    });
  });

  describe("Role-Based Access Control (RBAC)", () => {
    const mockRes = {} as Response;

    it("blocks unauthenticated requests without valid session with HTTP 401", () => {
      const middleware = requireRole("OWNER", "ADMIN");
      const mockReq = {} as Request;
      const mockNext = vi.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0] as ApiError;
      expect(error.StatusCode).toBe(401);
    });

    it("prevents privilege escalation when user has insufficient role with HTTP 403", () => {
      const middleware = requireRole("OWNER");
      const mockReq = {
        user: { id: "user-courier", name: "Kurir", email: "kurir@example.com", role: "COURIER" }
      } as Request;
      const mockNext = vi.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0] as ApiError;
      expect(error.StatusCode).toBe(403);
      expect(error.message).toContain("Akses ditolak");
    });

    it("permits authorized user with allowed role to proceed", () => {
      const middleware = requireRole("OWNER", "ADMIN");
      const mockReq = {
        user: { id: "user-owner", name: "Owner", email: "owner@example.com", role: "OWNER" }
      } as Request;
      const mockNext = vi.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(); // called with no error
    });
  });

  describe("Business Logic Integrity & Anti-Tampering", () => {
    function createDbMock(currentStatus = "ORDER_CREATED") {
      const transaction = {
        trackingEvent: { create: vi.fn() },
        shipment: {
          findUnique: vi.fn().mockResolvedValue({ id: "shipment-1", status: currentStatus }),
          update: vi.fn().mockResolvedValue({})
        }
      };
      const db = {
        $transaction: vi.fn(
          (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)
        )
      };
      return {
        db: db as unknown as Pick<PrismaClient, "$transaction">,
        transaction
      };
    }

    it("rejects illegal status skipping attempts with HTTP 409 Conflict", async () => {
      const { db } = createDbMock("ORDER_CREATED");
      await expect(
        recordCourierCheckpoint(db, "NEX-882910", {
          status: "DELIVERED",
          location: "Hub Seluas",
          description: "Mencoba loncat langsung ke delivered"
        })
      ).rejects.toMatchObject({ StatusCode: 409 });
    });

    it("locks terminal status preventing modification once package is delivered", async () => {
      const { db } = createDbMock("DELIVERED");
      await expect(
        recordCourierCheckpoint(db, "NEX-882910", {
          status: "IN_TRANSIT",
          location: "Hub Pontianak",
          description: "Mencoba ubah resi yang sudah selesai"
        })
      ).rejects.toMatchObject({ StatusCode: 409 });
    });
  });
});
