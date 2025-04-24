"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Bell, BellOff, Trash, MailOpen } from "lucide-react"

export default function ConversationOptionsMenu({ onDelete, onMute, onUnmute, onMarkAsUnread, isMuted }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
        setShowDeleteConfirmation(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Toggle menu
  const toggleMenu = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
    setShowDeleteConfirmation(false)
  }

  // Handle menu item click
  const handleMenuItemClick = (action) => {
    setShowMenu(false)
    if (typeof action === "function") {
      action()
    }
  }

  // Handle delete confirmation
  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = () => {
    setShowMenu(false)
    setShowDeleteConfirmation(false)
    if (typeof onDelete === "function") {
      onDelete()
    }
  }

  const cancelDelete = (e) => {
    e.stopPropagation()
    setShowDeleteConfirmation(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="rounded-full p-2 text-drift-gray hover:bg-pale-stone hover:text-soft-amber"
        title="More options"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showMenu && !showDeleteConfirmation && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-earth-beige bg-white py-1 shadow-lg">
          <button
            onClick={() => handleMenuItemClick(onMarkAsUnread)}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-graphite hover:bg-pale-stone"
          >
            <MailOpen className="mr-2 h-4 w-4" />
            Mark as unread
          </button>

          {isMuted ? (
            <button
              onClick={() => handleMenuItemClick(onUnmute)}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-graphite hover:bg-pale-stone"
            >
              <Bell className="mr-2 h-4 w-4" />
              Unmute
            </button>
          ) : (
            <button
              onClick={() => handleMenuItemClick(onMute)}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-graphite hover:bg-pale-stone"
            >
              <BellOff className="mr-2 h-4 w-4" />
              Mute
            </button>
          )}

          <button
            onClick={handleDeleteClick}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-pale-stone"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete conversation
          </button>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="absolute right-0 top-full z-10 mt-1 w-64 rounded-md border border-earth-beige bg-white p-3 shadow-lg">
          <p className="mb-3 text-sm text-graphite">Are you sure you want to delete this conversation?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={cancelDelete}
              className="rounded-md border border-earth-beige px-3 py-1 text-xs text-graphite hover:bg-pale-stone"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-md bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
