import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db, WhiteboardData } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || searchParams.get("projectid");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(WhiteboardData)
      .where(eq(WhiteboardData.projectId, projectId));

    if (!result || result.length === 0) {
      return NextResponse.json({ elements: [], appState: {}, files: {} }, { status: 200 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching whiteboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch whiteboard data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const projectId = body.projectId || body.projectid;
    const { elements, appState, files } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const result = await db
      .insert(WhiteboardData)
      .values({
        projectId: projectId,
        elements: elements || [],
        appState: appState || {},
        files: files || {},
      })
      .onConflictDoUpdate({
        target: WhiteboardData.projectId,
        set: {
          elements: elements || [],
          appState: appState || {},
          files: files || {},
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error saving whiteboard data:", error);
    return NextResponse.json(
      { error: "Failed to save whiteboard data" },
      { status: 500 }
    );
  }
}