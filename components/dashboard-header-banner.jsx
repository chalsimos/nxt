"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export function DashboardHeaderBanner({ userRole = "patient", className = "" }) {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("Good day")
  const [quote, setQuote] = useState("")

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  // Set random quote based on user role
  useEffect(() => {
    const patientQuotes = [
      "Your health is an investment, not an expense.",
      "Taking care of yourself is part of taking care of your health.",
      "Small steps lead to big changes in your health journey.",
      "Prevention is better than cure.",
      "Your health is your wealth.",
    ]

    const doctorQuotes = [
      "Making a difference in patients' lives, one appointment at a time.",
      "The best doctor gives the least medicine.",
      "Let the patient's well-being be your highest mission.",
      "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
      "The good physician treats the disease; the great physician treats the patient.",
    ]

    const quotes = userRole === "doctor" ? doctorQuotes : patientQuotes
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(randomQuote)
  }, [userRole])

  return (
    <div
      className={`relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber to-deep-amber p-6 text-white shadow-md ${className}`}
    >
      <div className="relative z-10">
        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {greeting}, {user?.displayName || (userRole === "doctor" ? "Doctor" : "Patient")}
            </h2>
            <p className="mt-1 text-sm text-white/90 sm:text-base">{quote}</p>
          </div>
          <div className="mt-4 flex items-center space-x-2 sm:mt-0">
            <div className="flex h-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm px-3">
              <span className="text-sm font-medium">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {userRole === "doctor" ? (
            <>
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase text-white/70">Today</p>
                <p className="text-xl font-bold">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase text-white/70">Week</p>
                <p className="text-xl font-bold">
                  {new Date().toLocaleDateString("en-US", { day: "numeric" })} -{" "}
                  {new Date(Date.now() + 6 * 86400000).toLocaleDateString("en-US", { day: "numeric" })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase text-white/70">Today</p>
                <p className="text-xl font-bold">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase text-white/70">Next Checkup</p>
                <p className="text-xl font-bold">
                  {new Date(Date.now() + Math.random() * 15 * 86400000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"></div>
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10"></div>
      <div className="absolute -bottom-32 right-16 h-48 w-48 rounded-full bg-white/5"></div>
    </div>
  )
}
