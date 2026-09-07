import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const assigneeId = searchParams.get("assigneeId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const where: any = {};
    if (projectId && projectId !== "ALL") where.projectId = projectId;
    if (assigneeId && assigneeId !== "ALL") where.assigneeId = assigneeId;
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { taskCode: { contains: search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        project: {
          select: { id: true, name: true, key: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, projectId, assigneeId, priority, dueDate, status } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "Task title and project are required." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { _count: { select: { tasks: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const taskCount = project._count.tasks + 1;
    const taskCode = `${project.key}-${100 + taskCount}`;

    const task = await prisma.task.create({
      data: {
        taskCode,
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: user.id,
        order: taskCount,
      },
      include: {
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATED_TASK",
        details: `Created task "${task.taskCode}: ${task.title}"`,
        projectId: project.id,
        taskId: task.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
