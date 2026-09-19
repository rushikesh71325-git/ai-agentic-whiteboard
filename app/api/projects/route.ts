import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db, projects, WhiteboardData } from "@/db";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("projectid");

    if (projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.projectId, projectId));

      if (!project || project.length === 0) {
        return NextResponse.json({ message: "Project not found" }, { status: 404 });
      }

      return NextResponse.json(project[0], { status: 200 });
    }

    const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userEmail, userEmail))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json(userProjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectName, projectId } = body;

    if (!projectId || !projectName) {
      return NextResponse.json({ message: "Missing Required Data" }, { status: 400 });
    }

    const result = await db
      .insert(projects)
      .values({
        projectId: projectId,
        projectName: projectName ?? "Untitled Project",
        userEmail: user?.primaryEmailAddress?.emailAddress ?? "",
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("projectid");

    if (!projectId) {
      return NextResponse.json({ message: "Missing projectId" }, { status: 400 });
    }

    await db
      .delete(WhiteboardData)
      .where(eq(WhiteboardData.projectId, projectId));

    const deleted = await db
      .delete(projects)
      .where(eq(projects.projectId, projectId))
      .returning();

    return NextResponse.json({ message: "Project deleted successfully", deleted }, { status: 200 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Failed to delete project" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, projectName } = body;

    if (!projectId || !projectName) {
      return NextResponse.json({ message: "Missing Required Data" }, { status: 400 });
    }

    const updated = await db
      .update(projects)
      .set({ projectName })
      .where(eq(projects.projectId, projectId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Failed to update project" },
      { status: 500 }
    );
  }
}
