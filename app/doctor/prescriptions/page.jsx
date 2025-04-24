"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  User,
  LayoutGrid,
  LayoutList,
  FileText,
  CheckCircle2,
  Pill,
  Repeat,
  Calendar,
  AlertCircle,
  SlidersHorizontal,
  Download,
} from "lucide-react"
import { SuccessNotification } from "@/components/success-notification"
import { PrescriptionEditModal } from "@/components/prescription-edit-modal"
import { PrescriptionDetailModal } from "@/components/prescription-detail-modal"
import { getDoctorPrescriptions, updatePrescription, deletePrescription } from "@/lib/prescription-utils"
import { useAuth } from "@/contexts/auth-context"
import { generatePrescriptionPDF } from "@/lib/pdf-utils"

export default function DoctorPrescriptionsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPatient, setFilterPatient] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [notification, setNotification] = useState({ message: "", isVisible: false })
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentPrescription, setCurrentPrescription] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState("list") // 'list' or 'grid'
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [doctorInfo, setDoctorInfo] = useState(null)

  // Fetch doctor info and prescriptions
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get doctor profile
        const { getUserProfile } = await import("@/lib/firebase-utils")
        const doctorData = await getUserProfile(user.uid)

        if (doctorData) {
          setDoctorInfo({
            id: user.uid,
            name: doctorData.displayName || user.displayName || "Doctor",
            specialty: doctorData.specialty || "General Practitioner",
            licenseNumber: doctorData.licenseNumber || "N/A",
            clinicAddress: doctorData.officeAddress || "N/A",
            contactNumber: doctorData.phone || "N/A",
            ptrNumber: doctorData.ptrNumber || "N/A",
            s2Number: doctorData.s2Number || "N/A",
          })
        }

        // Get prescriptions
        const result = await getDoctorPrescriptions(user.uid)
        if (result.success) {
          // Process prescriptions to ensure they have the right format
          const processedPrescriptions = result.prescriptions.map((prescription) => {
            // Convert Firestore timestamp to Date if needed
            const startDate =
              prescription.startDate ||
              (prescription.createdAt ? new Date(prescription.createdAt.seconds * 1000) : new Date())
                .toISOString()
                .split("T")[0]

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
              startDate,
              medications,
              patient: prescription.patientName || "Unknown Patient",
              medication: medications[0]?.name || "Unknown medication",
              dosage: medications[0]?.dosage || "N/A",
              frequency: medications[0]?.frequency || "N/A",
              notes: prescription.notes || medications[0]?.instructions || "",
              status: prescription.status || "active",
            }
          })

          setPrescriptions(processedPrescriptions)

          // Extract unique patients from prescriptions
          const uniquePatients = Array.from(
            new Map(
              processedPrescriptions.map((p) => [
                p.patientId,
                {
                  id: p.patientId,
                  name: p.patientName || "Unknown Patient",
                },
              ]),
            ).values(),
          )

          setPatients(uniquePatients)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Filter prescriptions
  const filteredPrescriptions = prescriptions
    .filter((prescription) => {
      // Filter by search term
      const matchesSearch =
        (prescription.patientName || prescription.patient || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.medication || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.notes || "").toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by status
      const matchesStatus = filterStatus === "all" || prescription.status === filterStatus

      // Filter by patient
      const matchesPatient = filterPatient === "all" || prescription.patientId === filterPatient

      return matchesSearch && matchesStatus && matchesPatient
    })
    .sort((a, b) => {
      // Sort by date (most recent first)
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.startDate || 0)
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.startDate || 0)
      return dateB - dateA
    })

  // Handle prescription renewal
  const handleRenewPrescription = async (prescription) => {
    // Create a new prescription based on the old one
    const today = new Date()
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(today.getMonth() + 6)

    const newPrescription = {
      ...prescription,
      id: undefined, // Remove the id so a new one is generated
      startDate: today.toISOString().split("T")[0],
      endDate: sixMonthsLater.toISOString().split("T")[0],
      status: "active",
      createdAt: new Date(),
    }

    try {
      // Save to Firestore
      const { savePrescription } = await import("@/lib/prescription-utils")
      const result = await savePrescription(newPrescription)

      if (result.success) {
        // Add the new prescription to the local state
        setPrescriptions([
          {
            ...newPrescription,
            id: result.prescriptionId,
          },
          ...prescriptions,
        ])

        // Show success notification
        setNotification({
          message: `Prescription for ${prescription.medication} renewed successfully`,
          isVisible: true,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error renewing prescription:", error)
      setNotification({
        message: `Error renewing prescription: ${error.message}`,
        isVisible: true,
      })
    }
  }

  // Handle prescription PDF download
  const handlePrintPrescription = (prescription) => {
    try {
      // Find the patient
      const patient = {
        name: prescription.patientName || prescription.patient,
        age: prescription.patientAge || "N/A",
        gender: prescription.patientGender || "N/A",
        birthdate: prescription.patientBirthdate,
      }

      if (!doctorInfo) {
        throw new Error("Doctor information not available")
      }

      // Generate PDF
      const doc = generatePrescriptionPDF(prescription, doctorInfo, patient)

      // Save the PDF
      doc.save(`prescription_${patient.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)

      setNotification({
        message: `Prescription for ${prescription.medication} downloaded successfully`,
        isVisible: true,
      })
    } catch (error) {
      console.error("Error generating or downloading prescription:", error)
      setNotification({
        message: `Error downloading prescription: ${error.message}`,
        isVisible: true,
      })
    }
  }

  // Handle opening the edit modal
  const handleEditPrescription = (prescription) => {
    setCurrentPrescription(prescription)
    setEditModalOpen(true)
  }

  // Handle saving edited prescription
  const handleSavePrescription = async (updatedPrescription) => {
    try {
      const result = await updatePrescription(updatedPrescription.id, updatedPrescription)

      if (result.success) {
        setPrescriptions(prescriptions.map((p) => (p.id === updatedPrescription.id ? updatedPrescription : p)))
        setNotification({
          message: `Prescription for ${updatedPrescription.medication} updated successfully`,
          isVisible: true,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error updating prescription:", error)
      setNotification({
        message: `Error updating prescription: ${error.message}`,
        isVisible: true,
      })
    }
  }

  // Handle deleting prescription
  const handleDeletePrescription = async (id) => {
    try {
      const result = await deletePrescription(id)

      if (result.success) {
        setPrescriptions(prescriptions.filter((p) => p.id !== id))
        setNotification({
          message: "Prescription deleted successfully",
          isVisible: true,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error deleting prescription:", error)
      setNotification({
        message: `Error deleting prescription: ${error.message}`,
        isVisible: true,
      })
    }
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "grid" : "list")
  }

  // Handle viewing prescription details
  const handleViewPrescription = (prescription) => {
    setCurrentPrescription(prescription)
    setDetailModalOpen(true)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterPatient("all")
  }

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
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

  const renderGridPrescription = (prescriptions, status) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prescriptions
          .filter((p) => p.status === status)
          .map((prescription, index) => {
            const statusInfo = getStatusInfo(status)

            return (
              <div
                key={prescription.id}
                className={`group overflow-hidden rounded-lg border-l-4 ${
                  status === "active"
                    ? "border-l-green-400"
                    : status === "expired"
                      ? "border-l-amber-400"
                      : "border-l-blue-400"
                } border border-pale-stone bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30 ${
                  status === "active" ? "" : "opacity-90 hover:opacity-100"
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  opacity: 0,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center">
                      <Pill className={`mr-2 h-5 w-5 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`} />
                      <h3 className="font-medium text-graphite">{prescription.medication}</h3>
                      <span
                        className={`ml-2 rounded-full ${statusInfo.color} px-2.5 py-0.5 text-xs font-medium ${statusInfo.textColor}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-drift-gray">{prescription.dosage}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                      <User className={`mr-2 h-4 w-4 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`} />
                      <span className="text-sm text-graphite">{prescription.patient}</span>
                    </div>
                    <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                      <Repeat
                        className={`mr-2 h-4 w-4 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`}
                      />
                      <span className="text-sm text-graphite">{prescription.frequency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center rounded-md bg-pale-stone px-3 py-1 mb-3 w-fit">
                  <Calendar className={`mr-2 h-4 w-4 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`} />
                  <span className="text-sm text-graphite">
                    {new Date(prescription.startDate).toLocaleDateString()} -
                    {prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : "No end date"}
                  </span>
                </div>

                {prescription.notes && (
                  <div className="mt-3 rounded-md bg-pale-stone/50 p-2">
                    <p className="text-sm text-drift-gray">
                      <span className="font-medium">Notes:</span> {prescription.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleViewPrescription(prescription)}
                    className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditPrescription(prescription)}
                    className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
                  >
                    Edit
                  </button>
                  {status === "expired" && (
                    <button
                      onClick={() => handleRenewPrescription(prescription)}
                      className="rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                    >
                      Renew
                    </button>
                  )}
                  {status === "active" && (
                    <button
                      onClick={() => handlePrintPrescription(prescription)}
                      className="rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                    >
                      Download PDF
                      <Download className="ml-2 h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    )
  }

  const renderListView = (prescriptions, status) => {
    return (
      <div className="space-y-4">
        {prescriptions
          .filter((p) => p.status === status)
          .map((prescription, index) => {
            const statusInfo = getStatusInfo(status)

            return (
              <div
                key={prescription.id}
                className={`group overflow-hidden rounded-lg border-l-4 ${
                  status === "active"
                    ? "border-l-green-400"
                    : status === "expired"
                      ? "border-l-amber-400"
                      : "border-l-blue-400"
                } border border-pale-stone bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30 ${
                  status === "active" ? "" : "opacity-80 hover:opacity-100"
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  opacity: 0,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center">
                      <Pill className={`mr-2 h-5 w-5 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`} />
                      <h3 className="font-medium text-graphite">{prescription.medication}</h3>
                      <span
                        className={`ml-2 rounded-full ${statusInfo.color} px-2.5 py-0.5 text-xs font-medium ${statusInfo.textColor}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-drift-gray">{prescription.dosage}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                      <User className={`mr-2 h-4 w-4 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`} />
                      <span className="text-sm text-graphite">{prescription.patient}</span>
                    </div>
                    <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                      <Calendar
                        className={`mr-2 h-4 w-4 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`}
                      />
                      <span className="text-sm text-graphite">
                        {new Date(prescription.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center rounded-md bg-pale-stone px-3 py-1">
                      <Repeat
                        className={`mr-2 h-4 w-4 ${status === "active" ? "text-soft-amber" : "text-drift-gray"}`}
                      />
                      <span className="text-sm text-graphite">{prescription.frequency}</span>
                    </div>
                  </div>
                </div>
                {prescription.notes && (
                  <div className="mt-3 rounded-md bg-pale-stone/50 p-2">
                    <p className="text-sm text-drift-gray">
                      <span className="font-medium">Notes:</span> {prescription.notes}
                    </p>
                  </div>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleViewPrescription(prescription)}
                    className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditPrescription(prescription)}
                    className="rounded-md border border-earth-beige bg-white px-3 py-1 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
                  >
                    Edit
                  </button>
                  {status === "expired" && (
                    <button
                      onClick={() => handleRenewPrescription(prescription)}
                      className="rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                    >
                      Renew
                    </button>
                  )}
                  {status === "active" && (
                    <button
                      onClick={() => handlePrintPrescription(prescription)}
                      className="rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                    >
                      Download PDF
                      <Download className="ml-2 h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
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
            <h1 className="text-2xl font-bold text-white md:text-3xl">Prescriptions</h1>
            <p className="mt-1 text-amber-50">Manage your patient prescriptions</p>
          </div>

          <Link
            href="/doctor/prescriptions/new"
            className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-soft-amber shadow-sm transition-all hover:bg-amber-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 md:mt-0 animate-fadeIn"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Link>
        </div>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
          <input
            type="text"
            placeholder="Search by patient, medication, or notes..."
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
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="completed">Completed</option>
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
                  <option key={patient.id} value={patient.id.toString()}>
                    {patient.name}
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

      <div className="space-y-6">
        {filteredPrescriptions.length > 0 ? (
          <>
            {/* Active Prescriptions */}
            {filteredPrescriptions.some((p) => p.status === "active") && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-graphite">Active Prescriptions</h2>
                {viewMode === "list"
                  ? renderListView(filteredPrescriptions, "active")
                  : renderGridPrescription(filteredPrescriptions, "active")}
              </div>
            )}

            {/* Expired Prescriptions */}
            {filteredPrescriptions.some((p) => p.status === "expired") && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-graphite">Expired Prescriptions</h2>
                {viewMode === "list"
                  ? renderListView(filteredPrescriptions, "expired")
                  : renderGridPrescription(filteredPrescriptions, "expired")}
              </div>
            )}

            {/* Completed Prescriptions */}
            {filteredPrescriptions.some((p) => p.status === "completed") && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold text-graphite">Completed Prescriptions</h2>
                {viewMode === "list"
                  ? renderListView(filteredPrescriptions, "completed")
                  : renderGridPrescription(filteredPrescriptions, "completed")}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-pale-stone bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pale-stone">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-drift-gray"
              >
                <path d="M8 21h8a2 2 0 0 0 2-2v-2H6v2a2 2 0 0 0 2 2Z" />
                <path d="M19 7v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7" />
                <path d="M21 10V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2l3 3h12l3-3Z" />
                <path d="M10 2v4" />
                <path d="M14 2v4" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-medium text-graphite">No Prescriptions Found</h3>
            <p className="mb-4 text-drift-gray">
              {searchTerm || filterStatus !== "all" || filterPatient !== "all"
                ? "No prescriptions match your search criteria. Try adjusting your filters."
                : "You haven't created any prescriptions yet. Create your first prescription now."}
            </p>
            <Link
              href="/doctor/prescriptions/new"
              className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
            >
              Create Prescription
            </Link>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <PrescriptionDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        prescription={currentPrescription}
        onEdit={handleEditPrescription}
        onDownload={handlePrintPrescription}
      />

      {/* Edit/Delete Modal */}
      <PrescriptionEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        prescription={currentPrescription}
        onSave={handleSavePrescription}
        onDelete={handleDeletePrescription}
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
;<style jsx global>{`
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
  
  @keyframes scaleUp {
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
  
  .animate-scaleUp {
    animation: scaleUp 0.3s ease-out;
  }
`}</style>
