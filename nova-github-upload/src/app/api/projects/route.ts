import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (priority && priority !== "ALL") where.priority = priority;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { key: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, role: true },
            },
          },
        },
        tasks: {
          select: { id: true, status: true, priority: true },
        },
      },
    });

    const enriched = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter((t) => t.status === "DONE").length;
      const calculatedProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : p.progress;

      return {
        ...p,
        totalTasks,
        doneTasks,
        progress: calculatedProgress,
      };
    });

    return NextResponse.json({ projects: enriched });
  } catch (error: any) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, key, description, priority, dueDate, budget } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const projectKey = (key || name.replace(/[^a-zA-Z]/g, "").slice(0, 4)).toUpperCase();

    // Check duplicate key
    const existing = await prisma.project.findUnique({
      where: { key: projectKey },
    });

    const finalKey = existing ? `${projectKey}-${Math.floor(10 + Math.random() * 90)}` : projectKey;

    const project = await prisma.project.create({
      data: {
        name,
        key: finalKey,
        description,
        priority: priority || "MEDIUM",
        status: "IN_PROGRESS",
        dueDate: dueDate ? new Date(dueDate) : null,
        budget: budget ? parseFloat(budget) : null,
        ownerId: user.id,
        members: {
          create: [{ userId: user.id, role: "OWNER" }],
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "CREATED_PROJECT",
        details: `Created project "${project.name}" (${project.key})`,
        projectId: project.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
