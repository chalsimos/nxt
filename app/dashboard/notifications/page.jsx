"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Clock, Filter, Search, Trash2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  useEffect(() => {
    // Simulate fetching notifications
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: "appointment",
          title: "Appointment Reminder",
          message: "You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM.",
          time: new Date(2023, 5, 15, 9, 30),
          read: false,
        },
        {
          id: 2,
          type: "message",
          title: "New Message",
          message: "Dr. Michael Chen sent you a message regarding your recent test results.",
          time: new Date(2023, 5, 14, 14, 15),
          read: false,
        },
        {
          id: 3,
          type: "prescription",
          title: "Prescription Refill",
          message: "Your prescription for Lisinopril has been refilled and is ready for pickup.",
          time: new Date(2023, 5, 13, 11, 45),
          read: false,
        },
        {
          id: 4,
          type: "appointment",
          title: "Appointment Confirmed",
          message: "Your appointment with Dr. Emily Rodriguez on June 20 has been confirmed.",
          time: new Date(2023, 5, 12, 16, 30),
          read: true,
        },
        {
          id: 5,
          type: "system",
          title: "Profile Update",
          message: "Please update your emergency contact information in your profile.",
          time: new Date(2023, 5, 10, 9, 0),
          read: true,
        },
        {
          id: 6,
          type: "prescription",
          title: "Prescription Expiring",
          message: "Your prescription for Metformin will expire in 7 days. Contact your doctor for a renewal.",
          time: new Date(2023, 5, 9, 13, 20),
          read: true,
        },
        {
          id: 7,
          type: "system",
          title: "New Feature Available",
          message: "You can now download your medical records directly from your dashboard.",
          time: new Date(2023, 5, 8, 10, 15),
          read: true,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" || (filter === "unread" && !notification.read) || (filter === "read" && notification.read)
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return (
          <div className="rounded-full bg-soft-amber/20 p-2">
            <Clock className="h-5 w-5 text-soft-amber" />
          </div>
        )
      case "message":
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <Bell className="h-5 w-5 text-blue-500" />
          </div>
        )
      case "prescription":
        return (
          <div className="rounded-full bg-green-100 p-2">
            <Bell className="h-5 w-5 text-green-500" />
          </div>
        )
      case "system":
        return (
          <div className="rounded-full bg-purple-100 p-2">
            <Bell className="h-5 w-5 text-purple-500" />
          </div>
        )
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2">
            <Bell className="h-5 w-5 text-gray-500" />
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 md:pt-28">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-graphite mb-4 md:mb-0">Notifications</h1>
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center justify-center rounded-md border border-soft-amber px-4 py-2 text-sm font-medium text-soft-amber hover:bg-soft-amber/10"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="flex items-center justify-center rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-pale-stone bg-white p-2 pl-10 text-sm text-graphite focus:border-soft-amber focus:ring-soft-amber"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center justify-center rounded-md border border-pale-stone bg-white px-4 py-2 text-sm font-medium text-graphite hover:bg-pale-stone"
          >
            <Filter className="mr-2 h-4 w-4" />
            {filter === "all" ? "All" : filter === "unread" ? "Unread" : "Read"}
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-pale-stone bg-white shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setFilter("all")
                    setShowFilterMenu(false)
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    filter === "all" ? "bg-pale-stone text-soft-amber" : "text-graphite hover:bg-pale-stone"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setFilter("unread")
                    setShowFilterMenu(false)
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    filter === "unread" ? "bg-pale-stone text-soft-amber" : "text-graphite hover:bg-pale-stone"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => {
                    setFilter("read")
                    setShowFilterMenu(false)
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    filter === "read" ? "bg-pale-stone text-soft-amber" : "text-graphite hover:bg-pale-stone"
                  }`}
                >
                  Read
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-soft-amber"></div>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative rounded-lg border ${
                notification.read ? "border-pale-stone bg-white" : "border-soft-amber/30 bg-soft-amber/5"
              } p-4 shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex items-start">
                <div className="mr-4 mt-1 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-graphite">{notification.title}</h3>
                    <span className="text-xs text-drift-gray">
                      {formatDistanceToNow(notification.time, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-drift-gray mb-2">{notification.message}</p>
                  <p className="text-xs text-drift-gray">{format(notification.time, "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              <div className="absolute right-2 top-2 flex space-x-1">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="rounded p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="rounded p-1 text-drift-gray hover:bg-red-50 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {!notification.read && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 rounded-full bg-soft-amber"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-pale-stone bg-white py-12">
          <Bell className="h-12 w-12 text-drift-gray mb-4" />
          <h3 className="text-lg font-medium text-graphite mb-1">No notifications</h3>
          <p className="text-sm text-drift-gray">
            {searchQuery
              ? "No notifications match your search"
              : filter !== "all"
                ? `No ${filter} notifications`
                : "You're all caught up!"}
          </p>
        </div>
      )}
    </div>
  )
}
