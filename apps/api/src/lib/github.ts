import { ApiError } from "./errors.js";
import { prisma } from "./prisma.js";

interface GithubCommitRecord {
  sha?: unknown;
  html_url?: unknown;
  commit?: {
    message?: unknown;
    author?: {
      name?: unknown;
      email?: unknown;
      date?: unknown;
    } | null;
    committer?: {
      date?: unknown;
    } | null;
  };
}

interface GithubCommitData {
  Sha: string;
  Message: string;
  AuthorName: string;
  AuthorEmail: string;
  CommittedAt: Date;
  CommitUrl: string;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNextPage(linkHeader: string | null): string | null {
  if (!linkHeader) {
    return null;
  }
  const nextLink = linkHeader
    .split(",")
    .map((link) => link.trim())
    .find((link) => link.endsWith('rel="next"'));
  const match = nextLink?.match(/<([^>]+)>/);
  return match?.[1] ?? null;
}

function parseCommit(record: GithubCommitRecord): GithubCommitData {
  const sha = getString(record.sha);
  const commitUrl = getString(record.html_url);
  const message = getString(record.commit?.message);
  const authorName = getString(record.commit?.author?.name);
  const authorEmail = getString(record.commit?.author?.email);
  const committedAt =
    getString(record.commit?.author?.date) ?? getString(record.commit?.committer?.date);

  if (!sha || !commitUrl || !message || !committedAt || Number.isNaN(Date.parse(committedAt))) {
    throw new ApiError(502, "Data commit yang diterima dari GitHub tidak lengkap.");
  }

  return {
    Sha: sha,
    Message: message,
    AuthorName: authorName || "Tidak diketahui",
    AuthorEmail: authorEmail || "",
    CommittedAt: new Date(committedAt),
    CommitUrl: commitUrl
  };
}

async function fetchGithubCommits(Owner: string, RepositoryName: string): Promise<GithubCommitData[]> {
  const commits: GithubCommitData[] = [];
  let nextUrl: string | null =
    `https://api.github.com/repos/${encodeURIComponent(Owner)}/${encodeURIComponent(RepositoryName)}/commits?per_page=100`;

  while (nextUrl) {
    let response: Response;
    try {
      response = await fetch(nextUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Lecturer-GitHub-Tracker",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {})
        },
        signal: AbortSignal.timeout(20000)
      });
    } catch {
      throw new ApiError(502, "Tidak dapat terhubung ke GitHub. Periksa koneksi lalu coba lagi.");
    }

    if (!response.ok) {
      const errorBody = (await response.text()).toLowerCase();
      if (response.status === 403 || response.status === 429) {
        if (
          response.status === 429 ||
          response.headers.get("x-ratelimit-remaining") === "0" ||
          response.headers.has("retry-after") ||
          errorBody.includes("rate limit")
        ) {
          throw new ApiError(429, "Batas permintaan GitHub tercapai. Coba lagi setelah beberapa saat.");
        }
        throw new ApiError(403, "GitHub menolak akses. Periksa izin repositori atau token GitHub.");
      }
      if (response.status === 404) {
        throw new ApiError(404, "Repositori tidak ditemukan, bersifat privat, atau tidak dapat diakses.");
      }
      if (response.status === 401) {
        throw new ApiError(401, "Token GitHub tidak valid. Periksa konfigurasi GITHUB_TOKEN.");
      }
      if (response.status === 422) {
        throw new ApiError(422, "GitHub tidak dapat membaca repositori atau daftar commit-nya.");
      }
      throw new ApiError(502, `GitHub API gagal merespons (HTTP ${response.status}).`);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(502, "GitHub mengirim respons JSON yang tidak valid.");
    }
    if (!Array.isArray(data)) {
      throw new ApiError(502, "Format data commit dari GitHub tidak valid.");
    }

    commits.push(...data.map((entry) => parseCommit(entry as GithubCommitRecord)));
    nextUrl = getNextPage(response.headers.get("link"));
  }

  return commits;
}

export async function synchronizeRepository(RepositoryId: string) {
  const repository = await prisma.repository.findUnique({ where: { Id: RepositoryId } });
  if (!repository) {
    throw new ApiError(404, "Repositori tidak ditemukan.");
  }

  const fetchedCommits = await fetchGithubCommits(repository.Owner, repository.RepositoryName);
  const LastSyncedAt = new Date();
  const result = await prisma.$transaction(async (transaction) => {
    const insertion = await transaction.commit.createMany({
      data: fetchedCommits.map((commit) => ({
        ...commit,
        RepositoryId
      })),
      skipDuplicates: true
    });
    await transaction.repository.update({
      where: { Id: RepositoryId },
      data: { LastSyncedAt }
    });
    return insertion;
  });

  const NewCommitCount = result.count;
  return {
    RepositoryId,
    FetchedCommitCount: fetchedCommits.length,
    NewCommitCount,
    ExistingCommitCount: fetchedCommits.length - NewCommitCount,
    LastSyncedAt: LastSyncedAt.toISOString(),
    Message: NewCommitCount === 0
      ? "Sinkronisasi berhasil. Tidak ada commit baru."
      : `${NewCommitCount} commit baru berhasil disimpan.`
  };
}
