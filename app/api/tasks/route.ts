// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
    `

    if (user.length === 0) {
      return NextResponse.json({ tasks: [], pillars: [] })
    }

    const userId = user[0].id

    // Get active plan
    const plan = await sql`
      SELECT * FROM "Plan" 
      WHERE "userId" = ${userId} AND "isActive" = true
      ORDER BY "createdAt" DESC
      LIMIT 1
    `

    if (plan.length === 0) {
      return NextResponse.json({ tasks: [], pillars: [] })
    }

    const planId = plan[0].id

    // Get pillars with their tasks
    const pillars = await sql`
      SELECT "id", "title" FROM "Pillar"
      WHERE "planId" = ${planId}
      ORDER BY "createdAt"
    `

    const tasksData = []

    for (const pillar of pillars as any[]) {
      const tasks = await sql`
        SELECT "id", "order", "content" FROM "Task"
        WHERE "pillarId" = ${pillar.id}
        ORDER BY "order"
      `

      tasksData.push({
        pillarId: pillar.id,
        pillarTitle: pillar.title,
        tasks: tasks
      })
    }

    return NextResponse.json({ 
      pillars: pillars,
      tasksData: tasksData
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}