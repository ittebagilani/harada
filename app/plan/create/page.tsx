"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SubTask = {
  id: string;
  text: string;
};

export default function CreatePlanPage() {
  const [goal, setGoal] = useState("");
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const addSubTask = () => {
    setSubTasks([...subTasks, { id: crypto.randomUUID(), text: "" }]);
  };

  const removeSubTask = (id: string) => {
    setSubTasks(subTasks.filter((s) => s.id !== id));
  };

  const updateSubTask = (id: string, text: string) => {
    setSubTasks(
      subTasks.map((s) => (s.id === id ? { ...s, text } : s))
    );
  };

  const generateAI = async () => {
    if (!goal) return;
    setLoadingAI(true);

    // call your API route
    const res = await fetch("/api/harada/suggest", {
      method: "POST",
      body: JSON.stringify({ goal }),
    });

    const data = await res.json();
    setSubTasks(
      data.suggestions.map((t: string) => ({
        id: crypto.randomUUID(),
        text: t,
      }))
    );

    setLoadingAI(false);
  };

  const handleNext = async () => {
    await fetch("/api/harada/save", {
      method: "POST",
      body: JSON.stringify({ goal, subTasks }),
    });

    // redirect to next step
    window.location.href = "/plan";
  };

  return (
    <section className="min-h-screen bg-white dark:bg-neutral-900 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Title */}
        <h1 className="text-4xl font-bold dark:text-white text-center">
          Your Main Goal
        </h1>

        {/* Goal input */}
        <Textarea
          placeholder="What's the one major goal you want to achieve?"
          className="dark:bg-neutral-800 dark:text-white min-h-[120px]"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        {/* AI Suggest Button */}
        <Button
          disabled={!goal || loadingAI}
          onClick={generateAI}
          className="w-full"
        >
          {loadingAI ? "Generating..." : "Break it down for me (AI)"}
        </Button>

        {/* Subtask list */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold dark:text-white">Suggested Sub-Tasks</h2>

          {subTasks.length === 0 && (
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              No subtasks yet. Use the AI button or add your own.
            </p>
          )}

          {subTasks.map((task) => (
            <div
              key={task.id}
              className="flex gap-2 items-center"
            >
              <Input
                value={task.text}
                onChange={(e) => updateSubTask(task.id, e.target.value)}
                className="flex-1 dark:bg-neutral-800 dark:text-white"
              />
              <Button
                variant="destructive"
                onClick={() => removeSubTask(task.id)}
              >
                Delete
              </Button>
            </div>
          ))}

          <Button onClick={addSubTask} className="w-full">
            + Add New Sub-Task
          </Button>
        </div>

        {/* Next button */}
        <Button
          disabled={!goal || subTasks.length === 0}
          onClick={handleNext}
          className="w-full bg-black text-white dark:bg-white dark:text-black"
        >
          Next →
        </Button>
      </div>
    </section>
  );
}
