"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, X, AlertCircle, FileText, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  createAppointment,
  getAvailableTimeSlots,
  getAllDoctors,
  getAvailablePatients,
  normalizeDate,
  formatDateForDisplay,
} from "@/lib/appointment-utils"

// All possible time slots
const allTimeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
]

export function AppointmentModal({
  isOpen,
  onClose,
  userRole = "patient",
  onBook,
  appointmentToReschedule = null,
  patients = [],
  initialDate = "", // New prop to accept a pre-selected date
}) {
  const { user } = useAuth()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [reason, setReason] = useState("")
  const [doctor, setDoctor] = useState("")
  const [patient, setPatient] = useState("")
  const [type, setType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [unavailableDates, setUnavailableDates] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [patientsList, setPatientsList] = useState([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [error, setError] = useState(null)
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([])
  const [dateFullyBooked, setDateFullyBooked] = useState(false)
  const [isDateUnavailable, setIsDateUnavailable] = useState(false)

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setError(null)

      // Load doctors or patients based on user role
      if (userRole === "patient") {
        loadDoctors()
      } else {
        loadPatients()
      }
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, userRole])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Use initialDate if provided, otherwise reset
      setDate(initialDate || "")
      setTime("")
      setReason("")
      setDoctor("")
      setPatient("")
      setType("")
      setAvailableTimeSlots([])
      setUnavailableDates([])
      setUnavailableTimeSlots([])
      setDateFullyBooked(false)
      setIsDateUnavailable(false)
      setError(null)
    }
  }, [isOpen, initialDate])

  // Load available time slots when date or doctor changes
  useEffect(() => {
    if (date && (doctor || userRole === "doctor")) {
      const doctorId = userRole === "patient" ? doctor : user?.uid
      if (doctorId) {
        loadAvailableTimeSlots(doctorId, date)
      }
    }
  }, [date, doctor, userRole, user?.uid])

  // Load doctors from Firebase
  const loadDoctors = async () => {
    setLoadingDoctors(true)
    setError(null)
    try {
      const doctorsList = await getAllDoctors()
      setDoctors(doctorsList)
    } catch (error) {
      console.error("Error loading doctors:", error)
      setError("Failed to load doctors. Please try again later.")
      setDoctors([
        { id: "1", name: "Dr. Sarah Johnson", specialty: "Cardiologist" },
        { id: "2", name: "Dr. Michael Chen", specialty: "Dermatologist" },
        { id: "3", name: "Dr. Emily Rodriguez", specialty: "Neurologist" },
        { id: "4", name: "Dr. David Kim", specialty: "Pediatrician" },
      ]) // Fallback to mock data
    } finally {
      setLoadingDoctors(false)
    }
  }

  // Load patients from Firebase
  const loadPatients = async () => {
    setLoadingPatients(true)
    setError(null)
    try {
      if (patients && patients.length > 0) {
        // Use provided patients list if available
        setPatientsList(patients)
      } else {
        // Otherwise fetch from Firebase
        const patientsList = await getAvailablePatients()
        setPatientsList(
          patientsList.length > 0
            ? patientsList
            : [
                { id: "1", name: "John Smith", age: 45 },
                { id: "2", name: "Sarah Johnson", age: 32 },
                { id: "3", name: "Michael Brown", age: 28 },
                { id: "4", name: "Emily Davis", age: 56 },
              ],
        ) // Fallback to mock data if empty
      }
    } catch (error) {
      console.error("Error loading patients:", error)
      setError("Failed to load patients. Please try again later.")
      setPatientsList([
        { id: "1", name: "John Smith", age: 45 },
        { id: "2", name: "Sarah Johnson", age: 32 },
        { id: "3", name: "Michael Brown", age: 28 },
        { id: "4", name: "Emily Davis", age: 56 },
      ]) // Fallback to mock data
    } finally {
      setLoadingPatients(false)
    }
  }

  // Load available time slots for a doctor on a specific date
  const loadAvailableTimeSlots = async (doctorId, date) => {
    setLoadingTimeSlots(true)
    setError(null)
    try {
      const result = await getAvailableTimeSlots(doctorId, date)

      // Update state with available and unavailable slots
      setAvailableTimeSlots(result.available)
      setUnavailableTimeSlots(result.unavailable)
      setDateFullyBooked(result.isFullyBooked)
      setIsDateUnavailable(result.isDateUnavailable)

      // Update unavailable dates list
      if (result.unavailableDates && result.unavailableDates.length > 0) {
        setUnavailableDates(result.unavailableDates)
      }

      // Clear time selection if the date is unavailable or fully booked
      if (result.isDateUnavailable || result.isFullyBooked) {
        setTime("")
      }
    } catch (error) {
      console.error("Error loading available time slots:", error)
      setError("Failed to load available time slots. Using default schedule.")
      setAvailableTimeSlots(allTimeSlots) // Fallback to all time slots
      setUnavailableTimeSlots([])
      setDateFullyBooked(false)
      setIsDateUnavailable(false)
    } finally {
      setLoadingTimeSlots(false)
    }
  }

  if (!isOpen && !isVisible) return null

  const isRescheduling = !!appointmentToReschedule

  // Get tomorrow's date for min date attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create appointment data
      const appointmentData =
        userRole === "patient"
          ? {
              patientId: user?.uid || "patient-id",
              patientName: user?.displayName || "Patient",
              doctorId: doctor,
              doctorName: doctors.find((d) => d.id === doctor)?.name || "Doctor",
              specialty: doctors.find((d) => d.id === doctor)?.specialty || "",
              date,
              time,
              type: type || "Consultation",
              notes: reason,
              createdBy: user?.uid || "patient-id",
            }
          : {
              patientId: patient,
              patientName: patientsList.find((p) => p.id === patient)?.name || "Patient",
              doctorId: user?.uid || "doctor-id",
              doctorName: user?.displayName || "Doctor",
              specialty: user?.specialty || "Doctor",
              date,
              time,
              type: type || "Consultation",
              notes: reason,
              createdBy: user?.uid || "doctor-id",
            }

      // Create appointment in Firebase
      let appointmentId
      try {
        appointmentId = await createAppointment(appointmentData)
      } catch (error) {
        console.error("Error creating appointment in Firebase:", error)
        // Generate a mock ID for fallback
        appointmentId = "appointment-" + Date.now()
      }

      // Call onBook callback with appointment data
      if (onBook) {
        onBook({
          ...appointmentData,
          id: appointmentId,
          // If doctor created the appointment, it's automatically approved
          status: userRole === "doctor" ? "approved" : "pending",
        })
      }

      setIsSubmitting(false)
      onClose()
    } catch (error) {
      console.error("Error booking appointment:", error)
      setError("Failed to book appointment. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Handle closing with animation
  const handleClose = () => {
    if (isSubmitting) return

    const backdrop = document.getElementById("modal-backdrop")
    const modalContent = document.getElementById("modal-content")

    if (backdrop) backdrop.style.animation = "fadeOut 0.3s ease-in-out forwards"
    if (modalContent) modalContent.style.animation = "scaleOut 0.3s ease-in-out forwards"

    setTimeout(() => {
      onClose()
    }, 280)
  }

  // Check if a date is unavailable
  const checkDateUnavailable = (dateString) => {
    const normalizedDate = normalizeDate(dateString)
    return unavailableDates.includes(normalizedDate)
  }

  // Appointment types
  const appointmentTypes = [
    "Initial Visit",
    "Follow-up",
    "Consultation",
    "Annual Physical",
    "Urgent Care",
    "Specialist Referral",
  ]

  return (
    <>
      {/* Backdrop with animation */}
      <div
        id="modal-backdrop"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Modal with animation */}
      <div
        id="modal-content"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
        style={{ animation: "scaleIn 0.3s ease-in-out" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-graphite">
            {isRescheduling
              ? "Reschedule Appointment"
              : userRole === "patient"
                ? "Book an Appointment"
                : "Schedule an Appointment"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber transition-colors duration-200"
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {userRole === "patient" && (
            <div className="space-y-2">
              <label htmlFor="doctor" className="text-sm font-medium text-graphite">
                Select Doctor
              </label>
              <select
                id="doctor"
                value={doctor}
                onChange={(e) => {
                  setDoctor(e.target.value)
                  // Reset date and time when doctor changes
                  setDate("")
                  setTime("")
                  setUnavailableDates([])

                  // Update unavailable dates based on selected doctor
                  const selectedDoctor = doctors.find((d) => d.id === e.target.value)
                  if (selectedDoctor && selectedDoctor.unavailableDates) {
                    setUnavailableDates(selectedDoctor.unavailableDates)
                  }
                }}
                required
                disabled={loadingDoctors}
                className="w-full rounded-md border border-earth-beige bg-white py-2 pl-3 pr-10 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber transition-colors duration-200 disabled:bg-pale-stone disabled:text-drift-gray"
              >
                <option value="">{loadingDoctors ? "Loading doctors..." : "Select a doctor"}</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty}
                  </option>
                ))}
              </select>
            </div>
          )}

          {userRole === "doctor" && (
            <div className="space-y-2">
              <label htmlFor="patient" className="text-sm font-medium text-graphite">
                Select Patient
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
                <select
                  id="patient"
                  value={patient}
                  onChange={(e) => setPatient(e.target.value)}
                  required
                  disabled={loadingPatients}
                  className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber transition-colors duration-200 disabled:bg-pale-stone disabled:text-drift-gray"
                >
                  <option value="">{loadingPatients ? "Loading patients..." : "Select a patient"}</option>
                  {patientsList.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.name || pat.displayName} {pat.age ? `- Age: ${pat.age}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-graphite">
              Date
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
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={loadingTimeSlots || availableTimeSlots.length === 0 || isDateUnavailable || dateFullyBooked}
                className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber disabled:bg-pale-stone disabled:text-drift-gray transition-colors duration-200"
              >
                <option value="">{loadingTimeSlots ? "Loading available times..." : "Select a time"}</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {date && !loadingTimeSlots && (
              <div className="mt-2">
                {unavailableTimeSlots.length > 0 && (
                  <div className="text-xs text-drift-gray">
                    <p className="font-medium mb-1">Unavailable times:</p>
                    <ul className="space-y-1">
                      {unavailableTimeSlots.map((slot) => (
                        <li key={slot.time} className="flex items-center text-red-500">
                          <span className="inline-block w-16">{slot.time}</span>
                          <span className="text-xs">- {slot.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {availableTimeSlots.length === 0 && !dateFullyBooked && !isDateUnavailable && (
                  <div className="mt-1 flex items-center text-xs text-amber-500">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    No available time slots for this date. Please select another date.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium text-graphite">
              Appointment Type
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber transition-colors duration-200"
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium text-graphite">
              Reason for Visit
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe the reason for the visit"
              required
              rows={3}
              className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber transition-colors duration-200"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors duration-200 hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                loadingTimeSlots ||
                availableTimeSlots.length === 0 ||
                isDateUnavailable ||
                dateFullyBooked
              }
              className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting
                ? isRescheduling
                  ? "Rescheduling..."
                  : "Scheduling..."
                : isRescheduling
                  ? "Reschedule"
                  : "Schedule Appointment"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
