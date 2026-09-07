import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NOVA platform database...");

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users
  const alex = await prisma.user.create({
    data: {
      email: "alex@novahq.com",
      password: passwordHash,
      name: "Alex Rivera",
      role: "ADMIN",
      department: "Engineering Leadership",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: "sarah@novahq.com",
      password: passwordHash,
      name: "Sarah Chen",
      role: "MANAGER",
      department: "Product Management",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      email: "marcus@novahq.com",
      password: passwordHash,
      name: "Marcus Vance",
      role: "MEMBER",
      department: "Full Stack Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: "elena@novahq.com",
      password: passwordHash,
      name: "Elena Rostova",
      role: "MEMBER",
      department: "Design & UX",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  });

  const david = await prisma.user.create({
    data: {
      email: "david@novahq.com",
      password: passwordHash,
      name: "David Kim",
      role: "MEMBER",
      department: "DevOps & QA",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("Users created successfully.");

  // 2. Create Projects
  const projectNova = await prisma.project.create({
    data: {
      name: "NOVA Cloud Platform 2.0",
      key: "NOVA",
      description: "Next-generation collaborative workspace architecture with real-time sync and metrics.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      startDate: new Date(Date.now() - 14 * 86400000),
      dueDate: new Date(Date.now() + 30 * 86400000),
      budget: 85000,
      progress: 68,
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: "OWNER" },
          { userId: sarah.id, role: "MANAGER" },
          { userId: marcus.id, role: "MEMBER" },
          { userId: elena.id, role: "MEMBER" },
          { userId: david.id, role: "MEMBER" },
        ],
      },
    },
  });

  const projectMobile = await prisma.project.create({
    data: {
      name: "Mobile App iOS & Android",
      key: "MOB",
      description: "Native cross-platform client for on-the-go task status updates, notifications, and time tracking.",
      status: "PLANNING",
      priority: "MEDIUM",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 60 * 86400000),
      budget: 45000,
      progress: 25,
      ownerId: sarah.id,
      members: {
        create: [
          { userId: sarah.id, role: "OWNER" },
          { userId: elena.id, role: "MANAGER" },
          { userId: marcus.id, role: "MEMBER" },
        ],
      },
    },
  });

  const projectSecurity = await prisma.project.create({
    data: {
      name: "Enterprise Security & SOC2 Compliance",
      key: "SEC",
      description: "End-to-end encryption audit, penetration testing, and automated security scanning pipeline.",
      status: "COMPLETED",
      priority: "URGENT",
      startDate: new Date(Date.now() - 45 * 86400000),
      dueDate: new Date(Date.now() - 5 * 86400000),
      budget: 60000,
      progress: 100,
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: "OWNER" },
          { userId: david.id, role: "MANAGER" },
        ],
      },
    },
  });

  console.log("Projects created successfully.");

  // 3. Create Tasks for NOVA Project
  const task1 = await prisma.task.create({
    data: {
      taskCode: "NOVA-101",
      title: "Design unified design token library & dark theme UI",
      description: "Establish semantic color palettes, typography scales, and responsive card layouts across mobile and web.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(Date.now() - 3 * 86400000),
      order: 1,
      projectId: projectNova.id,
      assigneeId: elena.id,
      creatorId: sarah.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      taskCode: "NOVA-102",
      title: "Implement JWT authentication & role-based route guard",
      description: "Build secure HTTP-only cookie auth flow with refresh capabilities and bcrypt password hashing.",
      status: "DONE",
      priority: "URGENT",
      dueDate: new Date(Date.now() - 1 * 86400000),
      order: 2,
      projectId: projectNova.id,
      assigneeId: marcus.id,
      creatorId: alex.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      taskCode: "NOVA-103",
      title: "Build drag-and-drop Kanban board with column transitions",
      description: "Enable intuitive status transitions between To Do, In Progress, In Review, and Done with smooth UI feedback.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 4 * 86400000),
      order: 3,
      projectId: projectNova.id,
      assigneeId: marcus.id,
      creatorId: sarah.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      taskCode: "NOVA-104",
      title: "Implement analytics aggregation API for team velocity & KPIs",
      description: "Calculate completion percentages, overdue metrics, workload distributions, and project health indicators.",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 2 * 86400000),
      order: 4,
      projectId: projectNova.id,
      assigneeId: david.id,
      creatorId: alex.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      taskCode: "NOVA-105",
      title: "Multi-stage Docker containerization & production deployment guide",
      description: "Prepare standalone lightweight Alpine Dockerfile, docker-compose configuration, and env documentation.",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 10 * 86400000),
      order: 5,
      projectId: projectNova.id,
      assigneeId: david.id,
      creatorId: alex.id,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      taskCode: "NOVA-106",
      title: "Task filter, search & multi-column sorting in table view",
      description: "Allow users to filter tasks by priority, status, assignee, and text query with instant reactivity.",
      status: "TODO",
      priority: "LOW",
      dueDate: new Date(Date.now() + 12 * 86400000),
      order: 6,
      projectId: projectNova.id,
      assigneeId: elena.id,
      creatorId: sarah.id,
    },
  });

  // Mobile App tasks
  await prisma.task.create({
    data: {
      taskCode: "MOB-201",
      title: "Conduct user journey research & navigation wireframes",
      description: "Map primary bottom-tab navigation and quick task creation flows for mobile screens.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 7 * 86400000),
      order: 1,
      projectId: projectMobile.id,
      assigneeId: elena.id,
      creatorId: sarah.id,
    },
  });

  await prisma.task.create({
    data: {
      taskCode: "MOB-202",
      title: "Set up React Native / Expo repository boilerplate",
      description: "Initialize TypeScript template with Tailwind NativeWind and offline storage cache.",
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 14 * 86400000),
      order: 2,
      projectId: projectMobile.id,
      assigneeId: marcus.id,
      creatorId: sarah.id,
    },
  });

  // 4. Create Comments
  await prisma.comment.create({
    data: {
      content: "Initial Figma tokens and color variables have been verified and pushed to the repository.",
      taskId: task1.id,
      authorId: elena.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "JWT auth is working cleanly with HTTP-only cookie and Bearer header fallback. Ready for review.",
      taskId: task2.id,
      authorId: marcus.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Great job! Let's ensure drag-and-drop supports touch events as well.",
      taskId: task3.id,
      authorId: sarah.id,
    },
  });

  // 5. Create Activity Logs
  await prisma.activityLog.create({
    data: {
      action: "CREATED_PROJECT",
      details: "Created project NOVA Cloud Platform 2.0",
      projectId: projectNova.id,
      userId: alex.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "COMPLETED_TASK",
      details: "Completed task NOVA-101 (Design unified design token library)",
      projectId: projectNova.id,
      taskId: task1.id,
      userId: elena.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "UPDATED_TASK_STATUS",
      details: "Moved task NOVA-103 to In Progress",
      projectId: projectNova.id,
      taskId: task3.id,
      userId: marcus.id,
    },
  });

  console.log("Database seeded successfully with NOVA sample data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
