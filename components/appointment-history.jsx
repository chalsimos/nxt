"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Add doctorId and viewMode props to the component definition
export function AppointmentHistory({ userId, viewMode = "patient", doctorId }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [filterDate, setFilterDate] = useState("")
  const [error, setError] = useState("")

  // Load appointments
  // In the useEffect where appointments are loaded, update the query based on viewMode
  useEffect(() => {
    if (!userId) return

    try {
      setLoading(true)
      setError("")

      // Create the appropriate query based on viewMode
      let q
      if (viewMode === "doctor" && doctorId) {
        // For doctor view, get appointments where the doctor is the current user and patient is the userId
        q = query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId),
          where("patientId", "==", userId),
          orderBy("date", "desc"),
        )
      } else {
        // For patient view, get appointments where the patient is the userId
        q = query(collection(db, "appointments"), where("patientId", "==", userId), orderBy("date", "desc"))
      }

      // Rest of the code remains the same
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const appointmentsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Sort appointments by date (most recent first)
          const sortedAppointments = [...appointmentsData].sort(
            (a, b) => new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time),
          )
          setAppointments(sortedAppointments)
          setLoading(false)
        },
        (error) => {
          console.error("Error fetching appointments:", error)
          setError(error.message)
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setError(error.message)
      setLoading(false)
    }
  }, [userId, viewMode, doctorId])

  // Filter appointments based on search, status, and date
  const filteredAppointments = appointments.filter((appointment) => {
    // Filter by search term
    const matchesSearch =
      appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.location?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus

    // Filter by date
    const matchesDate = !filterDate || appointment.date === filterDate

    return matchesSearch && matchesStatus && matchesDate
  })

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </span>
        )
      case "scheduled":
      case "approved":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <Calendar className="mr-1 h-3 w-3" />
            Scheduled
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {status}
          </span>
        )
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"

    try {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      return new Date(dateString).toLocaleDateString(undefined, options)
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterDate("")
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center justify-center rounded-md border border-earth-beige bg-white px-3 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2 w-full sm:w-auto mt-2 sm:mt-0"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {(filterStatus !== "all" || filterDate) && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-soft-amber text-xs text-white">
              {(filterStatus !== "all" ? 1 : 0) + (filterDate ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-earth-beige bg-white p-4 shadow-sm animate-slideDown">
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label htmlFor="filterStatus" className="text-sm font-medium text-graphite">
                Appointment Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="approved">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="filterDate" className="text-sm font-medium text-graphite">
                Appointment Date
              </label>
              <input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              />
            </div>

            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone w-full sm:w-auto"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-amber mb-4"></div>
            <p className="text-drift-gray">Loading your appointment history...</p>
          </div>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="overflow-hidden rounded-lg border border-pale-stone bg-white shadow-sm transition-all hover:shadow-md"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                opacity: 0,
              }}
            >
              <div className="p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-graphite">{appointment.type || "Medical Appointment"}</h3>
                    <div>{getStatusBadge(appointment.status)}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-drift-gray">
                    <div className="flex items-center">
                      <Calendar className="mr-1.5 h-4 w-4 text-soft-amber flex-shrink-0" />
                      <span className="truncate">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1.5 h-4 w-4 text-soft-amber flex-shrink-0" />
                      {appointment.time || "Time not specified"}
                    </div>
                    {appointment.doctorName && (
                      <div className="flex items-center">
                        <User className="mr-1.5 h-4 w-4 text-soft-amber flex-shrink-0" />
                        <span className="truncate">Dr. {appointment.doctorName}</span>
                      </div>
                    )}
                    {appointment.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-1.5 h-4 w-4 text-soft-amber flex-shrink-0" />
                        <span className="truncate">{appointment.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="mt-3 border-t border-pale-stone pt-3">
                    <p className="text-sm text-drift-gray">
                      <span className="font-medium text-graphite">Symptoms/Reason: </span>
                      {appointment.symptoms}
                    </p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-drift-gray">
                      <span className="font-medium text-graphite">Notes: </span>
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-pale-stone bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pale-stone">
            <CalendarDays className="h-8 w-8 text-drift-gray" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-graphite">No Appointments Found</h3>
          <p className="mb-4 text-drift-gray">
            {searchTerm || filterStatus !== "all" || filterDate
              ? "No appointments match your search criteria. Try adjusting your filters."
              : "You don't have any appointment history yet."}
          </p>
        </div>
      )}
    </div>
  )
}
