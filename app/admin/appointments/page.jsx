"use client"
import { useState, useEffect } from "react"
import { Search, Filter, Calendar, Clock, User, Check, X, Download, Eye, Trash2 } from "lucide-react"

// Mock appointments data
const mockAppointments = [
  {
    id: 1,
    patientName: "Emma Wilson",
    patientEmail: "emma.wilson@example.com",
    doctorName: "Dr. Sarah Johnson",
    doctorSpecialty: "Cardiology",
    date: "2023-04-10",
    time: "10:00 AM",
    status: "confirmed",
    type: "consultation",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    patientName: "James Rodriguez",
    patientEmail: "james.r@example.com",
    doctorName: "Dr. Michael Chen",
    doctorSpecialty: "Neurology",
    date: "2023-04-10",
    time: "11:30 AM",
    status: "confirmed",
    type: "follow-up",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    patientName: "Sophia Chen",
    patientEmail: "sophia.chen@example.com",
    doctorName: "Dr. Emily Rodriguez",
    doctorSpecialty: "Pediatrics",
    date: "2023-04-10",
    time: "2:00 PM",
    status: "cancelled",
    type: "consultation",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    patientName: "Michael Johnson",
    patientEmail: "michael.j@example.com",
    doctorName: "Dr. David Kim",
    doctorSpecialty: "Orthopedics",
    date: "2023-04-11",
    time: "9:15 AM",
    status: "confirmed",
    type: "follow-up",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    patientName: "Olivia Martinez",
    patientEmail: "olivia.m@example.com",
    doctorName: "Dr. Jessica Patel",
    doctorSpecialty: "Dermatology",
    date: "2023-04-11",
    time: "10:45 AM",
    status: "pending",
    type: "consultation",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    patientName: "William Taylor",
    patientEmail: "william.t@example.com",
    doctorName: "Dr. Robert Wilson",
    doctorSpecialty: "Internal Medicine",
    date: "2023-04-11",
    time: "1:30 PM",
    status: "confirmed",
    type: "consultation",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    patientName: "Ava Brown",
    patientEmail: "ava.brown@example.com",
    doctorName: "Dr. Sarah Johnson",
    doctorSpecialty: "Cardiology",
    date: "2023-04-12",
    time: "11:00 AM",
    status: "confirmed",
    type: "follow-up",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    patientName: "Ethan Davis",
    patientEmail: "ethan.d@example.com",
    doctorName: "Dr. Michael Chen",
    doctorSpecialty: "Neurology",
    date: "2023-04-12",
    time: "3:30 PM",
    status: "pending",
    type: "consultation",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 9,
    patientName: "Emma Wilson",
    patientEmail: "emma.wilson@example.com",
    doctorName: "Dr. Jessica Patel",
    doctorSpecialty: "Dermatology",
    date: "2023-04-13",
    time: "9:30 AM",
    status: "confirmed",
    type: "follow-up",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 10,
    patientName: "James Rodriguez",
    patientEmail: "james.r@example.com",
    doctorName: "Dr. David Kim",
    doctorSpecialty: "Orthopedics",
    date: "2023-04-13",
    time: "2:15 PM",
    status: "cancelled",
    type: "consultation",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 11,
    patientName: "Sophia Chen",
    patientEmail: "sophia.chen@example.com",
    doctorName: "Dr. Emily Rodriguez",
    doctorSpecialty: "Pediatrics",
    date: "2023-04-14",
    time: "10:30 AM",
    status: "confirmed",
    type: "consultation",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 12,
    patientName: "Michael Johnson",
    patientEmail: "michael.j@example.com",
    doctorName: "Dr. Robert Wilson",
    doctorSpecialty: "Internal Medicine",
    date: "2023-04-14",
    time: "1:00 PM",
    status: "pending",
    type: "follow-up",
    patientAvatar: "/placeholder.svg?height=40&width=40",
    doctorAvatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch appointments data
  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setAppointments(mockAppointments)
      setFilteredAppointments(mockAppointments)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle search and filter
  useEffect(() => {
    let result = appointments

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((appointment) => appointment.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (dateFilter === "today") {
        const todayStr = today.toISOString().split("T")[0]
        result = result.filter((appointment) => appointment.date === todayStr)
      } else if (dateFilter === "tomorrow") {
        const tomorrowStr = tomorrow.toISOString().split("T")[0]
        result = result.filter((appointment) => appointment.date === tomorrowStr)
      } else if (dateFilter === "upcoming") {
        const todayStr = today.toISOString().split("T")[0]
        result = result.filter((appointment) => appointment.date >= todayStr)
      }
    }

    setFilteredAppointments(result)
  }, [searchTerm, statusFilter, dateFilter, appointments])

  // Handle appointment cancellation
  const handleCancelAppointment = () => {
    if (selectedAppointment) {
      // In a real app, this would make an API call to cancel the appointment
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === selectedAppointment.id) {
          return { ...appointment, status: "cancelled" }
        }
        return appointment
      })

      setAppointments(updatedAppointments)
      setFilteredAppointments(
        updatedAppointments.filter((appointment) => {
          let match = true
          if (statusFilter !== "all") {
            match =
              match &&
              (appointment.id === selectedAppointment.id
                ? "cancelled" === statusFilter
                : appointment.status === statusFilter)
          }
          return match
        }),
      )

      setShowCancelModal(false)
      setSelectedAppointment(null)

      // Show success toast
      setSuccessMessage("Appointment has been cancelled successfully.")
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  // Handle appointment deletion
  const handleDeleteAppointment = () => {
    if (selectedAppointment) {
      // In a real app, this would make an API call to delete the appointment
      const updatedAppointments = appointments.filter((appointment) => appointment.id !== selectedAppointment.id)
      setAppointments(updatedAppointments)
      setFilteredAppointments(
        updatedAppointments.filter((appointment) => {
          let match = true
          if (statusFilter !== "all") {
            match = match && appointment.status === statusFilter
          }
          return match
        }),
      )

      setShowDeleteModal(false)
      setSelectedAppointment(null)

      // Show success toast
      setSuccessMessage("Appointment has been deleted successfully.")
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gray-200 h-8 w-64 rounded"></h1>
          <div className="bg-gray-200 h-10 w-32 rounded"></div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 w-full">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="bg-gray-200 h-10 w-full md:w-64 rounded"></div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="bg-gray-200 h-10 w-full md:w-48 rounded"></div>
              <div className="bg-gray-200 h-10 w-full md:w-48 rounded"></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  {[...Array(7)].map((_, i) => (
                    <th key={i} className="py-3 px-4 border-b border-earth-beige">
                      <div className="bg-gray-200 h-6 w-full rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-4 px-4 border-b border-earth-beige">
                        <div className="bg-gray-200 h-6 w-full rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-graphite">Appointments</h1>
        <button
          onClick={() => (window.location.href = "/admin/reports?type=appointments")}
          className="inline-flex items-center px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 w-full">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-1 focus:ring-soft-amber"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <select
                className="w-full pl-10 pr-4 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-1 focus:ring-soft-amber appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
            </div>

            <div className="relative w-full md:w-48">
              <select
                className="w-full pl-10 pr-4 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-1 focus:ring-soft-amber appearance-none"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Patient
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Doctor
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Time
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Status
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-pale-stone/50">
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <div className="flex items-center">
                        <img
                          src={appointment.patientAvatar || "/placeholder.svg"}
                          alt={appointment.patientName}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                          <span className="font-medium text-graphite">{appointment.patientName}</span>
                          <p className="text-xs text-drift-gray">{appointment.patientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <div className="flex items-center">
                        <img
                          src={appointment.doctorAvatar || "/placeholder.svg"}
                          alt={appointment.doctorName}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                          <span className="font-medium text-graphite">{appointment.doctorName}</span>
                          <p className="text-xs text-drift-gray">{appointment.doctorSpecialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-drift-gray" />
                        {formatDate(appointment.date)}
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-drift-gray" />
                        {appointment.time}
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <span className="capitalize text-drift-gray">{appointment.type}</span>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status === "confirmed" ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Confirmed
                          </>
                        ) : appointment.status === "pending" ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Cancelled
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowDetailsModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label="View appointment details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {appointment.status !== "cancelled" && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowCancelModal(true)
                            }}
                            className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                            aria-label="Cancel appointment"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowDeleteModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label="Delete appointment"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-drift-gray border-b border-earth-beige">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-drift-gray">
            Showing <span className="font-medium">{filteredAppointments.length}</span> of{" "}
            <span className="font-medium">{appointments.length}</span> appointments
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90">1</button>
            <button className="px-3 py-1 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone">
              2
            </button>
            <button className="px-3 py-1 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-graphite mb-2">Cancel Appointment</h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to cancel the appointment for {selectedAppointment?.patientName} with{" "}
              {selectedAppointment?.doctorName} on {formatDate(selectedAppointment?.date)} at{" "}
              {selectedAppointment?.time}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelAppointment}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-graphite mb-2">Delete Appointment</h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAppointment}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-graphite">Appointment Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-drift-gray mb-2">Patient Information</h4>
                <div className="flex items-center mb-4">
                  <img
                    src={selectedAppointment.patientAvatar || "/placeholder.svg"}
                    alt={selectedAppointment.patientName}
                    className="h-12 w-12 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-graphite">{selectedAppointment.patientName}</p>
                    <p className="text-sm text-drift-gray">{selectedAppointment.patientEmail}</p>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-drift-gray mb-2">Doctor Information</h4>
                <div className="flex items-center mb-4">
                  <img
                    src={selectedAppointment.doctorAvatar || "/placeholder.svg"}
                    alt={selectedAppointment.doctorName}
                    className="h-12 w-12 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium text-graphite">{selectedAppointment.doctorName}</p>
                    <p className="text-sm text-drift-gray">{selectedAppointment.doctorSpecialty}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-drift-gray mb-2">Appointment Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-soft-amber mr-3" />
                    <div>
                      <p className="font-medium text-graphite">Date</p>
                      <p className="text-sm text-drift-gray">{formatDate(selectedAppointment.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-soft-amber mr-3" />
                    <div>
                      <p className="font-medium text-graphite">Time</p>
                      <p className="text-sm text-drift-gray">{selectedAppointment.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="h-5 w-5 text-soft-amber mr-3" />
                    <div>
                      <p className="font-medium text-graphite">Appointment Type</p>
                      <p className="text-sm text-drift-gray capitalize">{selectedAppointment.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center mr-3 ${
                        selectedAppointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : selectedAppointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedAppointment.status === "confirmed" ? (
                        <Check className="h-3 w-3" />
                      ) : selectedAppointment.status === "pending" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-graphite">Status</p>
                      <p className="text-sm text-drift-gray capitalize">{selectedAppointment.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-earth-beige flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Close
              </button>
              {selectedAppointment.status !== "cancelled" && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowCancelModal(true)
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50">
          <Check className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}
    </div>
  )
}
