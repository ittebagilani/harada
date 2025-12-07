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
    <section className="w-full min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 font-inter">
      <h1 className="text-4xl md:text-3xl -mt-10 mb-8 max-w-2xl">grid64</h1>

      <h1 className="text-4xl md:text-5xl font-light tracking-tight max-w-6xl leading-relaxed">
        {question}
      </h1>

      <p className="text-black mb-8 tracking-wide">
        {questionIndex + 1} of {QUESTIONS.length}
        {isSaving && <span className="ml-2 text-xs">saving...</span>}
      </p>
      <div className="w-full max-w-2xl mb-12">
        <div className="flex flex-col gap-3">
          {ANSWER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setValue(option.value)}
              className={`
                w-full py-4 px-6 rounded-sm border transition-all duration-200
                text-md font-light tracking-wide cursor-pointer
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

      <div className="flex gap-4 md:gap-6">
        <button
          onClick={goBack}
          disabled={questionIndex === 0}
          className="cursor-pointer px-8 py-2 rounded-xs border border-border text-foreground hover:border-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg font-light"
        >
          back
        </button>

        <button
          onClick={goNext}
          disabled={value === null}
          className="cursor-pointer px-8 py-2 rounded-xs bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg font-light"
        >
          next
        </button>
      </div>
    </section>
  );
}
