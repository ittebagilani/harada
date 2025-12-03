"use client"

import { useState, useEffect } from "react"
import { UserButton } from "@clerk/nextjs"
import { Check, Flame } from "lucide-react"

interface Task {
  id: string
  content: string
  pillarTitle: string
  completed: boolean
}

interface CompletionData {
  date: string
  completed: number
  total: number
}

export default function DashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [weeklyData, setWeeklyData] = useState<CompletionData[]>([])
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Fetch today's tasks
      const tasksResponse = await fetch("/api/daily-tasks")
      const tasksData = await tasksResponse.json()
      
      if (tasksData.tasks) {
        setTasks(tasksData.tasks)
      }

      // Fetch weekly completion data
      const weeklyResponse = await fetch("/api/weekly-completions")
      const weeklyData = await weeklyResponse.json()
      
      if (weeklyData.completions) {
        setWeeklyData(weeklyData.completions)
      }

      // Fetch streak
      const streakResponse = await fetch("/api/streak")
      const streakData = await streakResponse.json()
      
      if (streakData.streak !== undefined) {
        setStreak(streakData.streak)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setIsLoading(false)
    }
  }

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const response = await fetch("/api/toggle-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          taskId, 
          completed: !task.completed 
        })
      })

      if (response.ok) {
        setTasks(tasks.map((t) => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ))
        
        // Refresh streak after completion
        const streakResponse = await fetch("/api/streak")
        const streakData = await streakResponse.json()
        if (streakData.streak !== undefined) {
          setStreak(streakData.streak)
        }
      }
    } catch (error) {
      console.error("Error toggling task:", error)
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedCount / tasks.length) * 100) 
    : 0

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const maxCompleted = weeklyData.length > 0 
    ? Math.max(...weeklyData.map((d) => d.completed)) 
    : 1

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 border-stone-300 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-stone-800 text-lg tracking-wide">読み込み中</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-8 border-b border-stone-200 bg-white">
        <div className="flex-1">
          <h1 className="text-5xl font-light tracking-tight text-stone-900">今日</h1>
          <p className="text-stone-500 text-sm tracking-wide mt-1 uppercase">{today}</p>
        </div>
        <UserButton />
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12 space-y-16">
        {/* Streak Display */}
        <section className="flex items-center justify-center gap-4 py-8 animate-fadeIn">
          <Flame className={`w-10 h-10 transition-colors duration-300 ${
            streak > 0 ? 'text-orange-500' : 'text-stone-300'
          }`} />
          <div className="text-center">
            <div className="text-5xl font-light text-stone-900 tracking-tight">{streak}</div>
            <div className="text-sm text-stone-500 tracking-widest uppercase mt-1">Day Streak</div>
          </div>
        </section>

        {/* Daily Tasks */}
        <section className="space-y-8 animate-slideUp" style={{ animationDelay: '100ms' }}>
          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-stone-900">Daily Practice</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 tracking-wide">
                {completedCount} of {tasks.length} complete
              </span>
              <span className="text-stone-900 font-medium">{completionPercentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-900 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-start gap-4 px-6 py-5 bg-white border border-stone-200 hover:border-stone-400 transition-all duration-300 group"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  opacity: 0,
                  animation: 'fadeIn 0.5s ease-out forwards'
                }}
              >
                <div
                  className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    task.completed 
                      ? "bg-stone-900 border-stone-900" 
                      : "border-stone-300 group-hover:border-stone-900"
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 text-left space-y-1">
                  <span
                    className={`block text-sm transition-all duration-300 ${
                      task.completed 
                        ? "text-stone-400 line-through" 
                        : "text-stone-900"
                    }`}
                  >
                    {task.content}
                  </span>
                  <span className="block text-xs text-stone-500 tracking-widest uppercase">
                    {task.pillarTitle}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Weekly Overview */}
        {weeklyData.length > 0 && (
          <section className="space-y-8 pt-12 border-t border-stone-200 animate-slideUp" style={{ animationDelay: '200ms' }}>
            <div>
              <h2 className="text-2xl font-light tracking-tight text-stone-900">This Week</h2>
              <p className="text-sm text-stone-500 mt-1 tracking-wide">Your consistency journey</p>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-4 h-40 px-6 py-8 bg-white border border-stone-200">
              {weeklyData.map((data, index) => {
                const date = new Date(data.date)
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
                const heightPercentage = maxCompleted > 0 
                  ? (data.completed / maxCompleted) * 100 
                  : 0
                
                return (
                  <div 
                    key={data.date} 
                    className="flex flex-col items-center gap-3 flex-1"
                    style={{
                      animation: 'slideUp 0.5s ease-out forwards',
                      animationDelay: `${300 + index * 50}ms`,
                      opacity: 0
                    }}
                  >
                    <div className="w-full flex flex-col-reverse items-center">
                      <div
                        className="w-full bg-stone-900 transition-all duration-500"
                        style={{
                          height: `${Math.max(heightPercentage, data.completed > 0 ? 8 : 2)}px`,
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-stone-900">{data.completed}</div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">
                        {dayName}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}