// app/api/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { createId } from "@paralleldrive/cuid2"

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
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || ""
      const name = clerkUser?.firstName && clerkUser?.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}` 
        : null

      const userId = createId()

      user = await sql`
        INSERT INTO "User" ("id", "clerkId", "email", "name")
        VALUES (${userId}, ${clerkId}, ${email}, ${name})
        RETURNING *
      `
    }

    const userId = user[0].id

    // Changed "answer" to "value"
    const answers = await sql`
      SELECT "questionId", "value" FROM "Answer"
      WHERE "userId" = ${userId}
    `

    const answersMap: Record<number, string> = {}
    answers.forEach((answer: any) => {
      answersMap[answer.questionId] = answer.value.toString()
    })

    return NextResponse.json({ answers: answersMap })
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { questionId, answer } = await request.json()

    if (questionId === undefined || answer === undefined) {
      return NextResponse.json({ error: "Missing questionId or answer" }, { status: 400 })
    }

    // Validate answer range
    if (answer < 1 || answer > 5) {
      return NextResponse.json({ error: "Invalid answer value" }, { status: 400 })
    }

    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
    `

    if (user.length === 0) {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || ""
      const name = clerkUser?.firstName && clerkUser?.lastName 
        ? `${clerkUser.firstName} ${clerkUser.lastName}` 
        : null

      const userId = createId()

      user = await sql`
        INSERT INTO "User" ("id", "clerkId", "email", "name")
        VALUES (${userId}, ${clerkId}, ${email}, ${name})
        RETURNING *
      `
    }

    const userId = user[0].id
    const answerId = createId()
    const now = new Date()

    // Include updatedAt in INSERT
    const savedAnswer = await sql`
      INSERT INTO "Answer" ("id", "userId", "questionId", "value", "createdAt", "updatedAt")
      VALUES (${answerId}, ${userId}, ${questionId}, ${answer}, ${now.toISOString()}, ${now.toISOString()})
      ON CONFLICT ("userId", "questionId")
      DO UPDATE SET "value" = ${answer}, "updatedAt" = ${now.toISOString()}
      RETURNING *
    `

    return NextResponse.json({ success: true, answer: savedAnswer[0] })
  } catch (error) {
    console.error("Error saving answer:", error)
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 })
  }
}