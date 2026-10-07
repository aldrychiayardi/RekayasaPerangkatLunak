export interface Repository {
  Id: string;
  StudentId: string;
  Name: string;
  RepositoryUrl: string;
  Owner: string;
  RepositoryName: string;
  IsActive: boolean;
  LastSyncedAt: string | null;
  CreatedAt: string;
}
