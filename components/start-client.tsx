"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { QUESTIONS, ANSWER_OPTIONS } from "@/lib/questions";
import MobileNotice from "@/components/mobile-notice";
import { GridBackground } from "@/components/grid-bg";

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
    <>
      <MobileNotice />
      <section className="relative min-h-screen overflow-hidden safe-area flex items-center justify-center px-6 py-16">
        <GridBackground />

        {/* White container */}
        <div className="relative z-10 w-full max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-md border border-stone-200 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.25)] px-8 py-10 sm:px-12 sm:py-12">
            <div className="relative z-10 space-y-7">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em]" style={{ color: '#5a5a5a' }}>grid64</p>
                  <p className="text-sm" style={{ color: '#5a5a5a' }}>
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
                    Back
                  </button>
                  <button
                    onClick={goNext}
                    disabled={value === null}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-auto w-20 h-px" style={{ backgroundColor: '#d4c4bc' }} />

              <div className="space-y-4 text-center">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight" style={{ color: '#000000' }}>
                  {question}
                </h1>
                <p className="text-base" style={{ color: '#5a5a5a' }}>Answer honestly to tailor your plan.</p>
              </div>

              <div className="grid gap-3">
                {ANSWER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setValue(option.value)}
                    className={`w-full text-center px-6 py-4 rounded-xl border transition-colors duration-200 cursor-pointer ${
                      value === option.value
                        ? "text-white shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: value === option.value ? '#000000' : '#F6F7F5',
                      borderColor: value === option.value ? '#000000' : '#F6F7F5',
                      color: value === option.value ? '#F6F7EB' : '#000000'
                    }}
                  >
                    <span className="text-sm font-thin">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
