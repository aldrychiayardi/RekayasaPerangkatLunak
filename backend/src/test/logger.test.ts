import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { maskSensitiveData, safeLogger } from "../lib/logger.js";

describe("Secure Logging & Data Masking", () => {
  it("masks password, token, and secret fields in payloads", () => {
    const rawPayload = {
      name: "Budi Santoso",
      email: "budi@nusantara.com",
      password: "SuperSecretPassword123!",
      userToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      nested: {
        apiSecret: "secret-key-999",
        recipientPhone: "081234567890",
        itemDescription: "Dokumen Penting"
      }
    };

    const sanitized = maskSensitiveData(rawPayload) as typeof rawPayload;

    expect(sanitized.name).toBe("Budi Santoso");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.userToken).toBe("[REDACTED]");
    expect(sanitized.email).toBe("b***@nusantara.com");
    expect(sanitized.nested.apiSecret).toBe("[REDACTED]");
    expect(sanitized.nested.recipientPhone).toBe("0812****890");
    expect(sanitized.nested.itemDescription).toBe("Dokumen Penting");
  });

  it("handles primitive and non-object inputs safely", () => {
    expect(maskSensitiveData("plain text")).toBe("plain text");
    expect(maskSensitiveData(12345)).toBe(12345);
    expect(maskSensitiveData(null)).toBeNull();
    expect(maskSensitiveData(undefined)).toBeUndefined();
  });

  it("registers finish handler and calls next() without blocking execution", () => {
    const mockReq = {
      method: "POST",
      url: "/api/shipments",
      body: { senderName: "Andi", password: "secret" }
    } as Request;

    const listeners: Record<string, () => void> = {};
    const mockRes = {
      statusCode: 201,
      on: vi.fn((event: string, callback: () => void) => {
        listeners[event] = callback;
      })
    } as unknown as Response;

    const mockNext = vi.fn();

    safeLogger(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRes.on).toHaveBeenCalledWith("finish", expect.any(Function));
  });
});

