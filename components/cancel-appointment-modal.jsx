"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { updateAppointmentStatus } from "@/lib/appointment-utils"

export function CancelAppointmentModal({ isOpen, onClose, appointment, onConfirm }) {
  const [isVisible, setIsVisible] = useState(false)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason("")
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Handle closing with animation
  const handleClose = () => {
    if (isSubmitting) return

    const backdrop = document.getElementById("cancel-backdrop")
    const modalContent = document.getElementById("cancel-content")

    if (backdrop) backdrop.style.animation = "fadeOut 0.3s ease-in-out forwards"
    if (modalContent) modalContent.style.animation = "scaleOut 0.3s ease-in-out forwards"

    setTimeout(() => {
      onClose()
    }, 280)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update appointment status in Firebase
      await updateAppointmentStatus(appointment.id, "cancelled", reason)

      // Call the onConfirm callback
      if (onConfirm) {
        onConfirm(appointment, reason)
      }

      handleClose()
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      setIsSubmitting(false)
    }
  }

  if (!isOpen && !isVisible) return null
  if (!appointment) return null

  return (
    <>
      {/* Backdrop with animation */}
      <div
        id="cancel-backdrop"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Modal with animation */}
      <div
        id="cancel-content"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
        style={{ animation: "scaleIn 0.3s ease-in-out" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-graphite">Cancel Appointment</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-4">
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Are you sure you want to cancel this appointment?</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Patient: {appointment.patientName || appointment.patient}</p>
                  <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                  <p>Time: {appointment.time}</p>
                  <p>Type: {appointment.type}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-graphite">
                Reason for cancellation
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this appointment"
                required
                className="mt-1 block w-full rounded-md border border-earth-beige p-2 text-sm text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors duration-200 hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
                disabled={isSubmitting}
              >
                Go Back
              </button>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cancelling..." : "Cancel Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
