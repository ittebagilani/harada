// app/api/streak/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRes = await sql`SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1`;
    if (userRes.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userRes[0].id;

    // Get all daily task stats grouped by date (last 365 days)
    const stats = await sql`
      SELECT 
        date::date AS date,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE completed = true) AS completed
      FROM "DailyTask"
      WHERE "userId" = ${userId}
        AND date >= CURRENT_DATE - INTERVAL '365 days'
      GROUP BY date::date
      ORDER BY date DESC;
    `;

    // Build a map of date → { total, completed }
    const dayMap = new Map<string, { total: number; completed: number }>();
    stats.forEach((row: any) => {
      const dateKey = row.date.toISOString().split("T")[0];
      dayMap.set(dateKey, {
        total: Number(row.total),
        completed: Number(row.completed),
      });
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];

      const day = dayMap.get(dateKey);

      // No tasks on this day → streak ends
      if (!day || day.total === 0) {
        break;
      }

      // Success if at least 80% completed
      if (day.completed / day.total >= 0.8) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({ streak });
  } catch (error) {
    console.error("Error calculating streak:", error);
    return NextResponse.json({ error: "Failed to calculate streak" }, { status: 500 });
  }
}