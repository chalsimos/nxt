"use client"
import { useState, useEffect } from "react"
import { Search, Filter, Eye, Trash2, UserX, Download, X } from "lucide-react"
import Link from "next/link"

// Mock patient data
const mockPatients = [
  {
    id: 1,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "+1 (555) 123-4567",
    lastLogin: "Today, 10:30 AM",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "James Rodriguez",
    email: "james.r@example.com",
    phone: "+1 (555) 234-5678",
    lastLogin: "Yesterday, 3:15 PM",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Sophia Chen",
    email: "sophia.chen@example.com",
    phone: "+1 (555) 345-6789",
    lastLogin: "2 days ago",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Michael Johnson",
    email: "michael.j@example.com",
    phone: "+1 (555) 456-7890",
    lastLogin: "1 week ago",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Olivia Martinez",
    email: "olivia.m@example.com",
    phone: "+1 (555) 567-8901",
    lastLogin: "Today, 9:45 AM",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "William Taylor",
    email: "william.t@example.com",
    phone: "+1 (555) 678-9012",
    lastLogin: "3 days ago",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Ava Brown",
    email: "ava.brown@example.com",
    phone: "+1 (555) 789-0123",
    lastLogin: "Yesterday, 11:20 AM",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Ethan Davis",
    email: "ethan.d@example.com",
    phone: "+1 (555) 890-1234",
    lastLogin: "4 days ago",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)

  // Fetch patients data
  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setPatients(mockPatients)
      setFilteredPatients(mockPatients)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle search and filter
  useEffect(() => {
    let result = patients

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((patient) => patient.status === statusFilter)
    }

    setFilteredPatients(result)
  }, [searchTerm, statusFilter, patients])

  // Handle patient deletion
  const handleDeletePatient = () => {
    if (selectedPatient) {
      const updatedPatients = patients.filter((patient) => patient.id !== selectedPatient.id)
      setPatients(updatedPatients)
      setFilteredPatients(
        updatedPatients.filter((patient) => {
          if (statusFilter !== "all") {
            return patient.status === statusFilter
          }
          return true
        }),
      )
      setShowDeleteModal(false)
      setSelectedPatient(null)
    }
  }

  // Handle patient deactivation
  const handleDeactivatePatient = () => {
    if (selectedPatient) {
      const updatedPatients = patients.map((patient) => {
        if (patient.id === selectedPatient.id) {
          return { ...patient, status: patient.status === "active" ? "inactive" : "active" }
        }
        return patient
      })

      setPatients(updatedPatients)
      setFilteredPatients(
        updatedPatients.filter((patient) => {
          if (statusFilter !== "all") {
            return patient.status === statusFilter
          }
          return true
        }),
      )

      setShowDeactivateModal(false)
      setSelectedPatient(null)
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
            <div className="bg-gray-200 h-10 w-full md:w-48 rounded"></div>
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
        <h1 className="text-2xl font-bold text-graphite">Patients</h1>
        <button
          onClick={() => (window.location.href = "/admin/reports?type=patients")}
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
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-1 focus:ring-soft-amber"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
          </div>

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
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Patient
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Phone
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
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-pale-stone/50">
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <div className="flex items-center">
                        <img
                          src={patient.avatar || "/placeholder.svg"}
                          alt={patient.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <span className="font-medium text-graphite">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">{patient.email}</td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">{patient.phone}</td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">{patient.lastLogin}</td>
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {patient.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowPatientModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label="View patient details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowDeactivateModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label={patient.status === "active" ? "Deactivate patient" : "Activate patient"}
                        >
                          <UserX className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowDeleteModal(true)
                          }}
                          className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
                          aria-label="Delete patient"
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
                    No patients found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-drift-gray">
            Showing <span className="font-medium">{filteredPatients.length}</span> of{" "}
            <span className="font-medium">{patients.length}</span> patients
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-graphite mb-2">Delete Patient</h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to delete {selectedPatient?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
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
              {selectedPatient?.status === "active" ? "Deactivate" : "Activate"} Patient
            </h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to {selectedPatient?.status === "active" ? "deactivate" : "activate"}{" "}
              {selectedPatient?.name}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivatePatient}
                className={`px-4 py-2 text-white rounded-md ${
                  selectedPatient?.status === "active"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {selectedPatient?.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-graphite">Patient Details</h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="p-1 rounded-full hover:bg-pale-stone text-drift-gray"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex flex-col items-center">
                <img
                  src={selectedPatient.avatar || "/placeholder.svg"}
                  alt={selectedPatient.name}
                  className="h-32 w-32 rounded-full mb-4"
                />
                <h4 className="text-lg font-medium text-graphite">{selectedPatient.name}</h4>
                <p className="text-drift-gray">{selectedPatient.email}</p>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPatient.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedPatient.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">Phone</h5>
                    <p className="text-graphite">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">Last Login</h5>
                    <p className="text-graphite">{selectedPatient.lastLogin}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">Date of Birth</h5>
                    <p className="text-graphite">January 15, 1985</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-drift-gray mb-1">Address</h5>
                    <p className="text-graphite">123 Main St, Anytown, CA 12345</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-medium text-drift-gray mb-2">Recent Activity</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-earth-beige">
                      <span className="text-sm text-graphite">Scheduled appointment with Dr. Johnson</span>
                      <span className="text-xs text-drift-gray">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-earth-beige">
                      <span className="text-sm text-graphite">Updated personal information</span>
                      <span className="text-xs text-drift-gray">1 week ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-earth-beige">
                      <span className="text-sm text-graphite">Requested prescription refill</span>
                      <span className="text-xs text-drift-gray">2 weeks ago</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Link
                    href={`/admin/patients/${selectedPatient.id}/records`}
                    className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
                  >
                    View Records
                  </Link>
                  <Link
                    href={`/admin/patients/${selectedPatient.id}/appointments`}
                    className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
                  >
                    View Appointments
                  </Link>
                  <button
                    onClick={() => {
                      setShowPatientModal(false)
                      setShowDeactivateModal(true)
                    }}
                    className={`px-4 py-2 text-white rounded-md ${
                      selectedPatient.status === "active"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {selectedPatient.status === "active" ? "Deactivate" : "Activate"}
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
