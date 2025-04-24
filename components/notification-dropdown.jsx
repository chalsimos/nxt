"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, MessageSquare, Pill, User } from "lucide-react"

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "Appointment Reminder",
      message: "You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM.",
      time: "1 hour ago",
      read: false,
      link: "/dashboard/appointments",
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message: "Dr. Michael Chen sent you a message regarding your recent test results.",
      time: "3 hours ago",
      read: false,
      link: "/dashboard/messages",
    },
    {
      id: 3,
      type: "prescription",
      title: "Prescription Refill",
      message: "Your prescription for Lisinopril has been refilled and is ready for pickup.",
      time: "Yesterday",
      read: false,
      link: "/dashboard/prescriptions",
    },
    {
      id: 4,
      type: "appointment",
      title: "Appointment Confirmed",
      message: "Your appointment with Dr. Emily Rodriguez on June 20 has been confirmed.",
      time: "2 days ago",
      read: true,
      link: "/dashboard/appointments",
    },
    {
      id: 5,
      type: "system",
      title: "Profile Update",
      message: "Please update your emergency contact information in your profile.",
      time: "3 days ago",
      read: true,
      link: "/dashboard/profile",
    },
  ])

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const getIcon = (type) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-soft-amber" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "prescription":
        return <Pill className="h-5 w-5 text-green-500" />
      case "system":
        return <User className="h-5 w-5 text-purple-500" />
      default:
        return <Clock className="h-5 w-5 text-drift-gray" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="p-2">
      <div className="flex items-center justify-between border-b border-pale-stone pb-2">
        <h3 className="text-sm font-medium text-graphite">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs font-medium text-soft-amber hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="divide-y divide-pale-stone">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link}
                className={`dropdown-item block p-3 transition-colors ${!notification.read ? "bg-pale-stone/50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-graphite">{notification.title}</p>
                    <p className="text-xs text-drift-gray line-clamp-2">{notification.message}</p>
                    <p className="mt-1 text-xs text-drift-gray flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-soft-amber"></div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-drift-gray">
            <p>No notifications</p>
          </div>
        )}
      </div>

      <div className="border-t border-pale-stone pt-2">
        <Link
          href="/dashboard/notifications"
          className="block text-center text-xs font-medium text-soft-amber hover:underline"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}
