import { ApiError } from "./errors.js";

export type RequestBody = Record<string, unknown>;

export function getRequestBody(body: unknown): RequestBody {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "Isi permintaan harus berupa objek JSON.");
  }
  return body as RequestBody;
}

export function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `${label} wajib diisi.`);
  }
  return value.trim();
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, "Email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Format email tidak valid.");
  }
  return email;
}

export function requireYear(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 2000 || value > 2200) {
    throw new ApiError(400, "Tahun harus berupa angka antara 2000 dan 2200.");
  }
  return value;
}

export function parseGithubRepositoryUrl(value: unknown): {
  RepositoryUrl: string;
  Owner: string;
  RepositoryName: string;
} {
  const repositoryUrl = requireString(value, "URL repositori");
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(repositoryUrl);
  } catch {
    throw new ApiError(400, "URL repositori GitHub tidak valid.");
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname.toLowerCase() !== "github.com" ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash ||
    segments.length !== 2
  ) {
    throw new ApiError(400, "Gunakan URL repositori publik GitHub: https://github.com/pemilik/repositori.");
  }

  const Owner = segments[0];
  const RepositoryName = segments[1].replace(/\.git$/i, "");
  if (!/^[A-Za-z0-9-]+$/.test(Owner) || !/^[A-Za-z0-9_.-]+$/.test(RepositoryName)) {
    throw new ApiError(400, "Nama pemilik atau repositori GitHub tidak valid.");
  }

  return {
    RepositoryUrl: `https://github.com/${Owner}/${RepositoryName}`,
    Owner,
    RepositoryName
  };
}

export function requireParam(value: string | string[] | undefined, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, `${label} tidak valid.`);
  }
  return value;
}
