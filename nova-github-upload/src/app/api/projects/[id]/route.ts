import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, role: true, department: true },
            },
          },
        },
        tasks: {
          orderBy: { order: "asc" },
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            creator: {
              select: { id: true, name: true, email: true },
            },
            comments: {
              include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 15,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
    const calculatedProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : project.progress;

    return NextResponse.json({
      project: {
        ...project,
        totalTasks,
        doneTasks,
        progress: calculatedProgress,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, status, priority, dueDate, budget, progress } = body;

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
        ...(progress !== undefined && { progress: parseInt(progress) }),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATED_PROJECT",
        details: `Updated project "${updated.name}" settings and status to ${updated.status}`,
        projectId: updated.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ project: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
