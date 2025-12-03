import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, completed } = await req.json();
    if (typeof taskId !== "string" || typeof completed !== "boolean") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Get user ID
    const userRes = await sql`SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1`;
    if (userRes.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userRes[0].id;

    // Update task
    const result = await sql`
      UPDATE "DailyTask"
      SET 
        completed = ${completed},
        "completedAt" = ${completed ? new Date().toISOString() : null}
      WHERE id = ${taskId} AND "userId" = ${userId}
      RETURNING id, completed, "completedAt", date;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found or not owned by user" }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: result[0] });
  } catch (error) {
    console.error("Error toggling task:", error);
    return NextResponse.json({ error: "Failed to toggle task" }, { status: 500 });
  }
}