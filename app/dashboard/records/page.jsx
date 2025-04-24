"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Search,
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Clock,
  Tag,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileTextIcon,
  SlidersHorizontal,
  Share2,
  Users,
} from "lucide-react"
import { PatientRecordModal } from "@/components/patient-record-modal"
import { UploadMedicalRecordModal } from "@/components/upload-medical-record-modal"
import { ShareRecordModal } from "@/components/share-record-modal"
import { useAuth } from "@/contexts/auth-context"
import { getPatientMedicalRecords, getMedicalRecordById, deleteMedicalRecord } from "@/lib/record-utils"
import { SuccessNotification } from "@/components/success-notification"
import { AppointmentHistory } from "@/components/appointment-history"

export default function PatientRecordsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [medicalRecords, setMedicalRecords] = useState([])
  const [fullRecordData, setFullRecordData] = useState(null)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [filterDate, setFilterDate] = useState("")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [activeTab, setActiveTab] = useState("records")

  // Load medical records
  useEffect(() => {
    if (!user) return

    try {
      // Get patient's medical records
      const unsubscribe = getPatientMedicalRecords(user.uid, (recordsData) => {
        setMedicalRecords(recordsData)
        setLoading(false)
      })

      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe()
        }
      }
    } catch (error) {
      console.error("Error loading medical records:", error)
      setError("Failed to load medical records. Please try again.")
      setLoading(false)
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

  // Get unique record types for filter
  const recordTypes = [...new Set(medicalRecords.map((record) => record.type))]

  // Filter records based on search and type
  const filteredRecords = medicalRecords
    .filter((record) => {
      // Filter by search term
      const matchesSearch =
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filter by type
      const matchesType = filterType === "all" || record.type === filterType

      // Filter by date
      const matchesDate = !filterDate || new Date(record.date).toISOString().split("T")[0] === filterDate

      return matchesSearch && matchesType && matchesDate
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
      setShowRecordModal(true)
    } catch (error) {
      console.error("Error loading record:", error)
      setError("Failed to load record. Please try again.")
    } finally {
      setLoadingRecord(false)
    }
  }

  // Handle sharing a record
  const handleShareRecord = (record) => {
    setSelectedRecord(record)
    setShowShareModal(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = (record) => {
    setRecordToDelete(record)
    setShowDeleteConfirm(true)
  }

  // Handle delete record
  const handleDeleteRecord = async () => {
    if (!recordToDelete) return

    try {
      setDeleting(true)
      await deleteMedicalRecord(recordToDelete.id)
      setShowDeleteConfirm(false)
      setRecordToDelete(null)
      setSuccessMessage("Record deleted successfully")
    } catch (error) {
      console.error("Error deleting record:", error)
      setError("Failed to delete record. Please try again.")
    } finally {
      setDeleting(false)
    }
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

  // Handle upload success
  const handleUploadSuccess = () => {
    setSuccessMessage("Record uploaded successfully")
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setFilterDate("")
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber/90 to-amber-500 p-6 shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Medical Records</h1>
            <p className="mt-1 text-amber-50">Manage and organize your health documents</p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-soft-amber shadow-sm transition-all hover:bg-amber-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 md:mt-0 animate-fadeIn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Record
          </button>
        </div>
      </div>

      {/* Enhanced tab controls with switch-like appearance */}
      <div className="flex justify-center mb-6">
        <div className="flex p-1 bg-earth-beige/20 rounded-full shadow-sm">
          <button
            onClick={() => setActiveTab("records")}
            className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === "records" ? "bg-soft-amber text-white shadow-sm" : "text-drift-gray hover:text-graphite"
            }`}
          >
            <span className="relative z-10">Medical Records</span>
            {activeTab === "records" && medicalRecords.length > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white text-soft-amber text-xs w-5 h-5 rounded-full">
                {medicalRecords.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              activeTab === "history" ? "bg-soft-amber text-white shadow-sm" : "text-drift-gray hover:text-graphite"
            }`}
          >
            <span className="relative z-10">Appointment History</span>
          </button>
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

      {activeTab === "records" ? (
        <>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
              <input
                type="text"
                placeholder="Search records by name or type..."
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
                {(filterType !== "all" || filterDate) && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-soft-amber text-xs text-white">
                    {(filterType !== "all" ? 1 : 0) + (filterDate ? 1 : 0)}
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

          {loading ? (
            // Loading state
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-amber mb-4"></div>
                <p className="text-drift-gray">Loading your records...</p>
              </div>
            </div>
          ) : filteredRecords.length > 0 ? (
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
                          onClick={() => handleShareRecord(record)}
                          className="ml-2 rounded-full bg-white p-2 text-blue-500 shadow-md transition-transform hover:scale-105 hover:bg-blue-500 hover:text-white"
                          title="Share Record"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Share</span>
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(record)}
                          className="ml-2 rounded-full bg-white p-2 text-red-500 shadow-md transition-transform hover:scale-105 hover:bg-red-500 hover:text-white"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
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
                      <div className="mt-3 flex items-center justify-between text-xs text-drift-gray">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        {record.sharedWith && record.sharedWith.length > 0 && (
                          <div className="flex items-center text-blue-500">
                            <Users className="mr-1 h-3 w-3" />
                            <span>
                              Shared with {record.sharedWith.length}{" "}
                              {record.sharedWith.length === 1 ? "doctor" : "doctors"}
                            </span>
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
                            {record.sharedWith && record.sharedWith.length > 0 && (
                              <span className="flex items-center text-xs text-blue-500">
                                <Users className="mr-1 h-3 w-3" />
                                Shared with {record.sharedWith.length}
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
                            onClick={() => handleShareRecord(record)}
                            className="rounded-md border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                          >
                            <Share2 className="mr-1 inline-block h-3 w-3" />
                            Share
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(record)}
                            className="rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="mr-1 inline-block h-3 w-3" />
                            Delete
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pale-stone">
                <FileText className="h-8 w-8 text-drift-gray" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-graphite">No Records Found</h3>
              <p className="mb-4 text-drift-gray">
                {searchTerm || filterType !== "all" || filterDate
                  ? "No records match your search criteria. Try adjusting your filters."
                  : "You haven't uploaded any medical records yet."}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First Record
              </button>
            </div>
          )}
        </>
      ) : (
        // Appointment History Tab Content
        <AppointmentHistory userId={user?.uid} />
      )}

      {/* Record View Modal */}
      <PatientRecordModal
        isOpen={showRecordModal}
        onClose={() => {
          setShowRecordModal(false)
          setFullRecordData(null)
        }}
        record={fullRecordData || selectedRecord}
        loading={loadingRecord}
        showDoctorNotes={true}
      />

      {/* Upload Record Modal */}
      <UploadMedicalRecordModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        userId={user?.uid}
        onSuccess={handleUploadSuccess}
      />

      {/* Share Record Modal */}
      <ShareRecordModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} record={selectedRecord} />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg animate-scaleIn">
            <h3 className="mb-4 text-lg font-medium text-graphite">Delete Record</h3>
            <p className="mb-4 text-drift-gray">
              Are you sure you want to delete "{recordToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setRecordToDelete(null)
                }}
                className="rounded-md border border-earth-beige px-4 py-2 text-sm font-medium text-graphite hover:bg-pale-stone"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecord}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
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
