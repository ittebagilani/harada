"use client";

import { useState, useEffect } from "react";
import PlanGrid from "@/components/plan/plan-grid";
import DailyTasksView from "@/components/plan/daily-tasks-view";
import ViewToggle from "@/components/plan/view-toggle";

const ALL_TASKS = Array.from({ length: 64 }, (_, i) => ({
  id: i + 1,
  label: `Task ${i + 1}`,
}));

export default function PlanPage() {
  const [view, setView] = useState<"grid" | "daily">("grid");
  const [dailyTasks, setDailyTasks] = useState<typeof ALL_TASKS>([]);

  // pick 5 random tasks for the day
  const pickDailyTasks = () => {
    const shuffled = [...ALL_TASKS].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 5);
    setDailyTasks(chosen);
    localStorage.setItem("dailyTasks", JSON.stringify(chosen));
    localStorage.setItem("taskDate", new Date().toDateString());
  };

  // load daily tasks from localStorage OR generate new ones
  useEffect(() => {
    const savedDate = localStorage.getItem("taskDate");
    const today = new Date().toDateString();

    if (savedDate === today) {
      const saved = localStorage.getItem("dailyTasks");
      if (saved) setDailyTasks(JSON.parse(saved));
    } else {
      pickDailyTasks();
    }
  }, []);

  return (
    <section className="min-h-screen bg-white dark:bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center dark:text-white">
          Your 64-Task Challenge
        </h1>

        <ViewToggle view={view} setView={setView} />

        {view === "grid" ? (
          <PlanGrid tasks={ALL_TASKS} />
        ) : (
          <DailyTasksView tasks={dailyTasks} />
        )}
      </div>
    </section>
  );
}
