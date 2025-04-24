"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  setDoctorAvailability,
  getDoctorAvailability,
  normalizeDate,
  formatDateForDisplay,
} from "@/lib/appointment-utils"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export function DoctorAvailabilityModal({ isOpen, onClose, onSave }) {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedDates, setSelectedDates] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])
  const [conflictWarning, setConflictWarning] = useState(null)
  const [bookedDates, setBookedDates] = useState({})

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      loadDoctorAvailability()
      loadDoctorBookedDates()
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Load doctor's unavailable dates
  const loadDoctorAvailability = async () => {
    if (!user?.uid) return

    try {
      const unavailableDates = await getDoctorAvailability(user.uid)
      setSelectedDates(unavailableDates)
    } catch (error) {
      console.error("Error loading doctor availability:", error)
    }
  }

  // Load doctor's booked dates
  const loadDoctorBookedDates = async () => {
    if (!user?.uid) return

    try {
      const bookedDatesMap = {}

      // Query appointments for this doctor
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("doctorId", "==", user.uid),
        where("status", "in", ["pending", "approved"]),
      )

      const querySnapshot = await getDocs(appointmentsQuery)

      querySnapshot.forEach((doc) => {
        const appointment = doc.data()
        const date = appointment.date

        if (!bookedDatesMap[date]) {
          bookedDatesMap[date] = []
        }

        bookedDatesMap[date].push({
          id: doc.id,
          time: appointment.time,
          patientName: appointment.patientName,
          status: appointment.status,
        })
      })

      setBookedDates(bookedDatesMap)
    } catch (error) {
      console.error("Error loading doctor booked dates:", error)
    }
  }

  // Generate calendar days when month changes
  useEffect(() => {
    generateCalendarDays()
  }, [currentMonth])

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get the first day of the month
    const firstDay = new Date(year, month, 1)
    const firstDayIndex = firstDay.getDay()

    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0)
    const lastDate = lastDay.getDate()

    // Get the last day of the previous month
    const prevLastDay = new Date(year, month, 0)
    const prevLastDate = prevLastDay.getDate()

    // Calculate total days to display (42 = 6 rows of 7 days)
    const totalDays = 42

    const days = []

    // Previous month's days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevLastDate - i)
      days.push({
        date,
        day: prevLastDate - i,
        isCurrentMonth: false,
        isToday: false,
        dateString: normalizeDate(date),
      })
    }

    // Current month's days
    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(year, month, i)
      const today = new Date()
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday,
        dateString: normalizeDate(date),
      })
    }

    // Next month's days
    const remainingDays = totalDays - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        dateString: normalizeDate(date),
      })
    }

    setCalendarDays(days)
  }

  // Handle date selection
  const toggleDateSelection = (dateString) => {
    setSelectedDates((prev) => {
      if (prev.includes(dateString)) {
        return prev.filter((d) => d !== dateString)
      } else {
        return [...prev, dateString]
      }
    })
  }

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Handle closing with animation
  const handleClose = () => {
    if (isSubmitting) return

    const backdrop = document.getElementById("availability-backdrop")
    const modalContent = document.getElementById("availability-content")

    if (backdrop) backdrop.style.animation = "fadeOut 0.3s ease-in-out forwards"
    if (modalContent) modalContent.style.animation = "scaleOut 0.3s ease-in-out forwards"

    setTimeout(() => {
      onClose()
    }, 280)
  }

  // Update the handleSubmit function to check for existing appointments on unavailable dates
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Check if there are any approved appointments on the selected unavailable dates
      const conflictingDates = []

      for (const dateString of selectedDates) {
        const normalizedDate = normalizeDate(dateString)
        if (bookedDates[normalizedDate] && bookedDates[normalizedDate].length > 0) {
          const date = formatDateForDisplay(dateString)
          conflictingDates.push(date)
        }
      }

      // If there are conflicting appointments, show a warning
      if (conflictingDates.length > 0) {
        setConflictWarning(
          `You have existing appointments on the following dates: ${conflictingDates.join(", ")}. 
          These appointments will need to be rescheduled or cancelled.`,
        )
        setIsSubmitting(false)
        return
      }

      // Save unavailable dates to Firebase
      await setDoctorAvailability(user.uid, selectedDates)

      // Call the onSave callback
      if (onSave) {
        onSave(selectedDates)
      }

      handleClose()
    } catch (error) {
      console.error("Error saving doctor availability:", error)
      setIsSubmitting(false)
    }
  }

  if (!isOpen && !isVisible) return null

  // Format month name
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  // Get day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <>
      {/* Backdrop with animation */}
      <div
        id="availability-backdrop"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Modal with animation */}
      <div
        id="availability-content"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
        style={{ animation: "scaleIn 0.3s ease-in-out" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-graphite">Manage Availability</h2>
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
          <p className="text-sm text-drift-gray mb-4">
            Select dates when you are <span className="font-semibold">unavailable</span> for appointments.
          </p>

          <div className="calendar">
            <div className="flex items-center justify-between mb-4">
              <button onClick={goToPrevMonth} className="p-1 rounded-full hover:bg-pale-stone" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-medium">
                {monthName} {year}
              </h3>
              <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-pale-stone" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Day names */}
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-drift-gray py-1">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const normalizedDateString = normalizeDate(day.date)
                const hasBookings = bookedDates[normalizedDateString] && bookedDates[normalizedDateString].length > 0

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDateSelection(day.dateString)}
                    disabled={day.date < new Date() && !day.isToday}
                    className={`
                      p-2 text-sm rounded-md flex items-center justify-center relative
                      ${!day.isCurrentMonth ? "text-drift-gray/50" : "text-graphite"}
                      ${day.isToday ? "border border-soft-amber" : ""}
                      ${selectedDates.includes(day.dateString) ? "bg-red-100 text-red-800" : "hover:bg-pale-stone"}
                      ${day.date < new Date() && !day.isToday ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    {day.day}
                    {hasBookings && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-500"></span>}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-col space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded-sm mr-2"></div>
                <span className="text-sm text-drift-gray">Unavailable dates ({selectedDates.length})</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                </div>
                <span className="text-sm text-drift-gray">Dates with booked appointments</span>
              </div>
            </div>
          </div>

          {/* Show booked appointments for selected date */}
          {selectedDates.some((date) => {
            const normalizedDate = normalizeDate(date)
            return bookedDates[normalizedDate] && bookedDates[normalizedDate].length > 0
          }) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Booked appointments on selected unavailable dates:
              </h4>
              <ul className="text-xs space-y-1 text-blue-700">
                {selectedDates
                  .map((date) => {
                    const normalizedDate = normalizeDate(date)
                    if (bookedDates[normalizedDate] && bookedDates[normalizedDate].length > 0) {
                      return (
                        <li key={date} className="mb-2">
                          <span className="font-medium">{formatDateForDisplay(date)}</span>
                          <ul className="ml-4 mt-1">
                            {bookedDates[normalizedDate].map((booking, i) => (
                              <li key={i}>
                                {booking.time} - {booking.patientName} ({booking.status})
                              </li>
                            ))}
                          </ul>
                        </li>
                      )
                    }
                    return null
                  })
                  .filter(Boolean)}
              </ul>
              <p className="text-xs text-blue-800 mt-2">
                Setting these dates as unavailable will affect existing appointments.
              </p>
            </div>
          )}

          {conflictWarning && (
            <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-600">
              <div className="flex">
                <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                <p>{conflictWarning}</p>
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setConflictWarning(null)}
                  className="rounded-md bg-white px-3 py-1 text-xs font-medium text-graphite border border-earth-beige"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setConflictWarning(null)
                    // Save unavailable dates to Firebase
                    await setDoctorAvailability(user.uid, selectedDates)
                    // Call the onSave callback
                    if (onSave) {
                      onSave(selectedDates)
                    }
                    handleClose()
                  }}
                  className="rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="flex justify-end space-x-2">
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
                className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Availability"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
