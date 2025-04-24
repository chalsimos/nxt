"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  Plus,
  Search,
  User,
  X,
  SlidersHorizontal,
  CalendarDays,
  LayoutGrid,
  LayoutList,
  FileText,
  CheckCircle2,
} from "lucide-react"
import { AppointmentModal } from "@/components/appointment-modal"
import { AppointmentDetailsModal } from "@/components/appointment-details-modal"
import { CancelAppointmentModal } from "@/components/cancel-appointment-modal"
import { AppointmentSummaryModal } from "@/components/appointment-summary-modal"
import { RescheduleModal } from "@/components/reschedule-modal"
import { SuccessNotification } from "@/components/success-notification"
import { AppointmentApprovalModal } from "@/components/appointment-approval-modal"
import { useAuth } from "@/contexts/auth-context"
import { getUserAppointments, getAvailablePatients } from "@/lib/appointment-utils"

export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPatient, setFilterPatient] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("list") // 'list' or 'grid'

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)

  // Notification state
  const [notification, setNotification] = useState({ message: "", isVisible: false })

  // Patients and appointments state
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])

  // Load patients and appointments from Firebase
  useEffect(() => {
    if (!user) return

    try {
      // Load patients
      const loadPatients = async () => {
        try {
          const patientsData = await getAvailablePatients()
          setPatients(patientsData)
        } catch (error) {
          console.error("Error loading patients:", error)
        }
      }

      loadPatients()

      // Load appointments
      const unsubscribe = getUserAppointments(user.uid, "doctor", (appointmentsData) => {
        setAppointments(appointmentsData)
        setLoading(false)
      })

      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe()
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setLoading(false)
    }
  }, [user])

  // Filter appointments
  const filteredAppointments = appointments
    .filter((appointment) => {
      // Filter by search term
      const matchesSearch =
        (appointment.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.notes || "").toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by status
      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus

      // Filter by patient
      const matchesPatient = filterPatient === "all" || appointment.patientId === filterPatient

      return matchesSearch && matchesStatus && matchesPatient
    })
    .sort((a, b) => {
      // Sort by date (most recent first for completed, soonest first for upcoming)
      const dateA = new Date(a.date + "T" + a.time)
      const dateB = new Date(b.date + "T" + b.time)

      // Pending appointments first
      if (a.status === "pending" && b.status !== "pending") return -1
      if (a.status !== "pending" && b.status === "pending") return 1

      // Then approved appointments
      if (a.status === "approved" && b.status !== "approved" && b.status !== "pending") return -1
      if (a.status !== "approved" && a.status !== "pending" && b.status === "approved") return 1

      // Then by date
      if ((a.status === "pending" || a.status === "approved") && (b.status === "pending" || b.status === "approved")) {
        return dateA - dateB
      } else if (a.status === "completed" && b.status === "completed") {
        return dateB - dateA
      } else {
        return dateB - dateA
      }
    })

  // Handle appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  // Handle appointment cancellation
  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelModalOpen(true)
  }

  // Confirm cancellation
  const confirmCancelAppointment = (appointment, reason) => {
    // Close the cancel modal
    setIsCancelModalOpen(false)

    // Show success notification
    setNotification({
      message: "Appointment cancelled successfully",
      isVisible: true,
    })
  }

  // Handle appointment approval
  const handleApproveAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsApprovalModalOpen(true)
  }

  // Confirm approval
  const confirmApproveAppointment = (appointment, doctorNote) => {
    // Close the approval modal
    setIsApprovalModalOpen(false)

    // Show success notification
    setNotification({
      message: "Appointment approved successfully",
      isVisible: true,
    })
  }

  // Handle view summary
  const handleViewSummary = (appointment) => {
    setSelectedAppointment(appointment)
    setIsSummaryModalOpen(true)
  }

  // Handle reschedule
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment)
    setIsRescheduleModalOpen(true)
  }

  // Confirm reschedule
  const confirmReschedule = (updatedAppointment) => {
    // Update the appointment in the local state
    if (updatedAppointment && updatedAppointment.id) {
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) => (apt.id === updatedAppointment.id ? updatedAppointment : apt)),
      )
    }

    // Close the reschedule modal
    setIsRescheduleModalOpen(false)

    // Show success notification
    setNotification({
      message: "Appointment rescheduled successfully",
      isVisible: true,
    })
  }

  // Handle booking a new appointment
  const handleBookAppointment = (newAppointment) => {
    // Close the appointment modal
    setIsAppointmentModalOpen(false)

    // Show success notification
    setNotification({
      message: "Appointment scheduled successfully",
      isVisible: true,
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterPatient("all")
  }

  // Toggle view mode between list and grid
  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "grid" : "list")
  }

  // Get status badge for appointment
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Pending
          </span>
        )
      case "approved":
        return (
          <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Approved
          </span>
        )
      case "completed":
        return (
          <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Cancelled</span>
        )
      default:
        return null
    }
  }

  // Get border color class based on status
  const getBorderColorClass = (status) => {
    switch (status) {
      case "pending":
        return "border-l-amber-400"
      case "approved":
        return "border-l-green-400"
      case "cancelled":
        return "border-l-red-400"
      case "completed":
        return ""
      default:
        return ""
    }
  }

  // Render appointment in list view
  const renderListAppointment = (appointment, index) => {
    const isCompleted = appointment.status === "completed"
    const isCancelled = appointment.status === "cancelled"
    const isPending = appointment.status === "pending"

    return (
      <div
        key={appointment.id}
        className={`group overflow-hidden rounded-lg border-l-4 ${getBorderColorClass(appointment.status)} border border-pale-stone bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30 ${
          isCompleted ? "opacity-80 hover:opacity-100" : ""
        } ${isCancelled ? "opacity-70 hover:opacity-90" : ""}`}
        style={{
          animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
          opacity: 0,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <div className="flex items-center">
              <User className={`mr-2 h-5 w-5 ${isCompleted || isCancelled ? "text-drift-gray" : "text-soft-amber"}`} />
              <h3 className="font-medium text-graphite">{appointment.patientName}</h3>
              {getStatusBadge(appointment.status)}
            </div>
            <p className="text-sm text-drift-gray">{appointment.type}</p>
            {appointment.notes && <p className="text-sm text-drift-gray">Notes: {appointment.notes}</p>}
            {appointment.note && appointment.status === "approved" && (
              <p className="mt-1 text-sm font-medium text-graphite">
                Your note: <span className="font-normal text-drift-gray">{appointment.note}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
              <Calendar
                className={`mr-2 h-4 w-4 ${isCompleted || isCancelled ? "text-drift-gray" : "text-soft-amber"}`}
              />
              <span className="text-sm text-graphite">{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
              <Clock className={`mr-2 h-4 w-4 ${isCompleted || isCancelled ? "text-drift-gray" : "text-soft-amber"}`} />
              <span className="text-sm text-graphite">{appointment.time}</span>
            </div>
            {isCancelled && (
              <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                <X className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">Cancelled</span>
              </div>
            )}
          </div>
        </div>
        {appointment.note && appointment.status === "cancelled" && (
          <div className="mt-3 rounded-md bg-red-50 p-2">
            <p className="text-sm text-red-700">
              <span className="font-medium">Reason:</span> {appointment.note}
            </p>
          </div>
        )}
        <div className="mt-4 flex justify-end space-x-2">
          {appointment.status === "completed" ? (
            <button
              onClick={() => handleViewSummary(appointment)}
              className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
            >
              View Summary
            </button>
          ) : appointment.status === "cancelled" ? (
            <button
              onClick={() => handleReschedule(appointment)}
              className="rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              Reschedule
            </button>
          ) : appointment.status === "pending" ? (
            <>
              <button
                onClick={() => handleViewDetails(appointment)}
                className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
              >
                Details
              </button>
              <button
                onClick={() => handleCancelAppointment(appointment)}
                className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
              >
                Decline
              </button>
              <button
                onClick={() => handleApproveAppointment(appointment)}
                className="rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-600 transition-colors hover:bg-green-200"
              >
                Approve
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleViewDetails(appointment)}
                className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
              >
                Details
              </button>
              <button
                onClick={() => handleCancelAppointment(appointment)}
                className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Render appointment in grid view
  const renderGridAppointment = (appointment, index) => {
    const isCompleted = appointment.status === "completed"
    const isCancelled = appointment.status === "cancelled"
    const isPending = appointment.status === "pending"
    const isApproved = appointment.status === "approved"

    let statusColor = "bg-gray-100"
    let statusIcon = null

    if (isPending) {
      statusColor = "bg-amber-100"
      statusIcon = <Clock className="h-4 w-4 text-amber-600" />
    } else if (isApproved) {
      statusColor = "bg-green-100"
      statusIcon = <CheckCircle2 className="h-4 w-4 text-green-600" />
    } else if (isCompleted) {
      statusColor = "bg-blue-100"
      statusIcon = <FileText className="h-4 w-4 text-blue-600" />
    } else if (isCancelled) {
      statusColor = "bg-red-100"
      statusIcon = <X className="h-4 w-4 text-red-600" />
    }

    return (
      <div
        key={appointment.id}
        className={`group overflow-hidden rounded-lg border border-pale-stone bg-white shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30 ${
          isCompleted ? "opacity-80 hover:opacity-100" : ""
        } ${isCancelled ? "opacity-70 hover:opacity-90" : ""}`}
        style={{
          animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
          opacity: 0,
        }}
      >
        <div className={`h-2 w-full ${statusColor}`}></div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${statusColor} mr-3`}>
                {statusIcon}
              </div>
              <div>
                <h3 className="font-medium text-graphite">{appointment.patientName}</h3>
                <p className="text-xs text-drift-gray">{appointment.type}</p>
              </div>
            </div>
            {getStatusBadge(appointment.status)}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-drift-gray" />
              <span>{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-drift-gray" />
              <span>{appointment.time}</span>
            </div>
          </div>

          {appointment.notes && (
            <div className="mb-4 text-sm">
              <p className="font-medium text-graphite mb-1">Notes:</p>
              <p className="text-drift-gray">{appointment.notes}</p>
            </div>
          )}

          {appointment.note && appointment.status === "approved" && (
            <div className="mb-4 text-sm">
              <p className="font-medium text-graphite mb-1">Your note:</p>
              <p className="text-drift-gray">{appointment.note}</p>
            </div>
          )}

          {appointment.note && appointment.status === "cancelled" && (
            <div className="mb-4 text-sm">
              <p className="font-medium text-red-600 mb-1">Cancellation Reason:</p>
              <p className="text-red-500">{appointment.note}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-auto">
            {appointment.status === "completed" ? (
              <button
                onClick={() => handleViewSummary(appointment)}
                className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
              >
                View Summary
              </button>
            ) : appointment.status === "cancelled" ? (
              <button
                onClick={() => handleReschedule(appointment)}
                className="rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                Reschedule
              </button>
            ) : appointment.status === "pending" ? (
              <>
                <button
                  onClick={() => handleViewDetails(appointment)}
                  className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
                >
                  Details
                </button>
                <button
                  onClick={() => handleCancelAppointment(appointment)}
                  className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleApproveAppointment(appointment)}
                  className="rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-600 transition-colors hover:bg-green-200"
                >
                  Approve
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleViewDetails(appointment)}
                  className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
                >
                  Details
                </button>
                <button
                  onClick={() => handleCancelAppointment(appointment)}
                  className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber/90 to-amber-500 p-6 shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Appointments</h1>
            <p className="mt-1 text-amber-50">Manage your patient appointments</p>
          </div>

          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-soft-amber shadow-sm transition-all hover:bg-amber-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 md:mt-0 animate-fadeIn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
          <input
            type="text"
            placeholder="Search by patient, type, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={toggleViewMode}
            className="inline-flex items-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
          >
            {viewMode === "list" ? (
              <>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Grid View
              </>
            ) : (
              <>
                <LayoutList className="mr-2 h-4 w-4" />
                List View
              </>
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {(filterStatus !== "all" || filterPatient !== "all") && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-soft-amber text-xs text-white">
                {(filterStatus !== "all" ? 1 : 0) + (filterPatient !== "all" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-earth-beige bg-white p-4 shadow-sm animate-slideDown">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-end sm:space-x-4 sm:space-y-0">
            <div className="flex-1 space-y-2">
              <label htmlFor="filterStatus" className="text-sm font-medium text-graphite">
                Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="filterPatient" className="text-sm font-medium text-graphite">
                Patient
              </label>
              <select
                id="filterPatient"
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              >
                <option value="all">All Patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.displayName || patient.name || "Unknown Patient"}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="inline-flex items-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          // Loading state
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-amber mb-4"></div>
              <p className="text-drift-gray">Loading appointments...</p>
            </div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <>
            {/* Pending Appointments */}
            {filteredAppointments.some((a) => a.status === "pending") && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-graphite">Pending Appointments</h2>
                {viewMode === "list" ? (
                  <div className="space-y-4">
                    {filteredAppointments
                      .filter((a) => a.status === "pending")
                      .map((appointment, index) => renderListAppointment(appointment, index))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments
                      .filter((a) => a.status === "pending")
                      .map((appointment, index) => renderGridAppointment(appointment, index))}
                  </div>
                )}
              </div>
            )}

            {/* Approved Appointments */}
            {filteredAppointments.some((a) => a.status === "approved") && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-graphite">Approved Appointments</h2>
                {viewMode === "list" ? (
                  <div className="space-y-4">
                    {filteredAppointments
                      .filter((a) => a.status === "approved")
                      .map((appointment, index) => renderListAppointment(appointment, index))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments
                      .filter((a) => a.status === "approved")
                      .map((appointment, index) => renderGridAppointment(appointment, index))}
                  </div>
                )}
              </div>
            )}

            {/* Past Appointments */}
            {filteredAppointments.some((a) => a.status === "completed") && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-graphite">Past Appointments</h2>
                {viewMode === "list" ? (
                  <div className="space-y-4">
                    {filteredAppointments
                      .filter((a) => a.status === "completed")
                      .map((appointment, index) => renderListAppointment(appointment, index))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments
                      .filter((a) => a.status === "completed")
                      .map((appointment, index) => renderGridAppointment(appointment, index))}
                  </div>
                )}
              </div>
            )}

            {/* Cancelled Appointments */}
            {filteredAppointments.some((a) => a.status === "cancelled") && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-graphite">Cancelled Appointments</h2>
                {viewMode === "list" ? (
                  <div className="space-y-4">
                    {filteredAppointments
                      .filter((a) => a.status === "cancelled")
                      .map((appointment, index) => renderListAppointment(appointment, index))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAppointments
                      .filter((a) => a.status === "cancelled")
                      .map((appointment, index) => renderGridAppointment(appointment, index))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-pale-stone bg-white p-8 text-center shadow-sm animate-fadeIn">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pale-stone">
              <CalendarDays className="h-8 w-8 text-drift-gray" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-graphite">No Appointments Found</h3>
            <p className="mb-4 text-drift-gray">
              {searchTerm || filterStatus !== "all" || filterPatient !== "all"
                ? "No appointments match your search criteria. Try adjusting your filters."
                : "You don't have any appointments scheduled. Schedule your first appointment now."}
            </p>
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        userRole="doctor"
        onBook={handleBookAppointment}
        patients={patients}
      />

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onCancel={handleCancelAppointment}
        onViewSummary={handleViewSummary}
      />

      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        appointment={selectedAppointment}
        onConfirm={confirmCancelAppointment}
      />

      <AppointmentSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        appointment={selectedAppointment}
      />

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        appointment={selectedAppointment}
        onReschedule={confirmReschedule}
      />

      <AppointmentApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        appointment={selectedAppointment}
        onApprove={confirmApproveAppointment}
      />

      {/* Success Notification */}
      <SuccessNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
