"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (requiredRole && userRole !== requiredRole) {
        // Redirect based on actual role
        if (userRole === "patient") {
          router.push("/dashboard")
        } else if (userRole === "doctor") {
          router.push("/doctor/dashboard")
        } else if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/login")
        }
      }
    }
  }, [user, userRole, loading, router, requiredRole])

  // Show loading or nothing while checking authentication
  if (loading || !user || (requiredRole && userRole !== requiredRole)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-soft-amber"></div>
      </div>
    )
  }

  return children
}
