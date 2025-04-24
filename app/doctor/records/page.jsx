"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Search,
  Eye,
  User,
  Calendar,
  Clock,
  Tag,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileTextIcon,
  SlidersHorizontal,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getAllPatientsMedicalRecords, getMedicalRecordById } from "@/lib/record-utils"
import { getUserById } from "@/lib/firebase-utils"
import { PatientRecordModal } from "@/components/patient-record-modal"
import { RecordNoteModal } from "@/components/record-note-modal"
import { SuccessNotification } from "@/components/success-notification"
import NoRecordsAnimation from "@/components/no-records-animation"

export default function DoctorRecordsPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [patientNames, setPatientNames] = useState({})
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [fullRecordData, setFullRecordData] = useState(null)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterPatient, setFilterPatient] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [filterDate, setFilterDate] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    let unsubscribe = () => {}

    const fetchRecords = async () => {
      if (user && user.uid) {
        unsubscribe = getAllPatientsMedicalRecords(user.uid, (data) => {
          setRecords(data)
          setLoading(false)

          // Fetch patient names for all records
          const patientIds = [...new Set(data.map((record) => record.patientId))]
          fetchPatientNames(patientIds)
        })
      }
    }

    fetchRecords()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

  // Show success message with auto-hide
  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
        setSuccessMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const fetchPatientNames = async (patientIds) => {
    const names = { ...patientNames }

    for (const id of patientIds) {
      if (!names[id]) {
        try {
          const patient = await getUserById(id)
          names[id] = patient.name || patient.displayName || "Unknown Patient"
        } catch (error) {
          console.error(`Error fetching patient ${id}:`, error)
          names[id] = "Unknown Patient"
        }
      }
    }

    setPatientNames(names)
  }

  // Get unique record types for filter
  const recordTypes = [...new Set(records.map((record) => record.type))]

  // Filter records based on search, type, patient, and date
  const filteredRecords = records
    .filter((record) => {
      // Filter by search term
      const matchesSearch =
        record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientNames[record.patientId]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filter by type
      const matchesType = filterType === "all" || record.type === filterType

      // Filter by patient
      const matchesPatient = filterPatient === "all" || record.patientId === filterPatient

      // Filter by date
      const matchesDate = !filterDate || new Date(record.date).toISOString().split("T")[0] === filterDate

      return matchesSearch && matchesType && matchesPatient && matchesDate
    })
    .sort((a, b) => {
      // Sort by uploadedDate (most recent first)
      const dateA = new Date(a.uploadedDate)
      const dateB = new Date(b.uploadedDate)
      return dateB - dateA
    })

  // Handle viewing a record
  const handleViewRecord = async (record) => {
    try {
      setLoadingRecord(true)
      setError("")

      // Get the full record data including file data
      const fullRecord = await getMedicalRecordById(record.id)
      setFullRecordData(fullRecord)
      setSelectedRecord(record)
      setShowNoteModal(false)
    } catch (error) {
      console.error("Error loading record:", error)
      setError("Failed to load record. Please try again.")
    } finally {
      setLoadingRecord(false)
    }
  }

  const handleAddNote = (record) => {
    setSelectedRecord(record)
    setShowNoteModal(true)
  }

  const handleCloseModal = () => {
    setSelectedRecord(null)
    setFullRecordData(null)
  }

  const handleCloseNoteModal = () => {
    setShowNoteModal(false)
    setSelectedRecord(null)
  }

  const handleNoteSuccess = () => {
    setSuccessMessage("Note added successfully")
    setShowNoteModal(false)
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown"
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FileTextIcon className="h-10 w-10 text-drift-gray" />
    if (fileType.startsWith("image/")) return <FileImage className="h-10 w-10 text-soft-amber" />
    if (fileType === "application/pdf") return <FilePdf className="h-10 w-10 text-red-500" />
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return <FileSpreadsheet className="h-10 w-10 text-green-600" />
    return <FileTextIcon className="h-10 w-10 text-blue-500" />
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setFilterPatient("all")
    setFilterDate("")
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-soft-amber mb-4"></div>
          <p className="text-drift-gray">Loading shared records...</p>
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

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Shared Medical Records</h1>
          <p className="mt-1 text-amber-50">View and manage medical records shared by your patients</p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{records.length}</div>
              <div className="text-xs text-amber-50">Total Records</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{Object.keys(patientNames).length}</div>
              <div className="text-xs text-amber-50">Patients</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">{recordTypes.length}</div>
              <div className="text-xs text-amber-50">Record Types</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {
                  records.filter((r) => {
                    const date = new Date(r.uploadedDate)
                    const now = new Date()
                    const diffTime = Math.abs(now - date)
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays <= 7
                  }).length
                }
              </div>
              <div className="text-xs text-amber-50">Recent (7 days)</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 animate-slideInDown">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <SuccessNotification message={successMessage} isVisible={showSuccess} onClose={() => setShowSuccess(false)} />
      )}

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
          <input
            type="text"
            placeholder="Search records by name, type, or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="inline-flex items-center rounded-md border border-earth-beige bg-white px-3 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
          >
            {viewMode === "grid" ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                List View
              </>
            ) : (
              <>
                <div className="mr-2 grid grid-cols-2 gap-0.5">
                  <div className="h-1.5 w-1.5 rounded-sm bg-graphite"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-graphite"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-graphite"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-graphite"></div>
                </div>
                Grid View
              </>
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center rounded-md border border-earth-beige bg-white px-3 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {(filterType !== "all" || filterPatient !== "all" || filterDate) && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-soft-amber text-xs text-white">
                {(filterType !== "all" ? 1 : 0) + (filterPatient !== "all" ? 1 : 0) + (filterDate ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg border border-earth-beige bg-white p-4 shadow-sm animate-slideDown">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-end sm:space-x-4 sm:space-y-0">
            <div className="flex-1 space-y-2">
              <label htmlFor="filterType" className="text-sm font-medium text-graphite">
                Record Type
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              >
                <option value="all">All Types</option>
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
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
                {Object.entries(patientNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 space-y-2">
              <label htmlFor="filterDate" className="text-sm font-medium text-graphite">
                Record Date
              </label>
              <input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              ></input>
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

      {filteredRecords.length > 0 ? (
        viewMode === "grid" ? (
          // Grid view
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
            {filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className="group overflow-hidden rounded-lg border border-pale-stone bg-white shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  opacity: 0,
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-pale-stone">
                  {record.thumbnail && record.fileType.startsWith("image/") ? (
                    <img
                      src={record.thumbnail || "/placeholder.svg"}
                      alt={record.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-center">
                        {getFileIcon(record.fileType)}
                        <div className="mt-2 text-sm font-medium text-drift-gray">
                          {record.fileType ? record.fileType.split("/")[1].toUpperCase() : "Unknown"}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      onClick={() => handleViewRecord(record)}
                      className="rounded-full bg-white p-2 text-soft-amber shadow-md transition-transform hover:scale-105 hover:bg-soft-amber hover:text-white"
                      title="View Record"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </button>
                    <button
                      onClick={() => handleAddNote(record)}
                      className="ml-2 rounded-full bg-white p-2 text-blue-500 shadow-md transition-transform hover:scale-105 hover:bg-blue-500 hover:text-white"
                      title="Add Note"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Add Note</span>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-graphite line-clamp-1">{record.name}</h3>
                      <div className="mt-1 flex items-center">
                        <span className="inline-flex items-center rounded-full bg-soft-amber/10 px-2.5 py-0.5 text-xs font-medium text-soft-amber">
                          {record.type}
                        </span>
                        <span className="ml-2 text-xs text-drift-gray">{formatFileSize(record.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-drift-gray">
                    <User className="mr-1 h-3 w-3" />
                    <span className="font-medium text-graphite">{patientNames[record.patientId] || "Unknown"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-drift-gray">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    {record.doctorNotes && record.doctorNotes.length > 0 && (
                      <div className="flex items-center text-blue-500">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        <span>{record.doctorNotes.length} notes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div className="space-y-3 animate-fadeIn">
            {filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className="overflow-hidden rounded-lg border border-pale-stone bg-white shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  opacity: 0,
                }}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="flex h-24 w-full items-center justify-center bg-pale-stone/30 sm:w-24">
                    {record.thumbnail && record.fileType.startsWith("image/") ? (
                      <img
                        src={record.thumbnail || "/placeholder.svg"}
                        alt={record.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {getFileIcon(record.fileType)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2">
                      <h3 className="font-medium text-graphite">{record.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-soft-amber/10 px-2.5 py-0.5 text-xs font-medium text-soft-amber">
                          {record.type}
                        </span>
                        <span className="flex items-center text-xs text-drift-gray">
                          <User className="mr-1 h-3 w-3" />
                          {patientNames[record.patientId] || "Unknown"}
                        </span>
                        <span className="flex items-center text-xs text-drift-gray">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center text-xs text-drift-gray">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(record.uploadedDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center text-xs text-drift-gray">
                          <Tag className="mr-1 h-3 w-3" />
                          {formatFileSize(record.fileSize)}
                        </span>
                        {record.doctorNotes && record.doctorNotes.length > 0 && (
                          <span className="flex items-center text-xs text-blue-500">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {record.doctorNotes.length} notes
                          </span>
                        )}
                      </div>
                    </div>
                    {record.notes && <p className="text-sm text-drift-gray line-clamp-1">{record.notes}</p>}
                    <div className="mt-auto flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => handleViewRecord(record)}
                        className="rounded-md border border-earth-beige bg-white px-3 py-1 text-xs font-medium text-graphite transition-colors hover:bg-pale-stone"
                      >
                        <Eye className="mr-1 inline-block h-3 w-3" />
                        View
                      </button>
                      <button
                        onClick={() => handleAddNote(record)}
                        className="rounded-md border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <MessageSquare className="mr-1 inline-block h-3 w-3" />
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-lg border border-pale-stone bg-white p-8 text-center shadow-sm animate-fadeIn">
          <NoRecordsAnimation />
          <h3 className="mb-1 text-lg font-medium text-graphite">No Records Found</h3>
          <p className="mb-4 text-drift-gray">
            {searchTerm || filterType !== "all" || filterPatient !== "all" || filterDate
              ? "No records match your search criteria. Try adjusting your filters."
              : "No patients have shared medical records with you yet."}
          </p>
        </div>
      )}

      {/* Record View Modal */}
      {selectedRecord && !showNoteModal && (
        <PatientRecordModal
          isOpen={!!selectedRecord && !showNoteModal}
          onClose={handleCloseModal}
          record={fullRecordData || selectedRecord}
          loading={loadingRecord}
          showDoctorNotes={true}
        />
      )}

      {/* Add Note Modal */}
      {selectedRecord && showNoteModal && (
        <RecordNoteModal isOpen={showNoteModal} onClose={handleCloseNoteModal} record={selectedRecord} />
      )}

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
        
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
