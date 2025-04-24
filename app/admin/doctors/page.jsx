"use client"
import { useState, useEffect } from "react"
import { Search, Filter, Eye, Trash2, UserX, Download, Calendar, X } from "lucide-react"
import Link from "next/link"

// Mock doctor data
const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    lastLogin: "Today, 10:30 AM",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    email: "michael.chen@example.com",
    phone: "+1 (555) 234-5678",
    lastLogin: "Yesterday, 3:15 PM",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    email: "emily.r@example.com",
    phone: "+1 (555) 345-6789",
    lastLogin: "2 days ago",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Dr. David Kim",
    specialty: "Orthopedics",
    email: "david.kim@example.com",
    phone: "+1 (555) 456-7890",
    lastLogin: "1 week ago",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Dr. Jessica Patel",
    specialty: "Dermatology",
    email: "jessica.p@example.com",
    phone: "+1 (555) 567-8901",
    lastLogin: "Today, 9:45 AM",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Dr. Robert Wilson",
    specialty: "Internal Medicine",
    email: "robert.w@example.com",
    phone: "+1 (555) 678-9012",
    lastLogin: "3 days ago",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)

  // Get unique specialties for filter
  const specialties = [...new Set(mockDoctors.map((doctor) => doctor.specialty))]

  // Fetch doctors data
  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setDoctors(mockDoctors)
      setFilteredDoctors(mockDoctors)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle search and filter
  useEffect(() => {
    let result = doctors

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((doctor) => doctor.status === statusFilter)
    }

    // Apply specialty filter
    if (specialtyFilter !== "all") {
      result = result.filter((doctor) => doctor.specialty === specialtyFilter)
    }

    setFilteredDoctors(result)
  }, [searchTerm, statusFilter, specialtyFilter, doctors])

  // Handle doctor deletion
  const handleDeleteDoctor = () => {
    if (selectedDoctor) {
      const updatedDoctors = doctors.filter((doctor) => doctor.id !== selectedDoctor.id)
      setDoctors(updatedDoctors)
      setFilteredDoctors(
        updatedDoctors.filter((doctor) => {
          let match = true
          if (statusFilter !== "all") {
            match = match && doctor.status === statusFilter
          }
          if (specialtyFilter !== "all") {
            match = match && doctor.specialty === specialtyFilter
          }
          return match
        }),
      )
      setShowDeleteModal(false)
      setSelectedDoctor(null)
    }
  }

  // Handle doctor deactivation
  const handleDeactivateDoctor = () => {
    if (selectedDoctor) {
      const updatedDoctors = doctors.map((doctor) => {
        if (doctor.id === selectedDoctor.id) {
          return { ...doctor, status: doctor.status === "active" ? "inactive" : "active" }
        }
        return doctor
      })

      setDoctors(updatedDoctors)
      setFilteredDoctors(
        updatedDoctors.filter((doctor) => {
          let match = true
          if (statusFilter !== "all") {
            match = match && doctor.status === statusFilter
          }
          if (specialtyFilter !== "all") {
            match = match && doctor.specialty === specialtyFilter
          }
          return match
        }),
      )

      setShowDeactivateModal(false)
      setSelectedDoctor(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gray-200 h-8 w-48 rounded"></h1>
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
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="py-3 px-4 border-b border-earth-beige">
                      <div className="bg-gray-200 h-6 w-full rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
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
        <h1 className="text-2xl font-bold text-graphite">Doctors</h1>
        <button
          onClick={() => (window.location.href = "/admin/reports?type=doctors")}
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
              placeholder="Search doctors..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
            </div>

            <div className="relative w-full md:w-48">
              <select
                className="w-full pl-10 pr-4 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-1 focus:ring-soft-amber appearance-none"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="all">All Specialties</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Doctor
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Specialty
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Last Login
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
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-pale-stone/50">
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <div className="flex items-center">
                        <img
                          src={doctor.avatar || "/placeholder.svg"}
                          alt={doctor.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <span className="font-medium text-graphite">{doctor.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">{doctor.specialty}</td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">{doctor.email}</td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">{doctor.lastLogin}</td>
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          doctor.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doctor.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor)
                            setShowDoctorModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label="View doctor details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor)
                            setShowDeactivateModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label={doctor.status === "active" ? "Deactivate doctor" : "Activate doctor"}
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor)
                            setShowDeleteModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label="Delete doctor"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-drift-gray border-b border-earth-beige">
                    No doctors found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-drift-gray">
            Showing <span className="font-medium">{filteredDoctors.length}</span> of{" "}
            <span className="font-medium">{doctors.length}</span> doctors
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
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-graphite mb-2">Delete Doctor</h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to delete {selectedDoctor?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDoctor}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-graphite mb-2">
              {selectedDoctor?.status === "active" ? "Deactivate" : "Activate"} Doctor
            </h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to {selectedDoctor?.status === "active" ? "deactivate" : "activate"}{" "}
              {selectedDoctor?.name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateDoctor}
                className={`px-4 py-2 text-white rounded-md ${
                  selectedDoctor?.status === "active"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {selectedDoctor?.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showDoctorModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-graphite">Doctor Details</h3>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex flex-col items-center">
                <img
                  src={selectedDoctor.avatar || "/placeholder.svg"}
                  alt={selectedDoctor.name}
                  className="h-32 w-32 rounded-full mb-4"
                />
                <h4 className="text-lg font-medium text-graphite">{selectedDoctor.name}</h4>
                <p className="text-drift-gray">{selectedDoctor.specialty}</p>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedDoctor.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedDoctor.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">Email</h5>
                    <p className="text-graphite">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">Phone</h5>
                    <p className="text-graphite">{selectedDoctor.phone}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">Last Login</h5>
                    <p className="text-graphite">{selectedDoctor.lastLogin}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">License Number</h5>
                    <p className="text-graphite">MD12345678</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-medium text-drift-gray mb-2">Upcoming Appointments</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-earth-beige">
                      <div>
                        <span className="text-sm font-medium text-graphite">Emma Wilson</span>
                        <p className="text-xs text-drift-gray">Consultation</p>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-drift-gray mr-1" />
                        <span className="text-xs text-drift-gray">Tomorrow, 10:00 AM</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-earth-beige">
                      <div>
                        <span className="text-sm font-medium text-graphite">James Rodriguez</span>
                        <p className="text-xs text-drift-gray">Follow-up</p>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-drift-gray mr-1" />
                        <span className="text-xs text-drift-gray">Tomorrow, 2:30 PM</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-earth-beige">
                      <div>
                        <span className="text-sm font-medium text-graphite">Sophia Chen</span>
                        <p className="text-xs text-drift-gray">New Patient</p>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-drift-gray mr-1" />
                        <span className="text-xs text-drift-gray">Friday, 11:15 AM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Link
                    href={`/admin/doctors/${selectedDoctor.id}/schedule`}
                    className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
                  >
                    View Schedule
                  </Link>
                  <Link
                    href={`/admin/doctors/${selectedDoctor.id}/patients`}
                    className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
                  >
                    View Patients
                  </Link>
                  <button
                    onClick={() => {
                      setShowDoctorModal(false)
                      setShowDeactivateModal(true)
                    }}
                    className={`px-4 py-2 text-white rounded-md ${
                      selectedDoctor.status === "active"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {selectedDoctor.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
