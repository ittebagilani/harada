// lib/questions.ts
export const QUESTIONS = [
  "I believe I currently have the skills needed to reach this goal.",
  "I am confident in my long-term discipline.",
  "I have a supportive environment for achieving my dream.",
  "I understand the steps required to reach my goal.",
  // ... add all 36 questions
]

export const ANSWER_OPTIONS = [
  { label: "strongly disagree", value: 1 },
  { label: "disagree", value: 2 },
  { label: "neutral", value: 3 },
  { label: "agree", value: 4 },
  { label: "strongly agree", value: 5 },
] as const

export const ANSWER_LABELS: Record<number, string> = {
  1: "strongly disagree",
  2: "disagree",
  3: "neutral",
  4: "agree",
  5: "strongly agree",
}

export type AnswerValue = 1 | 2 | 3 | 4 | 5