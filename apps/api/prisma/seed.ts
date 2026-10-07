import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const course = await prisma.course.upsert({
    where: { Id: "example-course" },
    update: {},
    create: {
      Id: "example-course",
      Name: "Rekayasa Perangkat Lunak",
      Semester: "Ganjil",
      Year: 2026
    }
  });

  const students = [
    {
      Id: "example-student-1",
      StudentNumber: "2026001",
      Name: "Mahasiswa Contoh 1",
      Email: "mahasiswa1@example.com",
      GithubUsername: "octocat"
    },
    {
      Id: "example-student-2",
      StudentNumber: "2026002",
      Name: "Mahasiswa Contoh 2",
      Email: "mahasiswa2@example.com",
      GithubUsername: "vercel"
    },
    {
      Id: "example-student-3",
      StudentNumber: "2026003",
      Name: "Mahasiswa Contoh 3",
      Email: "mahasiswa3@example.com",
      GithubUsername: "vitejs"
    }
  ];

  const repositoryValues = [
    {
      Id: "example-repository-1",
      Name: "Hello-World",
      RepositoryUrl: "https://github.com/octocat/Hello-World",
      Owner: "octocat",
      RepositoryName: "Hello-World"
    },
    {
      Id: "example-repository-2",
      Name: "Next.js",
      RepositoryUrl: "https://github.com/vercel/next.js",
      Owner: "vercel",
      RepositoryName: "next.js"
    },
    {
      Id: "example-repository-3",
      Name: "Vite",
      RepositoryUrl: "https://github.com/vitejs/vite",
      Owner: "vitejs",
      RepositoryName: "vite"
    }
  ];

  for (const [index, student] of students.entries()) {
    await prisma.student.upsert({
      where: { Id: student.Id },
      update: {},
      create: { ...student, CourseId: course.Id }
    });

    await prisma.repository.upsert({
      where: { Id: repositoryValues[index].Id },
      update: {},
      create: {
        ...repositoryValues[index],
        StudentId: student.Id,
        IsActive: true
      }
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error("Gagal menjalankan seed data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
