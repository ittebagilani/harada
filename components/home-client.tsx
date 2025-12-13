"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GridBackground } from "@/components/grid-bg";
import MobileNotice from "./mobile-notice";

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
    <>
      <MobileNotice />
      <section className="relative min-h-screen overflow-hidden safe-area flex items-center justify-center px-6 py-16">
        <GridBackground />

        {/* White container */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-md border border-stone-200 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.25)] px-8 py-10 sm:px-12 sm:py-12 text-center">
            <div className="relative z-10 space-y-7">
              <div className="space-y-2">
                {/* <h1 className="text-xs uppercase tracking-[0.35em]" style={{ color: '#5a5a5a' }}>Set your goal</h1> */}
                <h1 className="text-5xl md:text-6xl font-semibold tracking-tight" style={{ color: '#000000' }}>
                  Set Your Goal
                </h1>
              </div>

              {/* Divider */}
              <div className="mx-auto w-20 h-px" style={{ backgroundColor: '#d4c4bc' }} />

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="i want to be rich"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="soft-input text-sm"
                />
                <p className="text-sm" style={{ color: '#5a5a5a' }}>
                  Be specific. We&apos;ll carve out the path.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleClick}
                  disabled={value.length < MIN_CHARS}
                  className="cursor-pointer btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3"
                >
                  Start building
                </Button>
              </div>

              <p className="text-xs" style={{ color: '#5a5a5a' }}>
                © 2025 grid64 — built for the best
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
