"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2 } from "lucide-react";

const DEFAULT_PILLARS = [
  "Discipline",
  "Health",
  "Networking",
  "Finance",
  "Relationships",
  "Career",
  "Personal Growth",
  "Spirituality",
];

export default function Pillars() {
  const router = useRouter();
  const [pillars, setPillars] = useState(DEFAULT_PILLARS);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing pillars on mount
  useEffect(() => {
    const loadPillars = async () => {
      try {
        const response = await fetch("/api/plan/save-pillars");
        if (response.ok) {
          const data = await response.json();
          if (data.pillars && data.pillars.length > 0) {
            setPillars(data.pillars);
          }
        }
      } catch (error) {
        console.error("Error loading pillars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPillars();
  }, []);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(pillars[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (editValue.trim()) {
      const newPillars = [...pillars];
      newPillars[index] = editValue.trim();
      setPillars(newPillars);
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/plan/save-pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillars }),
      });

      if (response.ok) {
        router.push("/results");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save pillars");
      }
    } catch (error) {
      console.error("Error saving pillars:", error);
      alert("Failed to save pillars. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-stone-900">
            your 8 pillars
          </h1>
          <p className="text-base text-stone-600 font-light tracking-wide leading-relaxed max-w-2xl mx-auto">
            We found your 8 weakest areas. These are your pillars. Edit or
            reorder to match your life.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className={`group relative aspect-square bg-white border-2 rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-200`}
            >
              {/* Content */}
              {editingIndex === index ? (
                <div className="w-full space-y-3">
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveEdit(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(index);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-sm text-center font-light text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="text-xs px-3 py-1 bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
                    >
                      save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="text-xs px-3 py-1 bg-stone-200 text-stone-900 rounded hover:bg-stone-300 transition-colors"
                    >
                      cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg md:text-xl font-light text-center text-stone-900 mb-4">
                    {pillar}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-2 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                      aria-label="Edit pillar"
                    >
                      <Edit2 className="w-4 h-4 text-stone-600" />
                    </button>
                  </div>
                </>
              )}
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