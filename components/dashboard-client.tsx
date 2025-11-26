"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Check, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Habit {
  id: string
  name: string
  completed: boolean
}

const SAMPLE_HABITS: Habit[] = [
  { id: "1", name: "Morning meditation", completed: true },
  { id: "2", name: "Exercise for 30 minutes", completed: true },
  { id: "3", name: "Read for 20 minutes", completed: false },
  { id: "4", name: "Journal reflection", completed: true },
  { id: "5", name: "Healthy meal prep", completed: false },
  { id: "6", name: "Evening wind down", completed: false },
]

const WEEKLY_DATA = [
  { day: "Mon", completed: 5 },
  { day: "Tue", completed: 6 },
  { day: "Wed", completed: 4 },
  { day: "Thu", completed: 5 },
  { day: "Fri", completed: 6 },
  { day: "Sat", completed: 3 },
  { day: "Sun", completed: 5 },
]

export default function DashboardClient() {
  const [habits, setHabits] = useState<Habit[]>(SAMPLE_HABITS)

  const toggleHabit = (id: string) => {
    setHabits(habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)))
  }

  const completedCount = habits.filter((h) => h.completed).length
  const completionPercentage = Math.round((completedCount / habits.length) * 100)
  const maxCompleted = Math.max(...WEEKLY_DATA.map((d) => d.completed))

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6 md:px-8 md:py-8 border-b border-border">
        <div className="flex flex-col mx-auto">
          <h1 className="text-4xl font-light tracking-tight text-foreground text-center">Welcome back</h1>
          <p className="text-base text-muted-foreground mt-1">Stay consistent. Progress compounds.</p>
        </div>
        <UserButton />
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12 space-y-12">
        {/* Daily Checklist */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-foreground">Today's Habits</h2>
            <p className="text-base text-muted-foreground mt-1">{today}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Progress</span>
              <span className="text-base font-medium text-foreground">
                {completedCount}/{habits.length}
              </span>
            </div>
            <div className="w-full h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{completionPercentage}% complete</p>
          </div>

          {/* Habit List */}
          <div className="space-y-2">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left group"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    habit.completed ? "bg-primary border-primary" : "border-border group-hover:border-primary"
                  }`}
                >
                  {habit.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span
                  className={`text-base ${habit.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {habit.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Weekly Overview */}
        <section className="space-y-6 pt-8 border-t border-border">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              This Week
            </h2>
            <p className="text-base text-muted-foreground mt-1">Your completion history</p>
          </div>

          {/* Mini Bar Chart */}
          <div className="flex items-end justify-around gap-2 h-32 px-4 py-6 bg-secondary rounded-lg">
            {WEEKLY_DATA.map((data) => (
              <div key={data.day} className="flex flex-col items-center gap-2 flex-1">
                <div className="relative w-full flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse items-center">
                    <div
                      className="w-full bg-primary rounded-t transition-all duration-300"
                      style={{
                        height: `${(data.completed / maxCompleted) * 100}px`,
                        minHeight: data.completed > 0 ? "4px" : "2px",
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{data.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Goal Reminder */}
        <section className="space-y-6 pt-8 border-t border-border">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-foreground">Your Goal</h2>
          </div>

          <div className="p-6 bg-secondary rounded-lg border border-border space-y-4">
            <p className="text-xl font-light text-foreground">
              Transform your life through consistent daily habits using the Harada Method
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              "Stay consistent. You're already 18% ahead from last week. Small steps compound into remarkable results."
            </p>
          </div>
        </section>

        {/* Reflect Button */}
        <div className="pt-8 border-t border-border">
          <Button className="w-full py-6 text-lg font-light tracking-wide" variant="default">
            Reflect on Today
          </Button>
        </div>
      </div>
    </div>
  )
}
