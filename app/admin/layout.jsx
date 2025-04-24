"use client"
import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin-sidebar"
import AdminTopNav from "@/components/admin-top-nav"
import AdminMobileNav from "@/components/admin-mobile-nav"
import { usePathname } from "next/navigation"
import useMobile from "@/hooks/use-mobile"

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isMobile = useMobile()

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  return (
    <div className="min-h-screen bg-pale-stone flex flex-col">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar - shows when toggled */}
      {isMobile && <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={true} />}

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen flex flex-col flex-grow">
        <AdminTopNav onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24 pb-20 md:pb-6 w-full">{children}</main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <AdminMobileNav />}
      </div>
    </div>
  )
}
