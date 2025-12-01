"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/grid-bg";

export default function Onboarding() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isFading, setIsFading] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

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
      router.push("/start/0");
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
      className={`min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12 transition-opacity duration-700 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <GridBackground />
      <div className="max-w-xl w-full z-10">
        <div className="text-center space-y-10">
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-medium tracking-tight text-stone-900">
              before we begin
            </h1>
            <p className="text-lg text-stone-800 tracking-wide leading-relaxed">
              remember that no app will work. unless you do.
            </p>
          </div>

          {/* Main content */}
          <div className="space-y-10">
            <h2 className="text-2xl md:text-5xl font-light text-stone-900 tracking-tight leading-snug">
              you will be asked 36 questions.
              <br />
              answer with absolute honesty.
            </h2>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleYes}
                size="lg"
                className="w-[200px] mx-auto flex rounded-xs bg-stone-900 hover:bg-transparent hover:text-black hover:border hover:border-gray-700 text-white px-8 py-6 text-lg font-light tracking-wide transition-colors duration-200 cursor-pointer"
              >
                let&apos;s do it.
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="absolute bottom-4 text-neutral-900 text-base text-center">
        © 2025 grid64 — built for the best
      </footer>
    </div>
  );
}
