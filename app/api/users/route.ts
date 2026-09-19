import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }

    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userData.length > 0) {
      return NextResponse.json({ user: userData[0] }, { status: 200 });
    }

    const result = await db
      .insert(users)
      .values({
        name: user.fullName,
        email: email,
        credits: 3,
      })
      .returning();

    return NextResponse.json({ user: result[0] }, { status: 200 });
  } catch (error) {
    console.error("Error in users GET:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "User Not Found" }, { status: 404 });
    }

    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userData.length > 0) {
      return NextResponse.json({ user: userData[0] }, { status: 200 });
    }

    const result = await db
      .insert(users)
      .values({
        name: user.fullName,
        email: email,
        credits: 3,
      })
      .returning();

    return NextResponse.json({ user: result[0] }, { status: 200 });
  } catch (error) {
    console.error("Error in users POST:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}