"use client"

import { useState, useEffect } from "react"
import { UserButton } from "@clerk/nextjs"
import { Check, Flame, Grid3x3, Plus, Target, TrendingUp, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [goal, setGoal] = useState<string>("")
  const [isPremium, setIsPremium] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const router = useRouter()

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

      // Fetch goal
      const goalResponse = await fetch("/api/goal")
      const goalData = await goalResponse.json()
      
      if (goalData.goal) {
        setGoal(goalData.goal)
      }

      // Fetch streak
      const streakResponse = await fetch("/api/streak")
      const streakData = await streakResponse.json()
      
      if (streakData.streak !== undefined) {
        setStreak(streakData.streak)
      }

      // Fetch user premium status
      const userResponse = await fetch("/api/user")
      const userData = await userResponse.json()
      
      if (userData.isPremium !== undefined) {
        setIsPremium(userData.isPremium)
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

  const handleNewGoal = () => {
    if (isPremium) {
      router.push("/")
    } else {
      setShowPremiumModal(true)
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Checkout session error:', errorData)
        alert(`Error: ${errorData.error || 'Failed to create checkout session'}`)
        setIsUpgrading(false)
        return
      }
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned:', data)
        alert('Error: No checkout URL returned. Please check your Stripe configuration.')
        setIsUpgrading(false)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Error: Failed to create checkout session. Please try again.')
      setIsUpgrading(false)
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
        
        <div className="flex items-center gap-4">
          <Link href="/grid">
            <button className="group flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-900 text-stone-900 hover:text-white border border-stone-200 hover:border-stone-900 transition-all duration-300">
              <Grid3x3 className="w-4 h-4" />
              <span className="text-sm tracking-wide">View Grid</span>
            </button>
          </Link>
          
          <button
            onClick={handleNewGoal}
            className="group flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white border border-stone-900 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm tracking-wide">New Goal</span>
          </button>
          
          <UserButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Goal Section */}
            {goal && (
              <section className="animate-fadeIn">
                <div className="bg-stone-900 text-white p-10 space-y-3 border border-stone-900">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-stone-400" />
                    <div className="text-xs tracking-widest uppercase text-stone-400">Your Goal</div>
                  </div>
                  <p className="text-2xl font-light leading-relaxed tracking-tight">{goal}</p>
                  <p className="text-sm text-stone-400 italic pt-2">
                    "Small daily actions compound into extraordinary results"
                  </p>
                </div>
              </section>
            )}

            {/* Stats Grid */}
            <section className="grid grid-cols-3 gap-4 animate-fadeIn" style={{ animationDelay: '50ms' }}>
              {/* Streak Card */}
              <div className="bg-white border border-stone-200 p-6 flex flex-col items-center justify-center space-y-2 hover:border-stone-400 transition-all duration-300">
                <Flame className={`w-7 h-7 transition-colors duration-300 ${
                  streak > 0 ? 'text-orange-500' : 'text-stone-300'
                }`} />
                <div className="text-center">
                  <div className="text-3xl font-light text-stone-900 tracking-tight">{streak}</div>
                  <div className="text-[10px] text-stone-500 tracking-widest uppercase mt-1">Streak</div>
                </div>
              </div>

              {/* Today's Progress Card */}
              <div className="bg-white border border-stone-200 p-6 flex flex-col items-center justify-center space-y-2 hover:border-stone-400 transition-all duration-300">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-stone-200"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPercentage / 100)}`}
                      className="text-stone-900 transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-light text-stone-900">{completionPercentage}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-stone-500 tracking-widest uppercase mt-1">Today</div>
                </div>
              </div>

              {/* Completed Today Card */}
              <div className="bg-white border border-stone-200 p-6 flex flex-col items-center justify-center space-y-2 hover:border-stone-400 transition-all duration-300">
                <TrendingUp className="w-7 h-7 text-stone-600" />
                <div className="text-center">
                  <div className="text-3xl font-light text-stone-900 tracking-tight">{completedCount}</div>
                  <div className="text-[10px] text-stone-500 tracking-widest uppercase mt-1">Completed</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Tasks */}
          <div className="space-y-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
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
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
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
                ))
              ) : (
                <div className="text-center py-12 text-stone-500">
                  <p className="text-sm">No tasks for today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-8 space-y-6 relative animate-slideUp">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-light text-stone-900">Upgrade to Premium</h2>
              <p className="text-stone-600">
                Create multiple goals and grids with Premium. Track different life areas with separate plans.
              </p>
            </div>
            
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Unlimited goals and grids</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Track multiple life areas simultaneously</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Advanced progress analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            
            <div className="text-center py-4 border-t border-b border-stone-200">
              <div className="text-4xl font-light text-stone-900 mb-1">$4.99</div>
              <div className="text-sm text-stone-500">per month</div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="flex-1 px-6 py-3 border border-stone-300 text-stone-900 hover:bg-stone-50 transition-all duration-300 text-sm tracking-wide"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="flex-1 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 disabled:opacity-50 text-sm tracking-wide"
              >
                {isUpgrading ? "Loading..." : "Upgrade Now"}
              </button>
            </div>
          </div>
        </div>
      )}

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