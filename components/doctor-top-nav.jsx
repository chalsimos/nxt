"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Calendar,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Users,
  FileArchive,
  MessageCircle,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { LogoutConfirmation } from "@/components/logout-confirmation"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useAuth } from "@/contexts/auth-context"

export function DoctorTopNav() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)
  const { user, logout } = useAuth()

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showUserMenu, showNotifications])

  // Desktop navigation links
  const desktopNavLinks = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: Home },
    { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/doctor/chat", label: "Messages", icon: MessageSquare },
  ]

  // User menu links - now includes Records
  const userMenuLinks = [
    { href: "/doctor/profile", label: "Profile", icon: User },
    { href: "/doctor/records", label: "Medical Records", icon: FileArchive },
    { href: "/doctor/feedback", label: "Feedback & Support", icon: MessageCircle },
    { href: "/doctor/settings", label: "Settings", icon: Settings },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-pale-stone bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center md:w-1/3">
            <Link href="/doctor/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-soft-amber">SmartCare</span>
              <span className="ml-2 rounded-md bg-soft-amber px-2 py-1 text-xs font-medium text-white">Doctor</span>
            </Link>
          </div>

          {!isMobile && (
            <nav className="hidden md:flex md:w-1/3 md:justify-center">
              <div className="flex space-x-1">
                {desktopNavLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-pale-stone text-soft-amber"
                          : "text-drift-gray hover:bg-pale-stone hover:text-soft-amber"
                      }`}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </nav>
          )}

          <div className="flex items-center justify-end space-x-4 md:w-1/3">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber"
                aria-haspopup="true"
                aria-expanded={showNotifications}
              >
                <Bell className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-soft-amber text-xs font-medium text-white">
                  5
                </span>
                <span className="sr-only">Notifications</span>
              </button>

              <div 
                className={`absolute right-0 mt-2 w-80 rounded-md border border-pale-stone bg-white dropdown-shadow overflow-hidden ${
                  showNotifications ? "dropdown-enter" : "dropdown-exit hidden"
                }`}
              >
                {showNotifications && <NotificationDropdown />}
              </div>
            </div>

            <div className="relative user-menu-container" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center rounded-full text-drift-gray hover:text-soft-amber"
                aria-haspopup="true"
                aria-expanded={showUserMenu}
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-pale-stone">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-1" />
                  )}
                </div>
              </button>

              <div
                className={`absolute right-0 mt-2 w-56 rounded-md border border-pale-stone bg-white dropdown-shadow overflow-hidden ${
                  showUserMenu ? "dropdown-enter" : "dropdown-exit hidden"
                }`}
              >
                {showUserMenu && (
                  <div className="p-2">
                    <div className="border-b border-pale-stone pb-2 mb-2">
                      <p className="px-3 py-1 text-sm font-medium text-graphite">{user?.displayName || "Dr. User"}</p>
                      <p className="px-3 py-1 text-xs text-drift-gray">{user?.email || "doctor@example.com"}</p>
                    </div>
                    {userMenuLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="dropdown-item flex items-center rounded-md px-3 py-2 text-sm text-drift-gray hover:text-soft-amber"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowLogoutConfirmation(true)
                      }}
                      className="dropdown-item flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
