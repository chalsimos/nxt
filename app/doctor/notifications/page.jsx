"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Bell, Check, Filter, Search, Trash2, Calendar, MessageSquare, User } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export default function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read, type
  const [typeFilter, setTypeFilter] = useState("all") // all, appointment, message, patient, system
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showTypeFilterMenu, setShowTypeFilterMenu] = useState(false)

  useEffect(() => {
    // Simulate fetching notifications
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: "appointment",
          title: "New Appointment Request",
          message: "John Doe has requested an appointment for June 18 at 2:00 PM.",
          time: new Date(2023, 5, 15, 9, 30),
          read: false,
          patientId: "P12345",
        },
        {
          id: 2,
          type: "message",
          title: "New Message",
          message: "You have a new message from patient Sarah Johnson regarding her medication.",
          time: new Date(2023, 5, 14, 14, 15),
          read: false,
          patientId: "P23456",
        },
        {
          id: 3,
          type: "patient",
          title: "New Patient Assigned",
          message: "A new patient, Michael Brown, has been assigned to you.",
          time: new Date(2023, 5, 13, 11, 45),
          read: false,
          patientId: "P34567",
        },
        {
          id: 4,
          type: "appointment",
          title: "Appointment Cancelled",
          message: "Emily Wilson has cancelled her appointment scheduled for June 16.",
          time: new Date(2023, 5, 12, 16, 30),
          read: true,
          patientId: "P45678",
        },
        {
          id: 5,
          type: "system",
          title: "System Maintenance",
          message: "The system will be undergoing maintenance on June 20 from 2:00 AM to 4:00 AM.",
          time: new Date(2023, 5, 10, 9, 0),
          read: true,
        },
        {
          id: 6,
          type: "patient",
          title: "Patient Record Updated",
          message: "Robert Johnson's medical record has been updated with new test results.",
          time: new Date(2023, 5, 9, 13, 20),
          read: true,
          patientId: "P56789",
        },
        {
          id: 7,
          type: "system",
          title: "New Feature Available",
          message: "You can now export patient data to PDF directly from their profile.",
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
    const matchesReadFilter =
      filter === "all" || (filter === "unread" && !notification.read) || (filter === "read" && notification.read)
    const matchesTypeFilter = typeFilter === "all" || notification.type === typeFilter
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesReadFilter && matchesTypeFilter && matchesSearch
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return (
          <div className="rounded-full bg-soft-amber/20 p-2">
            <Calendar className="h-5 w-5 text-soft-amber" />
          </div>
        )
      case "message":
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </div>
        )
      case "patient":
        return (
          <div className="rounded-full bg-green-100 p-2">
            <User className="h-5 w-5 text-green-500" />
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

  const getTypeFilterLabel = () => {
    switch (typeFilter) {
      case "all":
        return "All Types"
      case "appointment":
        return "Appointments"
      case "message":
        return "Messages"
      case "patient":
        return "Patients"
      case "system":
        return "System"
      default:
        return "All Types"
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
        <div className="flex space-x-3">
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterMenu(!showFilterMenu)
                setShowTypeFilterMenu(false)
              }}
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
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeFilterMenu(!showTypeFilterMenu)
                setShowFilterMenu(false)
              }}
              className="flex items-center justify-center rounded-md border border-pale-stone bg-white px-4 py-2 text-sm font-medium text-graphite hover:bg-pale-stone"
            >
              <Bell className="mr-2 h-4 w-4" />
              {getTypeFilterLabel()}
            </button>
            {showTypeFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-pale-stone bg-white shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setTypeFilter("all")
                      setShowTypeFilterMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      typeFilter === "all" ? "bg-pale-stone text-soft-amber" : "text-graphite hover:bg-pale-stone"
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter("appointment")
                      setShowTypeFilterMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      typeFilter === "appointment"
                        ? "bg-pale-stone text-soft-amber"
                        : "text-graphite hover:bg-pale-stone"
                    }`}
                  >
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-soft-amber" />
                      Appointments
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter("message")
                      setShowTypeFilterMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      typeFilter === "message" ? "bg-pale-stone text-soft-amber" : "text-graphite hover:bg-pale-stone"
                    }`}
                  >
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                      Messages
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter("patient")
                      setShowTypeFilterMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      typeFilter === "patient" ? "bg-pale-stone text-soft-amber" : "text-graphite hover:bg-pale-stone"
                    }`}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-green-500" />
                      Patients
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setTypeFilter("system")
                      setShowTypeFilterMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      typeFilter === "system" ? "bg-pale-stone text-soft-amber" : "text-graphite hover:bg-pale-stone"
                    }`}
                  >
                    <div className="flex items-center">
                      <Bell className="mr-2 h-4 w-4 text-purple-500" />
                      System
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
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
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-drift-gray">{format(notification.time, "MMM d, yyyy 'at' h:mm a")}</p>
                    {notification.patientId && (
                      <Link
                        href={`/doctor/patients/${notification.patientId}`}
                        className="text-xs font-medium text-soft-amber hover:underline"
                      >
                        View Patient
                      </Link>
                    )}
                  </div>
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
              : filter !== "all" || typeFilter !== "all"
                ? `No ${filter !== "all" ? filter : ""} ${typeFilter !== "all" ? typeFilter : ""} notifications`
                : "You're all caught up!"}
          </p>
        </div>
      )}
    </div>
  )
}
