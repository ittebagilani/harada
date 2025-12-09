// app/pillars/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
      <div className="min-h-screen bg-stone-50 safe-area flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600 text-lg">
            {isGenerating ? "Analyzing your responses..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 safe-area flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-stone-900">
            your 8 pillars
          </h1>
          <p className="text-base text-stone-600 font-light tracking-wide leading-relaxed max-w-2xl mx-auto">
            Working towards: <span className="font-medium">{goal}</span>
          </p>
          <p className="text-sm text-stone-500 font-light">
            Based on your responses, these are your 8 focus areas.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className={`group relative aspect-square bg-white border-2 rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-200 shadow-sm`}
            >
              <p className="text-lg md:text-xl font-light text-center text-stone-900">
                {pillar}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 pt-8 border-t border-stone-200">
          <div className="flex gap-4 mx-auto">
            <button
              onClick={() => router.back()}
              disabled={isSaving}
              className="px-8 py-3 rounded-sm border border-stone-300 text-stone-900 hover:border-stone-400 hover:bg-stone-100 transition-all duration-200 text-base font-light disabled:opacity-50"
            >
              back
            </button>
            <button
              onClick={handleContinue}
              disabled={isSaving}
              className="px-8 py-3 rounded-sm bg-stone-900 text-white hover:bg-stone-800 transition-all duration-200 text-base font-light disabled:opacity-50"
            >
              {isSaving ? "saving..." : "continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}