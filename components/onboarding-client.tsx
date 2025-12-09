"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/grid-bg";

export default function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded } = useAuth();
  const [isFading, setIsFading] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const isNewGoal = searchParams?.get("newGoal") === "true";

  // Save goal from localStorage to database when user is signed in
  useEffect(() => {
    if (!isLoaded) return;

    const saveGoalToDb = async () => {
      if (isSignedIn) {
        const pendingGoal = localStorage.getItem("pendingGoal");

        if (pendingGoal) {
          setIsSavingGoal(true);
          try {
            const response = await fetch("/api/goal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ goal: pendingGoal }),
            });

            if (response.ok) {
              // Clear from localStorage once saved
              localStorage.removeItem("pendingGoal");
              console.log("Goal saved successfully");
            } else {
              console.error("Failed to save goal");
            }
          } catch (error) {
            console.error("Error saving goal:", error);
          } finally {
            setIsSavingGoal(false);
          }
        }
      }
    };

    saveGoalToDb();
  }, [isSignedIn, isLoaded]);

  const handleYes = () => {
    setIsFading(true);
    setTimeout(() => {
      // Pass newGoal parameter through the flow if present
      const url = isNewGoal ? "/start/0?newGoal=true" : "/start/0";
      router.push(url);
    }, 800);
  };

  // Show loading state while saving goal
  if (isSavingGoal) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-800 font-light text-lg">
            Setting up your goal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-linear-to-br from-stone-50 via-white to-stone-100 safe-area flex items-center justify-center px-6 py-12 transition-opacity duration-700 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <GridBackground />
      <div className="max-w-3xl w-full z-10">
        <div className="surface-strong px-10 py-12 shadow-xl">
          <div className="text-center space-y-10">
            {/* Header */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">welcome</p>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-stone-900">
                before we begin
              </h1>
              <p className="text-lg text-stone-700 tracking-wide leading-relaxed">
                remember that no app will work. unless you do.
              </p>
            </div>

            {/* Main content */}
            <div className="space-y-8">
              <h2 className="text-2xl md:text-4xl font-light text-stone-900 tracking-tight leading-snug">
                you will be asked 36 questions.
                <br />
                answer with absolute honesty.
              </h2>

              <div className="flex flex-col gap-4 items-center">
                <Button
                  onClick={handleYes}
                  size="lg"
                  className="btn-primary w-[220px] justify-center"
                >
                  let&apos;s do it.
                </Button>
                <p className="text-sm text-stone-500">Takes about 4–6 minutes.</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-stone-400 mt-6">© 2025 grid64 — built for the best</p>
      </div>
    </div>
  );
}
