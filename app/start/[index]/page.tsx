"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useState } from "react"

const QUESTIONS = [
  "I believe I currently have the skills needed to reach this goal.",
  "I am confident in my long-term discipline.",
  "I have a supportive environment for achieving my dream.",
  "I understand the steps required to reach my goal.",
]

const OPTIONS = [
  { label: "strongly disagree", value: 1 },
  { label: "disagree", value: 2 },
  { label: "neutral", value: 3 },
  { label: "agree", value: 4 },
  { label: "strongly agree", value: 5 },
]

export default function OnboardingQuestion() {
  const router = useRouter()
  const { index } = useParams() as { index: string }
  const questionIndex = Number.parseInt(index)
  const question = QUESTIONS[questionIndex]

  const [value, setValue] = useState<number | null>(null)

  const goNext = () => {
    if (value === null) return
    if (questionIndex < QUESTIONS.length - 1) {
      router.push(`/start/${questionIndex + 1}`)
    } else {
      router.push("/results")
    }
  }

  const goBack = () => {
    if (questionIndex > 0) {
      router.push(`/start/${questionIndex - 1}`)
    }
  }

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center text-center px-6 py-12">
       <h1 className="text-4xl md:text-7xl font-light tracking-tight -mt-10 mb-8 max-w-2xl leading-relaxed">grid64</h1>
      {/* Progress indicator */}
      <p className="text-muted-foreground mb-8 tracking-wide">
        Question {questionIndex + 1} of {QUESTIONS.length}
      </p>

      {/* Question */}
      <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-8 max-w-2xl leading-relaxed">{question}</h1>

      {/* <p className="text-muted-foreground mb-16 text-base">be honest. to yourself.</p> */}

      <div className="w-full max-w-2xl mb-12">
        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setValue(option.value)}
              className={`
                w-full py-4 px-6 rounded-sm border transition-all duration-200
                text-md font-light tracking-wide
                ${
                  value === option.value
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-foreground/40"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 md:gap-6">
        <button
          onClick={goBack}
          disabled={questionIndex === 0}
          className="px-8 py-2 rounded-sm border border-border text-foreground hover:border-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg font-light"
        >
          back
        </button>

        <button
          onClick={goNext}
          disabled={value === null}
          className="px-8 py-2 rounded-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg font-light"
        >
          next
        </button>
      </div>
    </section>
  )
}
