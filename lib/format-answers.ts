// lib/format-answers.ts
import { QUESTIONS, ANSWER_LABELS } from "./questions"

export interface RawAnswer {
  questionId: number
  answer: string
}

export interface FormattedAnswer {
  questionId: number
  question: string
  numericValue: number
  textValue: string
}

export function formatAnswersForAI(rawAnswers: RawAnswer[]): FormattedAnswer[] {
  return rawAnswers.map(({ questionId, answer }) => {
    const numericValue = parseInt(answer)
    return {
      questionId,
      question: QUESTIONS[questionId],
      numericValue,
      textValue: ANSWER_LABELS[numericValue]
    }
  })
}

export function formatAnswersForPrompt(rawAnswers: RawAnswer[]): string {
  const formatted = formatAnswersForAI(rawAnswers)
  return formatted
    .map(({ question, textValue }) => `Q: ${question}\nA: ${textValue}`)
    .join('\n\n')
}