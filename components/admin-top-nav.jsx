"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, Search, Sun, Moon, Menu, User, Settings, LogOut, ChevronDown, X } from "lucide-react"
import useMobile from "@/hooks/use-mobile"

export default function AdminTopNav({ onMenuClick }) {
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const isMobile = useMobile()
  const notificationRef = useRef(null)
  const userMenuRef = useRef(null)

  // Mock notifications
  const notifications = [
    { id: 1, message: "New doctor registration pending approval", time: "10 minutes ago", unread: true },
    { id: 2, message: "System backup completed successfully", time: "2 hours ago", unread: true },
    { id: 3, message: "5 new patient registrations today", time: "5 hours ago", unread: false },
  ]

  // Toggle search on mobile
  const toggleSearch = () => {
    setShowSearch(!showSearch)
    // Close other menus
    setShowNotifications(false)
    setShowUserMenu(false)
  }

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    // Close other menus
    setShowUserMenu(false)
    if (isMobile) setShowSearch(false)
  }

  // Toggle user menu dropdown
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
    // Close other menus
    setShowNotifications(false)
    if (isMobile) setShowSearch(false)
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Would implement actual dark mode toggle here
  }

  // Close dropdowns when clicking outside
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

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-white shadow-sm z-20 transition-all">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side - Menu button (mobile) and title */}
        <div className="flex items-center">
          {isMobile && (
            <button onClick={onMenuClick} className="p-2 mr-2 rounded-full hover:bg-pale-stone">
              <Menu className="h-5 w-5 text-graphite" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-graphite hidden md:block">Admin Panel</h1>
        </div>

        {/* Right side - Search, notifications, theme toggle, user menu */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Search button */}
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full hover:bg-pale-stone text-drift-gray"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative dropdown-container" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-pale-stone text-drift-gray relative"
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={showNotifications}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications dropdown */}
            <div 
              className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-30 border border-earth-beige overflow-hidden ${
                showNotifications ? "dropdown-enter" : "dropdown-exit hidden"
              }`}
            >
              {showNotifications && (
                <>
                  <div className="px-4 py-2 border-b border-earth-beige flex justify-between items-center">
                    <h3 className="font-semibold text-graphite">Notifications</h3>
                    <Link href="/admin/notifications" className="text-xs text-soft-amber hover:underline">
                      View All
                    </Link>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`dropdown-item px-4 py-3 border-b border-earth-beige last:border-0 ${
                          notification.unread ? "bg-pale-stone/50" : ""
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <p className="text-sm text-graphite">{notification.message}</p>
                            <p className="text-xs text-drift-gray mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && <span className="h-2 w-2 bg-soft-amber rounded-full mt-1"></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-pale-stone text-drift-gray hidden md:block"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User menu */}
          <div className="relative dropdown-container" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-1 p-1 rounded-full hover:bg-pale-stone"
              aria-haspopup="true"
              aria-expanded={showUserMenu}
            >
              <div className="h-8 w-8 rounded-full bg-soft-amber/20 flex items-center justify-center text-soft-amber">
                <User className="h-5 w-5" />
              </div>
              <ChevronDown className="h-4 w-4 text-drift-gray hidden md:block" />
            </button>

            {/* User dropdown */}
            <div 
              className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30 border border-earth-beige overflow-hidden ${
                showUserMenu ? "dropdown-enter" : "dropdown-exit hidden"
              }`}
            >
              {showUserMenu && (
                <>
                  <div className="px-4 py-2 border-b border-earth-beige">
                    <p className="font-medium text-sm text-graphite">Admin User</p>
                    <p className="text-xs text-drift-gray">admin@smartcare.com</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/profile"
                      className="dropdown-item flex items-center px-4 py-2 text-sm text-drift-gray"
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="dropdown-item flex items-center px-4 py-2 text-sm text-drift-gray"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </Link>
                    <button className="dropdown-item flex items-center px-4 py-2 text-sm text-drift-gray w-full text-left">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {showSearch && isMobile && (
        <div className="px-4 py-2 border-t border-earth-beige flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 bg-pale-stone rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-soft-amber"
            autoFocus
          />
          <button onClick={toggleSearch} className="ml-2 p-1 rounded-full hover:bg-pale-stone">
            <X className="h-5 w-5 text-drift-gray" />
          </button>
        </div>
      )}

      {/* Desktop search bar */}
      {!isMobile && (
        <div className="hidden md:block absolute top-3 left-1/2 transform -translate-x-1/2 w-1/3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users, appointments, logs..."
              className="w-full px-4 py-2 pl-10 bg-pale-stone rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-soft-amber"
            />
            <Search className="h-4 w-4 text-drift-gray absolute left-3 top-2.5" />
          </div>
        </div>
      )}
    </header>
  )
}
