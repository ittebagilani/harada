// app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { createId } from "@paralleldrive/cuid2"

interface Answer {
  questionId: number
  value: number
}

interface Pillar {
  id: string
  title: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user
    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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
      return NextResponse.json({ error: "No active plan found" }, { status: 404 })
    }

    const planId = plan[0].id
    const goal = plan[0].goal

    // Get pillars
    const pillars = await sql`
      SELECT "id", "title" FROM "Pillar"
      WHERE "planId" = ${planId}
      ORDER BY "createdAt"
    `

    if (pillars.length === 0) {
      return NextResponse.json({ error: "No pillars found" }, { status: 404 })
    }

    // Get answers
    const answers = await sql`
      SELECT "questionId", "value" FROM "Answer"
      WHERE "userId" = ${userId}
      ORDER BY "questionId"
    `

    // Format data for AI
    const formattedAnswers = formatAnswersForAI(answers as Answer[])
    const pillarsList = pillars.map((p: any) => p.title).join(", ")

    // Call Claude API with API key from environment
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!, // Add API key here
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `You are a personal development coach creating actionable task lists.

USER'S MAIN GOAL: ${goal}

USER'S 8 FOCUS PILLARS: ${pillarsList}

USER'S SELF-ASSESSMENT (1=strongly disagree, 5=strongly agree):
${formattedAnswers}

Based on the user's goal, their chosen pillars, and their self-assessment responses, create 8 specific, actionable tasks for EACH pillar. Each task should:
- Be concrete and achievable
- Build progressively in difficulty (task 1 easiest, task 8 most challenging)
- Directly support both the pillar AND the main goal
- Be personalized based on their self-assessment (if they rated discipline low, make discipline tasks more foundational)

Return ONLY a JSON object in this exact format with no markdown, no preamble:
{
  "tasks": {
    "Pillar Name 1": ["task 1", "task 2", "task 3", "task 4", "task 5", "task 6", "task 7", "task 8"],
    "Pillar Name 2": ["task 1", "task 2", "task 3", "task 4", "task 5", "task 6", "task 7", "task 8"],
    ...
  }
}

Use the EXACT pillar names provided.`
          }
        ]
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error("AI API error:", errorText)
      throw new Error(`AI API error: ${aiResponse.statusText}`)
    }

    const aiData = await aiResponse.json()
    const aiText = aiData.content[0].text

    // Parse AI response
    let tasksData
    try {
      // Remove any markdown code blocks if present
      const cleanText = aiText.replace(/```json\n?|```\n?/g, "").trim()
      tasksData = JSON.parse(cleanText)
    } catch (e) {
      console.error("Failed to parse AI response:", aiText)
      throw new Error("Invalid AI response format")
    }

    // Save tasks to database
    const now = new Date()
    const savedTasks = []

    for (const pillar of pillars as Pillar[]) {
      const pillarTasks = tasksData.tasks[pillar.title]
      
      if (!pillarTasks || !Array.isArray(pillarTasks)) {
        console.warn(`No tasks found for pillar: ${pillar.title}`)
        continue
      }

      // Delete existing tasks for this pillar
      await sql`
        DELETE FROM "Task" WHERE "pillarId" = ${pillar.id}
      `

      // Insert new tasks
      for (let i = 0; i < pillarTasks.length; i++) {
        const taskId = createId()
        const task = await sql`
          INSERT INTO "Task" ("id", "pillarId", "order", "content", "createdAt", "updatedAt")
          VALUES (${taskId}, ${pillar.id}, ${i}, ${pillarTasks[i]}, ${now.toISOString()}, ${now.toISOString()})
          RETURNING *
        `
        savedTasks.push(task[0])
      }
    }

    return NextResponse.json({
      success: true,
      tasksCount: savedTasks.length,
      message: "Plan generated successfully"
    })
  } catch (error) {
    console.error("Error generating plan:", error)
    return NextResponse.json({ 
      error: "Failed to generate plan",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

function formatAnswersForAI(answers: Answer[]): string {
  const QUESTIONS = [
    "I believe I currently have the skills needed to reach this goal.",
    "I am confident in my long-term discipline.",
    "I have a supportive environment for achieving my dream.",
    "I understand the steps required to reach my goal.",
    // Add all 36 questions here
  ]

  const ANSWER_LABELS: Record<number, string> = {
    1: "strongly disagree",
    2: "disagree",
    3: "neutral",
    4: "agree",
    5: "strongly agree",
  }

  return answers
    .map(({ questionId, value }) => {
      const question = QUESTIONS[questionId] || `Question ${questionId + 1}`
      const answer = ANSWER_LABELS[value] || value.toString()
      return `- ${question}: ${answer}`
    })
    .join("\n")
}