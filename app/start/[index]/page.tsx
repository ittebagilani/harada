"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState } from "react";

const QUESTIONS = [
  "I believe I currently have the skills needed to reach this goal.",
  "I am confident in my long-term discipline.",
  "I have a supportive environment for achieving my dream.",
  "I understand the steps required to reach my goal.",
  // ...continue until all 36 questions
];

export default function OnboardingQuestion() {
  const router = useRouter();
  const { index } = useParams() as { index: string };
  const questionIndex = parseInt(index);
  const question = QUESTIONS[questionIndex];

  const [value, setValue] = useState(5); // 1–10 scale

  const goNext = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      router.push(`/start/${questionIndex + 1}`);
    } else {
      router.push("/results"); // finished onboarding → go to plan screen
    }
  };

  const goBack = () => {
    if (questionIndex > 0) {
      router.push(`/start/${questionIndex - 1}`);
    }
  };

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Question */}
      <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-6">
        {question}
      </h1>

      <p className="text-gray-500 mb-10 text-lg">
        be honest. to yourself.
      </p>

      {/* Slider */}
      <div className="w-full max-w-3xl mb-12">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>strongly disagree</span>
          <span>strongly agree</span>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-black"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-6">
        <button
          onClick={goBack}
          className="px-8 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          back
        </button>

        <button
          onClick={goNext}
          className="px-8 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          next
        </button>
      </div>
    </section>
  );
}
