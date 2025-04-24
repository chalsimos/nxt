"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Pill, Calendar, Download, User, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { getPatientPrescriptions, generatePrintablePrescription } from "@/lib/prescription-utils"
import { generatePrescriptionPDF } from "@/lib/pdf-utils"
import { PrescriptionDetailModal } from "@/components/prescription-detail-modal"
import { SuccessNotification } from "@/components/success-notification"
import { useAuth } from "@/contexts/auth-context"

export default function PatientPrescriptionsPage() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [notification, setNotification] = useState({ message: "", isVisible: false })
  const [patientInfo, setPatientInfo] = useState(null)

  // Fetch patient info and prescriptions
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get patient profile
        const { getUserProfile } = await import("@/lib/firebase-utils")
        const userData = await getUserProfile(user.uid)

        if (userData) {
          setPatientInfo({
            id: user.uid,
            name: userData.displayName || user.displayName || "Patient",
            age: userData.age || calculateAge(userData.dateOfBirth) || "N/A",
            gender: userData.gender || "Not specified",
            dateOfBirth: userData.dateOfBirth,
          })
        }

        // Get prescriptions
        const result = await getPatientPrescriptions(user.uid)
        if (result.success) {
          // Process prescriptions to ensure they have the right format
          const processedPrescriptions = result.prescriptions.map((prescription) => {
            // Convert Firestore timestamp to Date if needed
            const createdAt = prescription.createdAt?.seconds
              ? new Date(prescription.createdAt.seconds * 1000)
              : new Date()

            // Ensure medications is an array
            const medications = prescription.medications || [
              {
                name: prescription.medication || "Unknown medication",
                dosage: prescription.dosage || "N/A",
                frequency: prescription.frequency || "N/A",
                duration: prescription.duration || "N/A",
                instructions: prescription.notes || "",
              },
            ]

            return {
              ...prescription,
              createdAt,
              medications,
              status: prescription.status || "active",
            }
          })

          setPrescriptions(processedPrescriptions)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Add the calculateAge function if it's not already imported
  const calculateAge = (birthdate) => {
    if (!birthdate) return null

    const today = new Date()
    const birthDate = new Date(birthdate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    // Filter by search term
    const matchesSearch =
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications.some(
        (med) =>
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.instructions?.toLowerCase().includes(searchTerm.toLowerCase()),
      )

    // Filter by status
    const matchesStatus = filterStatus === "all" || prescription.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Handle prescription view
  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setShowPrescriptionModal(true)
  }

  // Handle prescription download/print
  const handlePrintPrescription = (prescription) => {
    try {
      // Generate printable prescription
      const printWindow = generatePrintablePrescription(
        prescription,
        {
          name: prescription.doctorName,
          specialty: "General Practitioner", // In a real app, this would come from the prescription data
          licenseNumber: "1234567",
          clinicAddress: "123 Health St., Quezon City, Philippines",
          contactNumber: "(02) 1234-5678",
          ptrNumber: "2025-0001234",
          s2Number: "S2-123456",
        },
        patientInfo,
      )

      // Trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)

      setNotification({
        message: "Prescription ready to print",
        isVisible: true,
      })
    } catch (error) {
      console.error("Error generating print preview:", error)
      setNotification({
        message: "Error generating print preview",
        isVisible: true,
      })
    }
  }

  // Handle PDF download
  const handleDownloadPDF = (prescription) => {
    try {
      // Generate PDF
      const doc = generatePrescriptionPDF(
        prescription,
        {
          name: prescription.doctorName,
          specialty: "General Practitioner", // In a real app, this would come from the prescription data
          licenseNumber: "1234567",
          clinicAddress: "123 Health St., Quezon City, Philippines",
          contactNumber: "(02) 1234-5678",
          ptrNumber: "2025-0001234",
          s2Number: "S2-123456",
        },
        patientInfo,
      )

      // Save the PDF
      doc.save(`prescription_${patientInfo.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)

      setNotification({
        message: "PDF downloaded successfully",
        isVisible: true,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      setNotification({
        message: "Error generating PDF",
        isVisible: true,
      })
    }
  }

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          label: "Active",
        }
      case "expired":
        return {
          icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
          color: "bg-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-200",
          label: "Expired",
        }
      case "completed":
        return {
          icon: <FileText className="h-4 w-4 text-blue-600" />,
          color: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          label: "Completed",
        }
      default:
        return {
          icon: <FileText className="h-4 w-4 text-gray-600" />,
          color: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          label: "Unknown",
        }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber/90 to-amber-500 p-6 shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10"></div>

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white md:text-3xl">My Prescriptions</h1>
          <p className="mt-1 text-amber-50">View and download your prescriptions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
          <input
            type="text"
            placeholder="Search by doctor or medication..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {filterStatus !== "all" && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-soft-amber text-xs text-white">
              1
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
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
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              onClick={() => setFilterStatus("all")}
              className="inline-flex items-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-soft-amber border-t-transparent"></div>
            <span className="ml-3 text-drift-gray">Loading prescriptions...</span>
          </div>
        ) : filteredPrescriptions.length > 0 ? (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => {
              const statusInfo = getStatusInfo(prescription.status)
              const date = new Date(prescription.createdAt)
              const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })

              return (
                <div
                  key={prescription.id}
                  className="overflow-hidden rounded-lg border border-l-4 border-l-soft-amber border-earth-beige bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-3 sm:mb-0">
                      <div className="flex items-center">
                        <Pill className="mr-2 h-5 w-5 text-soft-amber" />
                        <h3 className="font-medium text-graphite">
                          {prescription.medications[0].name}
                          {prescription.medications.length > 1 && ` + ${prescription.medications.length - 1} more`}
                        </h3>
                        <span
                          className={`ml-2 rounded-full ${statusInfo.color} px-2.5 py-0.5 text-xs font-medium ${statusInfo.textColor}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-drift-gray">
                        {prescription.medications[0].dosage}, {prescription.medications[0].frequency}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                        <User className="mr-2 h-4 w-4 text-soft-amber" />
                        <span className="text-sm text-graphite">{prescription.doctorName}</span>
                      </div>
                      <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                        <Calendar className="mr-2 h-4 w-4 text-soft-amber" />
                        <span className="text-sm text-graphite">{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewPrescription(prescription)}
                      className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(prescription)}
                      className="inline-flex items-center rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                    >
                      Download PDF
                      <Download className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-pale-stone bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pale-stone">
              <FileText className="h-8 w-8 text-drift-gray" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-graphite">No Prescriptions Found</h3>
            <p className="mb-4 text-drift-gray">
              {searchTerm || filterStatus !== "all"
                ? "No prescriptions match your search criteria. Try adjusting your filters."
                : "You don't have any prescriptions yet."}
            </p>
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      <PrescriptionDetailModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        prescription={selectedPrescription}
        onEdit={() => {}} // Not editable by patients
        onDownload={() => selectedPrescription && handleDownloadPDF(selectedPrescription)}
      />

      {/* Success Notification */}
      <SuccessNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  )
}
