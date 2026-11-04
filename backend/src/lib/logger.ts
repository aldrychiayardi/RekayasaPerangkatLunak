import type { Request, Response, NextFunction } from "express";

export function maskSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token")
    ) {
      masked[key] = "[REDACTED]";
    } else if (lowerKey.includes("phone") && typeof value === "string") {
      masked[key] = value.length > 4 ? `${value.slice(0, 4)}****${value.slice(-3)}` : "****";
    } else if (lowerKey.includes("email") && typeof value === "string" && value.includes("@")) {
      const [user, domain] = value.split("@");
      masked[key] = `${user[0]}***@${domain}`;
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

export function safeLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Log format terstruktur dan aman dari kebocoran PII
    const logEntry = {
      timestamp,
      method,
      url,
      statusCode,
      durationMs: duration,
      ...(method !== "GET" && req.body ? { sanitizedPayload: maskSensitiveData(req.body) } : {})
    };

    if (statusCode >= 400) {
      console.warn(`[WARN] ${JSON.stringify(logEntry)}`);
    } else {
      console.log(`[INFO] ${JSON.stringify(logEntry)}`);
    }
  });

  next();
}

