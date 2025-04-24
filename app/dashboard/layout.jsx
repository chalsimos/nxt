"use client"

import { useState, useEffect } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { useMobile } from "@/hooks/use-mobile"
import { usePathname } from "next/navigation"
import CallNotification from "@/components/call-notification"

export default function DashboardLayout({ children }) {
  const isMobile = useMobile()
  const pathname = usePathname()
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [currentPath, setCurrentPath] = useState(pathname)
  const [content, setContent] = useState(children)

  // Check if we're on the messages page
  const isMessagesPage = pathname === "/dashboard/messages"

  // Handle page transitions
  useEffect(() => {
    if (pathname !== currentPath) {
      setIsPageTransitioning(true)

      // Short delay to allow animation to play
      const timer = setTimeout(() => {
        setContent(children)
        setCurrentPath(pathname)
        setIsPageTransitioning(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [pathname, children, currentPath])

  // Don't show navigation on messages page for full screen experience
  if (isMessagesPage) {
    return <ProtectedRoute requiredRole="patient">{children}</ProtectedRoute>
  }

  return (
    <ProtectedRoute requiredRole="patient">
      <div className="min-h-screen bg-pale-stone">
        <DashboardNav />
        <main className="container mx-auto px-4 pb-20 pt-24 md:px-6 md:pb-12">
          <div className={`${isPageTransitioning ? "opacity-0" : "page-transition-enter"}`}>{content}</div>
        </main>
        {isMobile && <MobileNav />}
        <CallNotification />
      </div>
    </ProtectedRoute>
  )
}
