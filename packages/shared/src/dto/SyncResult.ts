export interface SyncResult {
  RepositoryId: string;
  FetchedCommitCount: number;
  NewCommitCount: number;
  ExistingCommitCount: number;
  LastSyncedAt: string;
  Message: string;
}

export interface RepositorySyncOutcome {
  RepositoryId: string;
  Success: boolean;
  FetchedCommitCount: number;
  NewCommitCount: number;
  ExistingCommitCount: number;
  LastSyncedAt: string | null;
  Message: string;
}

export interface CourseSyncResponse {
  Results: RepositorySyncOutcome[];
}
