import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [projects, tasks, activities, members] = await Promise.all([
      prisma.project.findMany({
        include: {
          tasks: { select: { status: true, priority: true } },
        },
      }),
      prisma.task.findMany({
        include: {
          project: { select: { id: true, name: true, key: true } },
          assignee: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          department: true,
          _count: {
            select: { assignedTasks: true },
          },
        },
      }),
    ]);

    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW").length;
    const todoTasks = tasks.filter((t) => t.status === "TODO").length;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const overallCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Status distribution
    const statusDistribution = [
      { status: "TODO", label: "To Do", count: todoTasks, color: "#94a3b8" },
      { status: "IN_PROGRESS", label: "In Progress", count: inProgressTasks, color: "#3b82f6" },
      { status: "IN_REVIEW", label: "In Review", count: inReviewTasks, color: "#f59e0b" },
      { status: "DONE", label: "Completed", count: completedTasks, color: "#10b981" },
    ];

    // Priority breakdown
    const priorityDistribution = [
      { priority: "URGENT", label: "Urgent", count: tasks.filter((t) => t.priority === "URGENT").length, color: "#ef4444" },
      { priority: "HIGH", label: "High", count: tasks.filter((t) => t.priority === "HIGH").length, color: "#f97316" },
      { priority: "MEDIUM", label: "Medium", count: tasks.filter((t) => t.priority === "MEDIUM").length, color: "#eab308" },
      { priority: "LOW", label: "Low", count: tasks.filter((t) => t.priority === "LOW").length, color: "#10b981" },
    ];

    // Member workload
    const memberWorkload = members.map((m) => ({
      id: m.id,
      name: m.name,
      avatarUrl: m.avatarUrl,
      role: m.role,
      department: m.department,
      assignedCount: m._count.assignedTasks,
    }));

    return NextResponse.json({
      metrics: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        inReviewTasks,
        todoTasks,
        overdueTasks,
        overallCompletionRate,
      },
      statusDistribution,
      priorityDistribution,
      memberWorkload,
      recentActivities: activities,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
