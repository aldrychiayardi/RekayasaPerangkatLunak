import type { ActivityStatus } from "../enums/ActivityStatus.js";
import type { Commit } from "../models/Commit.js";
import type { Course } from "../models/Course.js";
import type { Repository } from "../models/Repository.js";
import type { Student } from "../models/Student.js";

export interface CourseSummary {
  TotalStudents: number;
  TotalRepositories: number;
  TotalCommits: number;
  ActiveStudents: number;
  InactiveStudents: number;
  StudentsWithoutCommits: number;
}

export interface StudentProgressSummary {
  StudentId: string;
  StudentName: string;
  StudentNumber: string;
  RepositoryCount: number;
  TotalCommits: number;
  LatestCommitAt: string | null;
  ActivityStatus: ActivityStatus;
}

export interface DashboardResponse {
  Course: Course;
  Summary: CourseSummary;
  Students: StudentProgressSummary[];
}

export interface RepositoryResponse extends Repository {
  CommitCount: number;
}

export interface StudentProgressResponse {
  Student: Student;
  Repositories: RepositoryResponse[];
  TotalCommits: number;
  LatestCommitAt: string | null;
  Commits: Commit[];
}
