"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { QUESTIONS, ANSWER_OPTIONS } from "@/lib/questions";


export default function StartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { index } = useParams() as { index: string };
  const questionIndex = Number.parseInt(index);
  const question = QUESTIONS[questionIndex];
  const isNewGoal = searchParams?.get("newGoal") === "true";

  const [value, setValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        const response = await fetch("/api/onboarding");
        if (response.ok) {
          const data = await response.json();
          const savedAnswer = data.answers[questionIndex];
          if (savedAnswer) {
            setValue(Number.parseInt(savedAnswer));
          }
        }
      } catch (error) {
        console.error("Error loading answers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnswers();
  }, [questionIndex]);

  useEffect(() => {
    if (value === null || isLoading) return;

    const saveAnswer = async () => {
      setIsSaving(true);
      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: questionIndex,
            answer: value,
          }),
        });
      } catch (error) {
        console.error("Error saving answer:", error);
      } finally {
        setIsSaving(false);
      }
    };

    saveAnswer();
  }, [value, questionIndex, isLoading]);

  const goNext = () => {
    if (value === null) return;
    const newGoalParam = isNewGoal ? "?newGoal=true" : "";
    if (questionIndex < QUESTIONS.length - 1) {
      router.push(`/start/${questionIndex + 1}${newGoalParam}`);
    } else {
      router.push(`/pillars${newGoalParam}`);
    }
  };

  const goBack = () => {
    if (questionIndex > 0) {
      const newGoalParam = isNewGoal ? "?newGoal=true" : "";
      router.push(`/start/${questionIndex - 1}${newGoalParam}`);
    }
  };

  if (isLoading) {
    return (
      <section className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-100 safe-area flex items-center justify-center px-6 py-16">
      <div className="surface-strong max-w-4xl w-full px-10 py-12 shadow-xl space-y-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">grid64</p>
            <p className="text-sm text-stone-500">
              {questionIndex + 1} / {QUESTIONS.length}
              {isSaving && <span className="ml-2 text-xs">saving...</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={goBack}
              disabled={questionIndex === 0}
              className="btn-ghost px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              back
            </button>
            <button
              onClick={goNext}
              disabled={value === null}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              next
            </button>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 leading-tight">
            {question}
          </h1>
          <p className="text-stone-500 text-base">Answer honestly to tailor your plan.</p>
        </div>

        <div className="grid gap-3">
          {ANSWER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setValue(option.value)}
              className={`w-full text-left px-6 py-4 rounded-xl border transition-colors duration-200 cursor-pointer ${
                value === option.value
                  ? "border-stone-900 bg-stone-900 text-white shadow-lg"
                  : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-md"
              }`}
            >
              <span className="text-base font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
