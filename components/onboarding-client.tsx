"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/grid-bg";
import MobileNotice from "./mobile-notice";

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
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: '#F6F7EB' }}>
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#000000', borderTopColor: 'transparent' }} />
          <p className="font-light text-lg" style={{ color: '#000000' }}>
            Setting up your goal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MobileNotice />
      <div
        className="min-h-screen safe-area flex items-center justify-center px-6 py-12 transition-opacity duration-700"
        style={{ opacity: isFading ? 0 : 1 }}
      >
        <GridBackground />
      <div className="w-full max-w-2xl z-10">
        <div className="relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-md border border-stone-200 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.25)] px-8 py-10 sm:px-12 sm:py-12 text-center">
          <div className="relative z-10 space-y-7">
            {/* Header */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em]" style={{ color: '#5a5a5a' }}>welcome</p>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight" style={{ color: '#000000' }}>
                before we begin
              </h1>
              <p className="text-lg tracking-wide leading-relaxed" style={{ color: '#000000' }}>
                remember that no app will work. unless you do.
              </p>
            </div>

            {/* Divider */}
            <div className="mx-auto w-20 h-px" style={{ backgroundColor: '#d4c4bc' }} />

            {/* Main content */}
            <div className="space-y-8">
              <h2 className="text-2xl md:text-4xl font-light tracking-tight leading-snug" style={{ color: '#000000' }}>
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
                <p className="text-sm" style={{ color: '#5a5a5a' }}>Takes about 4–6 minutes.</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs mt-6" style={{ color: '#5a5a5a' }}>© 2025 grid64 — built for the best</p>
      </div>
      </div>
    </>
  );
}
