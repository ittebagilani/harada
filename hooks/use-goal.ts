// hooks/use-goal.ts
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"

export function useGoal() {
  const { isSignedIn, isLoaded } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    const saveGoalToDb = async () => {
      if (isSignedIn) {
        const pendingGoal = localStorage.getItem("pendingGoal")
        
        if (pendingGoal) {
          setIsSaving(true)
          try {
            const response = await fetch("/api/goal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ goal: pendingGoal })
            })

            if (response.ok) {
              // Clear from localStorage once saved
              localStorage.removeItem("pendingGoal")
            }
          } catch (error) {
            console.error("Error saving goal:", error)
          } finally {
            setIsSaving(false)
          }
        }
      }
    }

    saveGoalToDb()
  }, [isSignedIn, isLoaded])

  return { isSaving }
}