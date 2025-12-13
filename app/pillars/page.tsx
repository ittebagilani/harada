// app/pillars/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GridBackground } from "@/components/grid-bg";
import MobileNotice from "@/components/mobile-notice";

export default function Pillars() {
  const router = useRouter();
  const [pillars, setPillars] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadOrGeneratePillars();
  }, []);

  const loadOrGeneratePillars = async () => {
    try {
      // Load goal
      const goalResponse = await fetch("/api/goal");
      if (goalResponse.ok) {
        const goalData = await goalResponse.json();
        if (goalData.goal) {
          setGoal(goalData.goal);
        }
      }

      // Check if pillars already exist
      const pillarsResponse = await fetch("/api/pillars");
      if (pillarsResponse.ok) {
        const pillarsData = await pillarsResponse.json();
        if (pillarsData.pillars && pillarsData.pillars.length > 0) {
          setPillars(pillarsData.pillars);
          setIsLoading(false);
          return;
        }
      }

      // No pillars exist, generate them from answers
      setIsGenerating(true);
      const generateResponse = await fetch("/api/generate-pillars", {
        method: "POST",
      });

      if (generateResponse.ok) {
        const data = await generateResponse.json();
        setPillars(data.pillars);
      } else {
        alert("Failed to generate pillars. Please try again.");
      }

      setIsGenerating(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading pillars:", error);
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pillars, 
          goal: goal || "My Goal" 
        }),
      });

      if (response.ok) {
        router.push("/results");
      } else {
        const data = await response.json();
        if (data.requiresUpgrade) {
          alert(data.error);
        } else {
          alert(data.error || "Failed to save pillars");
        }
      }
    } catch (error) {
      console.error("Error saving pillars:", error);
      alert("Failed to save pillars. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen safe-area flex items-center justify-center" style={{ backgroundColor: '#F6F7EB' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#000000', borderTopColor: 'transparent' }} />
          <p className="text-lg" style={{ color: '#000000' }}>
            {isGenerating ? "Analyzing your responses..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MobileNotice />
      <section className="relative min-h-screen overflow-hidden safe-area flex items-center justify-center px-6 py-16" style={{ backgroundColor: '#F6F7EB' }}>
        <GridBackground />

        {/* Main container */}
        <div className="relative z-10 w-full max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-md border border-stone-200 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.25)] px-8 py-10 sm:px-12 sm:py-12">
            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <p className="text-xs uppercase tracking-[0.35em]" style={{ color: '#5a5a5a' }}>your foundation</p>
                <h1 className="text-5xl md:text-6xl font-semibold tracking-tight" style={{ color: '#000000' }}>
                  Your 8 Pillars
                </h1>
                <p className="text-lg" style={{ color: '#000000' }}>
                  Working towards: <span className="font-medium">{goal}</span>
                </p>
              </div>

              {/* Divider */}
              <div className="mx-auto w-20 h-px" style={{ backgroundColor: '#d4c4bc' }} />

              {/* Pillars List - Vertical */}
              <div className="space-y-3">
                {pillars.map((pillar, index) => (
                  <div
                    key={index}
                    className="group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md"
                    style={{
                      backgroundColor: '#DBCDC6',
                      borderColor: '#d4c4bc'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#000000', color: '#F6F7EB' }}>
                        {index + 1}
                      </div>
                      <p className="text-lg font-medium flex-1" style={{ color: '#000000' }}>
                        {pillar}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-center text-sm" style={{ color: '#5a5a5a' }}>
                Based on your responses, these are your 8 focus areas to build your life around.
              </p>

              {/* Divider */}
              <div className="mx-auto w-20 h-px" style={{ backgroundColor: '#d4c4bc' }} />

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.back()}
                  disabled={isSaving}
                  className="btn-ghost px-6 py-3 text-sm disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={isSaving}
                  className="btn-primary px-6 py-3 text-sm disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}