"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  FileText,
  Settings,
  Shield,
  ClipboardList,
  Bell,
  MessageSquare,
  ChevronRight,
  X,
} from "lucide-react"
import { AdminLogout } from "@/components/admin-logout"

export default function AdminSidebar({ isOpen = true, onClose, isMobile = false }) {
  const pathname = usePathname()

  // Handle escape key press to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isMobile && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isMobile, isOpen, onClose])

  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobile, isOpen])

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`
    : "fixed inset-y-0 left-0 w-64 bg-white shadow-md z-30"

  // Backdrop for mobile
  const backdrop = isMobile && isOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" onClick={onClose} />
  )

  return (
    <>
      {backdrop}
      <aside className={sidebarClasses}>
        {/* Logo and Close Button (Mobile) */}
        <div className="flex items-center justify-between p-4 border-b border-earth-beige">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-soft-amber">Smart</span>
            <span className="text-xl font-bold text-graphite">Care</span>
            <span className="ml-2 text-xs bg-soft-amber text-white px-2 py-0.5 rounded">Admin</span>
          </Link>
          {isMobile && (
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5 text-graphite" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="space-y-1">
            <NavItem
              href="/admin/dashboard"
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Dashboard"
              active={pathname === "/admin/dashboard"}
            />

            {/* User Management Section */}
            <NavSection title="User Management">
              <NavItem
                href="/admin/patients"
                icon={<Users className="h-5 w-5" />}
                label="Patients"
                active={pathname === "/admin/patients"}
              />
              <NavItem
                href="/admin/doctors"
                icon={<UserCog className="h-5 w-5" />}
                label="Doctors"
                active={pathname === "/admin/doctors"}
              />
              <NavItem
                href="/admin/pending-accounts"
                icon={<Users className="h-5 w-5" />}
                label="Pending Accounts"
                active={pathname === "/admin/pending-accounts"}
                badge={23}
              />
            </NavSection>

            {/* Content Management */}
            <NavSection title="Management">
              <NavItem
                href="/admin/appointments"
                icon={<Calendar className="h-5 w-5" />}
                label="Appointments"
                active={pathname === "/admin/appointments"}
              />
              <NavItem
                href="/admin/reports"
                icon={<FileText className="h-5 w-5" />}
                label="Reports & Exports"
                active={pathname === "/admin/reports"}
              />
              <NavItem
                href="/admin/settings"
                icon={<Settings className="h-5 w-5" />}
                label="System Settings"
                active={pathname === "/admin/settings"}
              />
              <NavItem
                href="/admin/roles"
                icon={<Shield className="h-5 w-5" />}
                label="Roles & Permissions"
                active={pathname === "/admin/roles"}
              />
            </NavSection>

            {/* Monitoring */}
            <NavSection title="Monitoring">
              <NavItem
                href="/admin/logs"
                icon={<ClipboardList className="h-5 w-5" />}
                label="Audit Logs"
                active={pathname === "/admin/logs"}
              />
              <NavItem
                href="/admin/notifications"
                icon={<Bell className="h-5 w-5" />}
                label="Notifications"
                active={pathname === "/admin/notifications"}
              />
              <NavItem
                href="/admin/feedback"
                icon={<MessageSquare className="h-5 w-5" />}
                label="Feedback & Support"
                active={pathname === "/admin/feedback"}
                badge={5}
              />
            </NavSection>
          </div>

          {/* Add the logout option at the bottom */}
          <div className="mt-auto pt-4 border-t border-earth-beige">
            <AdminLogout />
          </div>
        </nav>
      </aside>
    </>
  )
}

// Navigation Item Component
function NavItem({ href, icon, label, active = false, badge }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
        active ? "bg-soft-amber/10 text-soft-amber" : "text-drift-gray hover:bg-pale-stone hover:text-graphite"
      }`}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${active ? "text-soft-amber" : ""}`}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>}
    </Link>
  )
}

// Navigation Section Component
function NavSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-semibold text-drift-gray uppercase tracking-wider mb-2 hover:text-graphite"
      >
        <span>{title}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <div className={`space-y-1 ml-1 ${isOpen ? "block" : "hidden"}`}>{children}</div>
    </div>
  )
}
