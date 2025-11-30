// app/api/generate-pillars/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

interface Answer {
  questionId: number
  value: number
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let user = await sql`
      SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = user[0].id

    // Get goal
    const plan = await sql`
      SELECT "goal" FROM "Plan" 
      WHERE "userId" = ${userId} AND "isActive" = true
      ORDER BY "createdAt" DESC
      LIMIT 1
    `

    const goal = plan.length > 0 ? plan[0].goal : "Personal growth"

    // Get answers
    const answers = await sql`
      SELECT "questionId", "value" FROM "Answer"
      WHERE "userId" = ${userId}
      ORDER BY "questionId"
    `

    if (answers.length === 0) {
      return NextResponse.json({ error: "No answers found" }, { status: 404 })
    }

    // Format answers for AI
    const formattedAnswers = formatAnswersForAI(answers as Answer[])

    // Call Claude API
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a personal development coach analyzing self-assessment responses.

USER'S GOAL: ${goal}

USER'S SELF-ASSESSMENT (1=strongly disagree, 5=strongly agree):
${formattedAnswers}

Based on their responses, identify the 8 most important life areas (pillars) this person should focus on to achieve their goal. Focus on areas where they scored lowest or where improvement would have the biggest impact.

Common pillar categories include: Discipline, Health, Networking, Finance, Relationships, Career, Personal Growth, Spirituality, Skills, Mindset, Time Management, Learning, Creativity, etc.

Return ONLY a JSON array of exactly 8 pillar names, nothing else:
["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4", "Pillar 5", "Pillar 6", "Pillar 7", "Pillar 8"]

Keep pillar names short (1-3 words each).`
          }
        ]
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`)
    }

    const aiData = await aiResponse.json()
    const aiText = aiData.content[0].text

    // Parse AI response
    let pillars: string[]
    try {
      const cleanText = aiText.replace(/```json\n?|```\n?/g, "").trim()
      pillars = JSON.parse(cleanText)
      
      if (!Array.isArray(pillars) || pillars.length !== 8) {
        throw new Error("Invalid pillars format")
      }
    } catch (e) {
      console.error("Failed to parse AI response:", aiText)
      throw new Error("Invalid AI response format")
    }

    return NextResponse.json({
      success: true,
      pillars
    })
  } catch (error) {
    console.error("Error generating pillars:", error)
    return NextResponse.json({ 
      error: "Failed to generate pillars",
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
      return `- ${question}: ${answer} (${value}/5)`
    })
    .join("\n")
}