// lib/questions.ts
export const QUESTIONS = [
  "I believe I currently have the skills needed to reach this goal.",
  "I am confident in my long-term discipline.",
  "I have a supportive environment for achieving my dream.",
  "I understand the steps required to reach my goal.",
  // ... add all 36 questions
]

export const ANSWER_OPTIONS = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
] as const

export const ANSWER_LABELS: Record<number, string> = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree",
}

export type AnswerValue = 1 | 2 | 3 | 4 | 5