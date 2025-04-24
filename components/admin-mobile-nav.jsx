"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Calendar, Settings, ClipboardList } from "lucide-react"
import { AdminLogout } from "@/components/admin-logout"

export default function AdminMobileNav() {
  const pathname = usePathname()

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/admin/patients",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Appointments",
      href: "/admin/appointments",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Logs",
      href: "/admin/logs",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/admin/settings",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-earth-beige z-20 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-2 px-3 ${
              pathname === item.href ? "text-soft-amber" : "text-drift-gray"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        {/* Add the logout option at the bottom */}
        <div className="mt-4 pt-4 border-t border-earth-beige">
          <AdminLogout />
        </div>
      </div>
    </nav>
  )
}
