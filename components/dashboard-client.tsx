"use client"

import { useState, useEffect } from "react"
import { UserButton } from "@clerk/nextjs"
import { Check, Flame, Grid3x3, Plus, Target, TrendingUp, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import MobileNotice from "./mobile-notice"

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

interface Plan {
  id: string
  goal: string
  isActive: boolean
  createdAt: string
}

export default function DashboardClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [goal, setGoal] = useState<string>("")
  const [isPremium, setIsPremium] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [activePlanId, setActivePlanId] = useState<string>("")
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false)

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

      // Fetch all plans for premium users
      if (userData.isPremium) {
        const plansResponse = await fetch("/api/plan/get-plans")
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          if (plansData.plans) {
            setPlans(plansData.plans)
            const activePlan = plansData.plans.find((p: Plan) => p.isActive)
            if (activePlan) {
              setActivePlanId(activePlan.id)
            }
          }
        }
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
      router.push("/set-goal")
    } else {
      setShowPremiumModal(true)
    }
  }

  const handleSwitchPlan = async (planId: string) => {
    if (planId === activePlanId || isSwitchingPlan) return

    setIsSwitchingPlan(true)
    try {
      const response = await fetch("/api/plan/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      if (response.ok) {
        // Reload dashboard data to reflect the new active plan
        await loadDashboardData()
        // Reload the page to ensure all data is fresh
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to switch plan")
      }
    } catch (error) {
      console.error("Error switching plan:", error)
      alert("Failed to switch plan. Please try again.")
    } finally {
      setIsSwitchingPlan(false)
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
    <>
      <MobileNotice />
      <div className="min-h-screen safe-area" style={{ backgroundColor: '#F6F7EB' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-8 shadow-md border-b rounded-2xl" style={{ backgroundColor: '#DBCDC6', borderBottomColor: '#DBCDC6' }}>
        <div className="flex-1">
          <h1 className="text-5xl font-light tracking-tight" style={{ color: '#000000' }}>今日</h1>
          <p className="text-sm tracking-wide mt-1 uppercase" style={{ color: '#000000' }}>{today}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isPremium && plans.length > 1 && (
            <div className="relative">
              <select
                value={activePlanId}
                onChange={(e) => handleSwitchPlan(e.target.value)}
                disabled={isSwitchingPlan}
                className="px-4 py-2 text-sm tracking-wide cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8 rounded-xl border"
                style={{ backgroundColor: '#000000', color: '#EAD7D1', borderColor: '#000000' }}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.goal.length > 30 ? `${plan.goal.substring(0, 30)}...` : plan.goal}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
          
          <Link href="/grid">
            <button className="rounded-xl group flex items-center gap-2 px-4 py-2 border transition-all duration-300" style={{ backgroundColor: '#DBCDC6', color: '#000000', borderColor: '#DBCDC6' }}>
              <Grid3x3 className="w-4 h-4" />
              <span className="text-sm tracking-wide">View Grid</span>
            </button>
          </Link>
          
            <button
            onClick={handleNewGoal}
            className="rounded-xl group flex items-center gap-2 px-4 py-2 border transition-transform duration-300 hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundColor: '#000000', color: '#F6F7EB', borderColor: '#000000' }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm tracking-wide">New Goal</span>
          </button>
          
          <UserButton />
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Goal Section */}
            {goal && (
              <section className="animate-fadeIn">
                <div className="p-10 space-y-3 rounded-2xl shadow-xl border" style={{ backgroundColor: '#DBCDC6', borderColor: '#DBCDC6' }}>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5" style={{ color: '#000000' }} />
                      <div className="text-xs tracking-widest uppercase" style={{ color: '#000000' }}>Your Goal</div>
                    </div>
                    <p className="text-2xl font-light leading-relaxed tracking-tight" style={{ color: '#000000' }}>{goal}</p>
                  </div>
              </section>
            )}

            {/* Stats Grid */}
            <section className="grid grid-cols-3 gap-4 animate-fadeIn" style={{ animationDelay: '50ms' }}>
              {/* Streak Card */}
              <div className="p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-2 transition-all duration-300 border" style={{ backgroundColor: '#DBCDC6', borderColor: '#d4c4bc' }}>
                <Flame className="w-7 h-7 transition-colors duration-300" style={{ color: streak > 0 ? '#000000' : '#d4c4bc' }} />
                <div className="text-center">
                  <div className="text-3xl font-light tracking-tight" style={{ color: '#000000' }}>{streak}</div>
                  <div className="text-[10px] tracking-widest uppercase mt-1" style={{ color: '#5a5a5a' }}>Streak</div>
                </div>
              </div>

              {/* Today's Progress Card */}
              <div className="p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-2 transition-all duration-300 border" style={{ backgroundColor: '#DBCDC6', borderColor: '#d4c4bc' }}>
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      style={{ color: '#d4c4bc' }}
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
                      style={{ color: '#000000' }}
                      className="transition-all duration-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-light" style={{ color: '#000000' }}>{completionPercentage}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] tracking-widest uppercase mt-1" style={{ color: '#5a5a5a' }}>Today</div>
                </div>
              </div>

              {/* Completed Today Card */}
              <div className="p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-2 transition-all duration-300 border" style={{ backgroundColor: '#DBCDC6', borderColor: '#d4c4bc' }}>
                <TrendingUp className="w-7 h-7" style={{ color: '#000000' }} />
                <div className="text-center">
                  <div className="text-3xl font-light tracking-tight" style={{ color: '#000000' }}>{completedCount}</div>
                  <div className="text-[10px] tracking-widest uppercase mt-1" style={{ color: '#5a5a5a' }}>Completed</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Tasks */}
          <div className="space-y-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="space-y-2">
              <h2 className="text-2xl font-light tracking-tight" style={{ color: '#000000' }}>Daily Practice</h2>
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
                    className="w-full flex items-start gap-4 px-6 py-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group border"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      opacity: 0,
                      animation: 'fadeIn 0.5s ease-out forwards',
                      backgroundColor: '#DBCDC6',
                      borderColor: '#d4c4bc'
                    }}
                  >
                    <div
                      className="w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0"
                      style={{
                        backgroundColor: task.completed ? '#000000' : 'transparent',
                        borderColor: task.completed ? '#000000' : '#d4c4bc'
                      }}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 text-left space-y-1">
                      <span
                        className="block text-base transition-all duration-300"
                        style={{
                          color: task.completed ? '#d4c4bc' : '#000000',
                          textDecoration: task.completed ? 'line-through' : 'none'
                        }}
                      >
                        {task.content}
                      </span>
                      <span className="block text-xs tracking-widest uppercase" style={{ color: '#5a5a5a' }}>
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
          <div className="bg-white max-w-md w-full p-8 space-y-6 relative animate-slideUp rounded-2xl shadow-2xl">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Level up</p>
              <h2 className="text-3xl font-semibold text-stone-900">Unlock unlimited goals</h2>
              <p className="text-stone-600">
                Run multiple grids, explore new directions, and keep every pillar aligned.
              </p>
            </div>
            
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Unlimited goals and grids to map every ambition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Track multiple life areas at once with dedicated pillars</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Priority updates and upcoming analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-900 font-medium">✓</span>
                <span>Priority support when you need it</span>
              </li>
            </ul>
            
            <div className="text-center py-4 border-t border-b border-stone-200">
              <div className="text-4xl font-light text-stone-900 mb-1">$4.99</div>
              <div className="text-sm text-stone-500">per month</div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="flex-1 px-6 py-3 border border-stone-300 text-stone-900 hover:bg-stone-50 transition-all duration-300 text-sm tracking-wide rounded-xl"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="flex-1 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 disabled:opacity-50 text-sm tracking-wide rounded-xl"
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
    </>
  )
}