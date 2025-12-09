"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GridBackground } from "@/components/grid-bg";

export default function HomeClient() {
  const [value, setValue] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const MIN_CHARS = 3;
  const router = useRouter();

  useEffect(() => {
    // Check if user is premium
    const checkPremium = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium || false);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    };
    checkPremium();

    // Brief landing splash
    const timer = setTimeout(() => setShowIntro(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (value.length >= MIN_CHARS) {
      localStorage.setItem("pendingGoal", value);
      // If premium user, pass newGoal parameter
      const url = isPremium ? "/onboarding?newGoal=true" : "/onboarding";
      router.push(url);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-br from-stone-50 via-white to-stone-100 safe-area">
      <GridBackground />
      {showIntro && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <GridBackground />
          </div>
          <div className="relative z-10 text-center space-y-4 px-6">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">Welcome to</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-stone-900">grid64</h1>
            <p className="text-stone-500 text-sm">Shaping your goals into daily action.</p>
          </div>
        </div>
      )}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="surface-strong max-w-xl w-full px-10 py-12 text-center space-y-8 shadow-xl">
          <div className="space-y-2">
            <h1 className="text-xl text-stone-500">grid64</h1>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-stone-900">Set Your Goal</h1>
            
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="i want to be rich"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="soft-input text-sm"
            />
            <p className="text-sm text-stone-500">Be specific. We&apos;ll carve out the path.</p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleClick}
              disabled={value.length < MIN_CHARS}
              className="cursor-pointer btn-primary w-full md:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Start building
            </Button>
          </div>

          <p className="text-xs text-stone-400">© 2025 grid64 — built for the best</p>
        </div>
      </div>
    </section>
  );
}

