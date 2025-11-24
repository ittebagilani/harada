"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Check, RefreshCcw } from "lucide-react";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [pillars, setPillars] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Assume goal is saved in localStorage or from DB
  const goal = typeof window !== "undefined"
    ? localStorage.getItem("mainGoal") || "Your Goal"
    : "Your Goal";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/harada/generate", {
          method: "POST",
          body: JSON.stringify({ goal }),
        });

        const data = await res.json();
        setPillars(data.pillars);
        setGrid(data.grid);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [goal]);

  function startEdit(i: number, text: string) {
    setEditingIndex(i);
    setEditValue(text);
  }

  function saveEdit(i: number) {
    const updated = [...pillars];
    updated[i] = editValue;
    setPillars(updated);
    setEditingIndex(null);
  }

  async function regenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/harada/generate", {
        method: "POST",
        body: JSON.stringify({ goal, refine: true, pillars }),
      });
      const data = await res.json();
      setGrid(data.grid);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-300">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      {/* Main Goal */}
      <h1 className="text-3xl font-semibold text-white mb-2">
        Your Roadmap to: <span className="text-indigo-400">{goal}</span>
      </h1>
      <p className="text-gray-400 mb-6">
        Based on your answers, here are the <span className="font-medium">8 key routines</span> to focus on.
      </p>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {pillars.map((pillar, i) => (
          <div
            key={i}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm flex justify-between items-center"
          >
            {editingIndex === i ? (
              <input
                className="bg-gray-700 p-2 rounded text-white w-full mr-2"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            ) : (
              <p className="text-gray-200">{pillar}</p>
            )}

            {editingIndex === i ? (
              <button
                onClick={() => saveEdit(i)}
                className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => startEdit(i, pillar)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <Pencil className="h-4 w-4 text-gray-300" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Regenerate */}
      <button
        onClick={regenerate}
        className="mb-8 flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
      >
        <RefreshCcw className="h-4 w-4" />
        Regenerate Tasks
      </button>

      {/* 8×8 Grid */}
      <h2 className="text-xl font-semibold text-white mb-3">Your 64-Step Action Grid</h2>
      <div className="grid grid-cols-8 gap-2 bg-gray-900 p-4 rounded-lg border border-gray-700">
        {grid.flat().map((cell: string, i: number) => (
          <div
            key={i}
            className="text-xs text-gray-300 p-2 bg-gray-800 rounded border border-gray-700 h-20 overflow-y-auto"
          >
            {cell}
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
