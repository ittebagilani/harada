// app/api/weekly-completions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await sql`
      SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1;
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    const completions = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateISO = date.toISOString().split("T")[0];

      const result = await sql`
        SELECT 
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE completed = true) AS completed
        FROM "DailyTask"
        WHERE "userId" = ${userId} AND date = ${dateISO}::date;
      `;

      const row = result[0];
      completions.push({
        date: date.toISOString(),
        completed: Number(row.completed) || 0,
        total: Number(row.total) || 0,
      });
    }

    return NextResponse.json({ completions });
  } catch (error) {
    console.error("Error fetching weekly completions:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly completions" },
      { status: 500 }
    );
  }
}