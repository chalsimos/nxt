"use client"

import { useState, useEffect } from "react"
import { X, MessageSquare, Send, AlertCircle, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { addDoctorNoteToRecord } from "@/lib/record-utils"

export function RecordNoteModal({ isOpen, onClose, record }) {
  const { user } = useAuth()
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
    }
  }, [isOpen])

  // Handle closing with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsVisible(false)
      // Reset state after closing
      setNote("")
      setError("")
      setSuccess("")
    }, 300)
  }

  // Handle submitting a note
  const handleSubmitNote = async (e) => {
    e.preventDefault()

    if (!note.trim()) {
      setError("Please enter a note")
      return
    }

    if (!user || !record) {
      setError("Missing user or record information")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      await addDoctorNoteToRecord(record.id, user.uid, user.displayName || "Doctor", note.trim())

      setSuccess("Note added successfully")
      setNote("")

      // Close modal after success
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error("Error adding note:", error)
      setError(error.message || "Failed to add note. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen && !isVisible) return null

  return (
    <>
      {/* Backdrop with animation */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${isClosing ? "opacity-0" : ""}`}
        onClick={handleClose}
      />

      {/* Modal with animation */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } ${isClosing ? "opacity-0 scale-95" : ""}`}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber transition-colors duration-200"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex items-center mb-4">
          <MessageSquare className="h-6 w-6 text-soft-amber mr-2" />
          <h2 className="text-xl font-bold text-graphite">Add Medical Note</h2>
        </div>

        {record && (
          <div className="mb-4 p-3 bg-pale-stone/30 rounded-md">
            <p className="font-medium text-graphite">{record.name}</p>
            <p className="text-sm text-drift-gray">
              Type: {record.type} • Date: {new Date(record.date).toLocaleDateString()}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 animate-fadeIn">
            <div className="flex">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-green-700 animate-fadeIn">
            <div className="flex">
              <Check className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitNote}>
          <div className="mb-4">
            <label htmlFor="note" className="block mb-2 text-sm font-medium text-graphite">
              Medical Note
            </label>
            <textarea
              id="note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your medical observations or notes about this record..."
              className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="mr-2 rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Add Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
