CREATE TABLE `Course` (
    `Id` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `Semester` VARCHAR(191) NOT NULL,
    `Year` INTEGER NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Student` (
    `Id` VARCHAR(191) NOT NULL,
    `CourseId` VARCHAR(191) NOT NULL,
    `StudentNumber` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `GithubUsername` VARCHAR(191) NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Repository` (
    `Id` VARCHAR(191) NOT NULL,
    `StudentId` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `RepositoryUrl` VARCHAR(2048) NOT NULL,
    `Owner` VARCHAR(191) NOT NULL,
    `RepositoryName` VARCHAR(191) NOT NULL,
    `IsActive` BOOLEAN NOT NULL DEFAULT true,
    `LastSyncedAt` DATETIME(3) NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Commit` (
    `Id` VARCHAR(191) NOT NULL,
    `RepositoryId` VARCHAR(191) NOT NULL,
    `Sha` VARCHAR(64) NOT NULL,
    `Message` TEXT NOT NULL,
    `AuthorName` VARCHAR(191) NOT NULL,
    `AuthorEmail` VARCHAR(191) NOT NULL,
    `CommittedAt` DATETIME(3) NOT NULL,
    `CommitUrl` VARCHAR(2048) NOT NULL,
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `Student_CourseId_StudentNumber_key`
ON `Student`(`CourseId`, `StudentNumber`);

CREATE INDEX `Student_CourseId_idx` ON `Student`(`CourseId`);
CREATE INDEX `Repository_StudentId_idx` ON `Repository`(`StudentId`);
CREATE INDEX `Repository_IsActive_idx` ON `Repository`(`IsActive`);
CREATE UNIQUE INDEX `Commit_RepositoryId_Sha_key`
ON `Commit`(`RepositoryId`, `Sha`);
CREATE INDEX `Commit_RepositoryId_CommittedAt_idx`
ON `Commit`(`RepositoryId`, `CommittedAt`);

ALTER TABLE `Student`
ADD CONSTRAINT `Student_CourseId_fkey`
FOREIGN KEY (`CourseId`) REFERENCES `Course`(`Id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Repository`
ADD CONSTRAINT `Repository_StudentId_fkey`
FOREIGN KEY (`StudentId`) REFERENCES `Student`(`Id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Commit`
ADD CONSTRAINT `Commit_RepositoryId_fkey`
FOREIGN KEY (`RepositoryId`) REFERENCES `Repository`(`Id`)
ON DELETE CASCADE ON UPDATE CASCADE;
