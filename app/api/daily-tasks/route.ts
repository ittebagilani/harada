// app/api/daily-tasks/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from clerkId
    const userResult = await sql`
      SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1;
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Today's date at midnight (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split("T")[0];

    // Check if daily tasks already exist for today
    const existingTasks = await sql`
      SELECT dt.id, dt.completed, t.content, p.title AS "pillarTitle"
      FROM "DailyTask" dt
      JOIN "Task" t ON dt."taskId" = t.id
      JOIN "Pillar" p ON t."pillarId" = p.id
      WHERE dt."userId" = ${userId} AND dt.date = ${todayISO}::date;
    `;

    if (existingTasks.length > 0) {
      const tasks = existingTasks.map((row: any) => ({
        id: row.id,
        content: row.content,
        pillarTitle: row.pillarTitle,
        completed: row.completed,
      }));
      return NextResponse.json({ tasks });
    }

    // Get active plan with pillars and tasks
    const activePlanResult = await sql`
      SELECT pl.id AS "planId"
      FROM "Plan" pl
      WHERE pl."userId" = ${userId} AND pl."isActive" = true
      LIMIT 1;
    `;

    if (activePlanResult.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    const planId = activePlanResult[0].planId;

    // Get all tasks from active plan
    const allTasks = await sql`
      SELECT t.id, t.content, p.title AS "pillarTitle", p.id AS "pillarId"
      FROM "Task" t
      JOIN "Pillar" p ON t."pillarId" = p.id
      WHERE p."planId" = ${planId};
    `;

    if (allTasks.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    // Randomly select 5–7 tasks
    const numTasks = Math.min(Math.floor(Math.random() * 3) + 5, allTasks.length);
    const shuffled = allTasks.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffled.slice(0, numTasks);

    // Insert daily tasks
    const insertPromises = selectedTasks.map((task: any) =>
      sql`
        INSERT INTO "DailyTask" (id, "userId", "taskId", date, completed, "createdAt")
        VALUES (gen_random_uuid(), ${userId}, ${task.id}, ${todayISO}::date, false, NOW())
        RETURNING id, completed;
      `
    );

    const inserted = await Promise.all(insertPromises);

    // Fetch created daily tasks with task + pillar info
    const createdDailyTasks = await sql`
      SELECT dt.id, dt.completed, t.content, p.title AS "pillarTitle"
      FROM "DailyTask" dt
      JOIN "Task" t ON dt."taskId" = t.id
      JOIN "Pillar" p ON t."pillarId" = p.id
      WHERE dt."userId" = ${userId} AND dt.date = ${todayISO}::date;
    `;

    const tasks = createdDailyTasks.map((row: any) => ({
      id: row.id,
      content: row.content,
      pillarTitle: row.pillarTitle,
      completed: row.completed,
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily tasks" },
      { status: 500 }
    );
  }
}