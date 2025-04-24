"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, AlertCircle, X, FileText } from "lucide-react"
import {
  rescheduleAppointment,
  getAvailableTimeSlots,
  normalizeDate,
  formatDateForDisplay,
} from "@/lib/appointment-utils"

export function RescheduleModal({ isOpen, onClose, appointment, onReschedule }) {
  const [isVisible, setIsVisible] = useState(false)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([])
  const [unavailableDates, setUnavailableDates] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [dateFullyBooked, setDateFullyBooked] = useState(false)
  const [isDateUnavailable, setIsDateUnavailable] = useState(false)
  const [error, setError] = useState(null)

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen && appointment) {
      setIsVisible(true)
      setDate(appointment.date || "")
      setTime("")
      setNotes(appointment.notes || "")
      setError(null)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, appointment])

  // Load available time slots when date changes
  useEffect(() => {
    if (date && appointment) {
      loadAvailableTimeSlots()
    }
  }, [date, appointment])

  // Load available time slots for the selected date
  const loadAvailableTimeSlots = async () => {
    if (!appointment || !date) return

    setLoadingTimeSlots(true)
    setError(null)
    try {
      const doctorId = appointment.doctorId
      const result = await getAvailableTimeSlots(doctorId, date)

      // Update state with available and unavailable slots
      if (result && typeof result === "object") {
        // If result is an object with available property (new format)
        setAvailableTimeSlots(Array.isArray(result.available) ? result.available : [])
        setUnavailableTimeSlots(Array.isArray(result.unavailable) ? result.unavailable : [])
        setDateFullyBooked(result.isFullyBooked || false)
        setIsDateUnavailable(result.isDateUnavailable || false)

        // Update unavailable dates list
        if (result.unavailableDates && Array.isArray(result.unavailableDates)) {
          setUnavailableDates(result.unavailableDates)
        }
      } else if (Array.isArray(result)) {
        // If result is just an array of time slots (old format)
        setAvailableTimeSlots(result)
        setUnavailableTimeSlots([])
        setDateFullyBooked(false)
        setIsDateUnavailable(false)
      } else {
        // Fallback for unexpected result format
        console.error("Unexpected result format from getAvailableTimeSlots:", result)
        setAvailableTimeSlots([])
        setUnavailableTimeSlots([])
        setDateFullyBooked(false)
        setIsDateUnavailable(false)
      }

      // If we're rescheduling for the same date, add the current time slot back
      if (date === appointment.date && appointment.time) {
        const currentSlots = Array.isArray(availableTimeSlots) ? [...availableTimeSlots] : []
        if (!currentSlots.includes(appointment.time)) {
          currentSlots.push(appointment.time)
          currentSlots.sort((a, b) => {
            // Sort time slots chronologically
            const timeA = new Date(`2000/01/01 ${a}`).getTime()
            const timeB = new Date(`2000/01/01 ${b}`).getTime()
            return timeA - timeB
          })
          setAvailableTimeSlots(currentSlots)
        }
      }
    } catch (error) {
      console.error("Error loading available time slots:", error)
      setError("Failed to load available time slots. Please try again.")
      setAvailableTimeSlots([])
      setUnavailableTimeSlots([])
      setDateFullyBooked(false)
      setIsDateUnavailable(false)
    } finally {
      setLoadingTimeSlots(false)
    }
  }

  // Handle closing with animation
  const handleClose = () => {
    if (isSubmitting) return

    const backdrop = document.getElementById("reschedule-backdrop")
    const modalContent = document.getElementById("reschedule-content")

    if (backdrop) backdrop.style.animation = "fadeOut 0.3s ease-in-out forwards"
    if (modalContent) modalContent.style.animation = "scaleOut 0.3s ease-in-out forwards"

    setTimeout(() => {
      onClose()
    }, 280)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Update appointment in Firebase
      await rescheduleAppointment(appointment.id, date, time, notes)

      // Call the onReschedule callback
      if (onReschedule) {
        const updatedAppointment = {
          ...appointment,
          date,
          time,
          notes,
          status: "pending", // Reset to pending when rescheduled
        }
        onReschedule(updatedAppointment)
      }

      handleClose()
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      setError("Failed to reschedule appointment. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Check if a date is unavailable
  const checkDateUnavailable = (dateString) => {
    const normalizedDate = normalizeDate(dateString)
    return unavailableDates.includes(normalizedDate)
  }

  if (!isOpen && !isVisible) return null
  if (!appointment) return null

  // Get tomorrow's date for min date attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  return (
    <>
      {/* Backdrop with animation */}
      <div
        id="reschedule-backdrop"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Modal with animation */}
      <div
        id="reschedule-content"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
        style={{ animation: "scaleIn 0.3s ease-in-out" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-graphite">Reschedule Appointment</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber transition-colors duration-200"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="rounded-lg bg-amber-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Current Appointment Details</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>Patient: {appointment.patientName || appointment.patient}</p>
                  <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                  <p>Time: {appointment.time}</p>
                  <p>Type: {appointment.type}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-graphite">
                New Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
                <input
                  id="date"
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber transition-colors duration-200"
                  disabled={isSubmitting}
                />
              </div>

              {date && isDateUnavailable && (
                <div className="mt-1 flex items-center text-xs text-red-500">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  This date is unavailable for appointments.
                </div>
              )}

              {date && dateFullyBooked && (
                <div className="mt-1 flex items-center text-xs text-red-500">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  This date is fully booked. Please select another date.
                </div>
              )}

              {unavailableDates.length > 0 && (
                <div className="mt-1 text-xs text-drift-gray">
                  <span className="font-medium">Unavailable dates:</span>{" "}
                  {unavailableDates.slice(0, 3).map((d, i) => (
                    <span key={d}>
                      {formatDateForDisplay(d)}
                      {i < Math.min(unavailableDates.length - 1, 2) ? ", " : ""}
                    </span>
                  ))}
                  {unavailableDates.length > 3 && ` and ${unavailableDates.length - 3} more...`}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium text-graphite">
                New Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
                <select
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  disabled={
                    loadingTimeSlots ||
                    !Array.isArray(availableTimeSlots) ||
                    availableTimeSlots.length === 0 ||
                    isDateUnavailable ||
                    dateFullyBooked ||
                    isSubmitting
                  }
                  className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber disabled:bg-pale-stone disabled:text-drift-gray transition-colors duration-200"
                >
                  <option value="">{loadingTimeSlots ? "Loading available times..." : "Select a time"}</option>
                  {Array.isArray(availableTimeSlots) &&
                    availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                </select>
              </div>

              {date && !loadingTimeSlots && (
                <div className="mt-2">
                  {Array.isArray(unavailableTimeSlots) && unavailableTimeSlots.length > 0 && (
                    <div className="text-xs text-drift-gray">
                      <p className="font-medium mb-1">Unavailable times:</p>
                      <ul className="space-y-1">
                        {unavailableTimeSlots.map((slot, index) => (
                          <li key={index} className="flex items-center text-red-500">
                            <span className="inline-block w-16">{typeof slot === "object" ? slot.time : slot}</span>
                            {typeof slot === "object" && slot.reason && (
                              <span className="text-xs">- {slot.reason}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(availableTimeSlots) &&
                    availableTimeSlots.length === 0 &&
                    !dateFullyBooked &&
                    !isDateUnavailable &&
                    !loadingTimeSlots && (
                      <div className="mt-1 flex items-center text-xs text-amber-500">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        No available time slots for this date. Please select another date.
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-graphite">
                Reason for Rescheduling (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-drift-gray" />
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about why you're rescheduling"
                  rows={3}
                  className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber transition-colors duration-200"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors duration-200 hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  loadingTimeSlots ||
                  !time ||
                  !Array.isArray(availableTimeSlots) ||
                  availableTimeSlots.length === 0 ||
                  isDateUnavailable ||
                  dateFullyBooked
                }
                className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2 disabled:opacity-70"
              >
                {isSubmitting ? "Rescheduling..." : "Reschedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
