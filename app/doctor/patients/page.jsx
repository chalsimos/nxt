"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  ChevronRight,
  Users,
  SortDesc,
  Grid,
  List,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getConnectedPatients, getPatientById, getPatientInteractions } from "@/lib/doctor-utils"

export default function PatientsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [sortOption, setSortOption] = useState("name") // 'name', 'recent', 'appointments'

  // Load patients data
  useEffect(() => {
    if (!user) return

    const loadPatients = async () => {
      try {
        setLoading(true)
        // Get connected patients
        const connectedPatientIds = await getConnectedPatients(user.uid)

        // Get patient details
        const patientDetails = await Promise.all(
          connectedPatientIds.map(async (patientId) => {
            const patient = await getPatientById(patientId)
            if (patient) {
              // Get interaction data for each patient
              const interactions = await getPatientInteractions(user.uid, patientId)
              return {
                ...patient,
                interactions,
              }
            }
            return null
          }),
        )

        // Filter out null values (patients that weren't found)
        const validPatients = patientDetails.filter(Boolean)
        setPatients(validPatients)
        setFilteredPatients(validPatients)
        setLoading(false)
      } catch (error) {
        console.error("Error loading patients:", error)
        setLoading(false)
      }
    }

    loadPatients()
  }, [user])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = patients.filter(
        (patient) =>
          patient.displayName?.toLowerCase().includes(query) ||
          patient.email?.toLowerCase().includes(query) ||
          patient.phoneNumber?.toLowerCase().includes(query),
      )
      setFilteredPatients(filtered)
    }
  }, [searchQuery, patients])

  // Handle sort
  useEffect(() => {
    const sorted = [...filteredPatients]

    switch (sortOption) {
      case "name":
        sorted.sort((a, b) => a.displayName?.localeCompare(b.displayName))
        break
      case "recent":
        sorted.sort((a, b) => {
          const dateA = a.interactions?.lastInteraction || new Date(0)
          const dateB = b.interactions?.lastInteraction || new Date(0)
          return dateB - dateA
        })
        break
      case "appointments":
        sorted.sort((a, b) => (b.interactions?.appointments || 0) - (a.interactions?.appointments || 0))
        break
    }

    setFilteredPatients(sorted)
  }, [sortOption, patients, searchQuery])

  // Navigate to patient details
  const handleViewPatient = (patientId) => {
    router.push(`/doctor/patients/${patientId}`)
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return "Never"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber/90 to-amber-500 p-6 shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">My Patients</h1>
              <p className="mt-1 text-amber-50">Manage and view your patient information</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-2 ${
                    viewMode === "grid" ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-md p-2 ${
                    viewMode === "list" ? "bg-white/20 text-white" : "bg-white/10 text-white/70"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-4 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none rounded-md border border-gray-200 bg-white py-2 pl-3 pr-10 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
            >
              <option value="name">Sort by Name</option>
              <option value="recent">Sort by Recent</option>
              <option value="appointments">Sort by Appointments</option>
            </select>
            <SortDesc className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-soft-amber"></div>
            <p className="mt-4 text-drift-gray">Loading patients...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredPatients.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-graphite">No patients found</h3>
          <p className="mt-2 max-w-md text-drift-gray">
            {searchQuery
              ? "No patients match your search criteria. Try a different search term."
              : "You don't have any patients yet. Patients will appear here once they schedule appointments with you."}
          </p>
        </div>
      )}

      {/* Patient grid */}
      {!loading && filteredPatients.length > 0 && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handleViewPatient(patient.id)}
              className="group cursor-pointer rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all hover:border-soft-amber/30 hover:shadow-md"
            >
              <div className="flex items-start space-x-3">
                {patient.photoURL ? (
                  <img
                    src={patient.photoURL || "/placeholder.svg"}
                    alt={patient.displayName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-graphite">{patient.displayName}</h3>
                  <p className="text-sm text-drift-gray">{patient.email}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-soft-amber" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                <div className="flex flex-col items-center rounded-md bg-gray-50 p-2">
                  <div className="flex items-center text-soft-amber">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">{patient.interactions?.appointments || 0}</span>
                  </div>
                  <span className="mt-1 text-xs text-gray-500">Appts</span>
                </div>
                <div className="flex flex-col items-center rounded-md bg-gray-50 p-2">
                  <div className="flex items-center text-soft-amber">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">{patient.interactions?.messages || 0}</span>
                  </div>
                  <span className="mt-1 text-xs text-gray-500">Msgs</span>
                </div>
                <div className="flex flex-col items-center rounded-md bg-gray-50 p-2">
                  <div className="flex items-center text-soft-amber">
                    <FileText className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">{patient.interactions?.records || 0}</span>
                  </div>
                  <span className="mt-1 text-xs text-gray-500">Records</span>
                </div>
              </div>

              <div className="mt-3 flex items-center text-xs text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                <span>Last interaction: {formatDate(patient.interactions?.lastInteraction)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient list */}
      {!loading && filteredPatients.length > 0 && viewMode === "list" && (
        <div className="overflow-hidden rounded-lg border border-pale-stone bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Patient
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Appointments
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Messages
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Records
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Last Interaction
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => handleViewPatient(patient.id)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      {patient.photoURL ? (
                        <img
                          src={patient.photoURL || "/placeholder.svg"}
                          alt={patient.displayName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="font-medium text-graphite">{patient.displayName}</div>
                        <div className="text-sm text-drift-gray">{patient.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-medium text-amber-700">
                      <Calendar className="mr-1 h-3 w-3" />
                      {patient.interactions?.appointments || 0}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {patient.interactions?.messages || 0}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-medium text-green-700">
                      <FileText className="mr-1 h-3 w-3" />
                      {patient.interactions?.records || 0}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(patient.interactions?.lastInteraction)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button className="text-soft-amber hover:text-amber-600">
                      View <span className="sr-only">, {patient.displayName}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
