"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  FileText,
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  Stethoscope,
  Activity,
  Pill,
  ChevronRight,
  CalendarDays,
  MessageCircle,
  FileIcon,
  Shield,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPatientById, getPatientInteractions } from "@/lib/doctor-utils"
// Import the AppointmentHistory component
import { AppointmentHistory } from "@/components/appointment-history"

export default function PatientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [interactions, setInteractions] = useState({
    appointments: 0,
    messages: 0,
    records: 0,
    lastInteraction: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  // Add state for activeTab
  const [activeTab, setActiveTab] = useState("profile") // "profile" or "appointments"

  // Get patient ID from URL
  const patientId = params.id

  // Load patient data
  useEffect(() => {
    if (!user || !patientId) return

    // Update the loadPatient function to properly handle the phone number
    const loadPatient = async () => {
      setLoading(true)
      setError("")

      try {
        // Get patient data
        const patientData = await getPatientById(patientId)

        if (!patientData) {
          setError("Patient not found.")
          setLoading(false)
          return
        }

        // Log the patient data to verify we're getting the phone number
        console.log("Patient data:", patientData)

        setPatient(patientData)

        // Get interaction data
        const interactionData = await getPatientInteractions(user.uid, patientId)
        setInteractions(interactionData)

        setLoading(false)
      } catch (error) {
        console.error("Error loading patient:", error)
        setError("Failed to load patient information. Please try again.")
        setLoading(false)
      }
    }

    loadPatient()
  }, [user, patientId])

  // Navigate to appointments page
  const handleViewAppointments = () => {
    router.push(`/doctor/patients/${patientId}/appointments`)
  }

  // Navigate to messages page
  const handleViewMessages = () => {
    router.push(`/doctor/chat?patientId=${patientId}`)
  }

  // Navigate to records page
  const handleViewRecords = () => {
    router.push(`/doctor/patients/${patientId}/records`)
  }

  // Navigate to prescriptions page
  const handleViewPrescriptions = () => {
    router.push(`/doctor/patients/${patientId}/prescriptions`)
  }

  // Navigate back to patients list
  const handleBackToPatients = () => {
    router.push("/doctor/patients")
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber/90 to-amber-500 p-6 shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10"></div>

        <div className="relative z-10">
          <button
            onClick={handleBackToPatients}
            className="mb-4 inline-flex items-center rounded-md bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/30"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Patients
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              {!loading && patient && patient.photoURL ? (
                <img
                  src={patient.photoURL || "/placeholder.svg"}
                  alt={patient.displayName}
                  className="mr-4 h-16 w-16 rounded-full border-2 border-white/50 object-cover"
                />
              ) : !loading && patient ? (
                <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
                  <User className="h-8 w-8" />
                </div>
              ) : (
                <div className="mr-4 h-16 w-16 animate-pulse rounded-full bg-white/20"></div>
              )}

              <div>
                {loading ? (
                  <>
                    <div className="h-7 w-48 animate-pulse rounded-md bg-white/20 mb-2"></div>
                    <div className="h-5 w-32 animate-pulse rounded-md bg-white/20"></div>
                  </>
                ) : patient ? (
                  <>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">{patient.displayName}</h1>
                    <p className="mt-1 text-amber-50">Patient Profile</p>
                  </>
                ) : (
                  <h1 className="text-2xl font-bold text-white md:text-3xl">Patient Not Found</h1>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        // Loading state
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-amber mb-4"></div>
            <p className="text-drift-gray">Loading patient information...</p>
          </div>
        </div>
      ) : error ? (
        // Error state
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleBackToPatients}
            className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm border border-red-200 transition-colors hover:bg-red-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </button>
        </div>
      ) : patient ? (
        <>
          {/* Enhanced tab controls with switch-like appearance */}
          <div className="flex justify-center mb-6 mt-8">
            <div className="flex p-1 bg-earth-beige/20 rounded-full shadow-sm">
              <button
                onClick={() => setActiveTab("profile")}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === "profile" ? "bg-soft-amber text-white shadow-sm" : "text-drift-gray hover:text-graphite"
                }`}
              >
                <span className="relative z-10">Patient Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  activeTab === "appointments"
                    ? "bg-soft-amber text-white shadow-sm"
                    : "text-drift-gray hover:text-graphite"
                }`}
              >
                <span className="relative z-10">Appointment History</span>
              </button>
            </div>
          </div>

          {/* Conditional rendering based on active tab */}
          {activeTab === "profile" ? (
            <>
              {/* Patient Information */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Contact Information */}
                <div className="rounded-lg border border-pale-stone bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30">
                  <h2 className="mb-4 text-lg font-semibold text-graphite">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <User className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Full Name</p>
                        <p className="text-drift-gray">{patient.displayName}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Email</p>
                        <p className="text-drift-gray">{patient.email || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Phone</p>
                        <p className="text-drift-gray">{patient.phoneNumber || patient.phone || "Not provided"}</p>
                      </div>
                    </div>
                    {patient.address && (
                      <div className="flex items-start">
                        <MapPin className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                        <div>
                          <p className="text-sm font-medium text-graphite">Address</p>
                          <p className="text-drift-gray">{patient.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="rounded-lg border border-pale-stone bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30">
                  <h2 className="mb-4 text-lg font-semibold text-graphite">Medical Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Date of Birth</p>
                        <p className="text-drift-gray">
                          {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Activity className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Blood Type</p>
                        <p className="text-drift-gray">{patient.bloodType || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Stethoscope className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Allergies</p>
                        <p className="text-drift-gray">{patient.allergies || "None reported"}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Pill className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Current Medications</p>
                        <p className="text-drift-gray">{patient.medications || "None reported"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interaction Summary */}
                <div className="rounded-lg border border-pale-stone bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30">
                  <h2 className="mb-4 text-lg font-semibold text-graphite">Interaction Summary</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CalendarDays className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Appointments</p>
                        <p className="text-drift-gray">{interactions.appointments} total</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MessageCircle className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Messages</p>
                        <p className="text-drift-gray">{interactions.messages} total</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileIcon className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Medical Records</p>
                        <p className="text-drift-gray">{interactions.records} total</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Last Interaction</p>
                        <p className="text-drift-gray">
                          {interactions.lastInteraction
                            ? formatDate(interactions.lastInteraction)
                            : "No interactions yet"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="mr-3 mt-0.5 h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-sm font-medium text-graphite">Records Access</p>
                        <p className="text-drift-gray">
                          Patient must explicitly share medical records with you to view them
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={handleViewAppointments}
                  className="group flex items-center justify-between rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30"
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber group-hover:bg-soft-amber/20">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-graphite">Appointments</h3>
                      <p className="text-sm text-drift-gray">View history</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-drift-gray group-hover:text-soft-amber transition-colors" />
                </button>

                <button
                  onClick={handleViewMessages}
                  className="group flex items-center justify-between rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30"
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber group-hover:bg-soft-amber/20">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-graphite">Messages</h3>
                      <p className="text-sm text-drift-gray">Chat history</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-drift-gray group-hover:text-soft-amber transition-colors" />
                </button>

                <button
                  onClick={handleViewRecords}
                  className="group flex items-center justify-between rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30"
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber group-hover:bg-soft-amber/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-graphite">Medical Records</h3>
                      <p className="text-sm text-drift-gray">View shared records</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-drift-gray group-hover:text-soft-amber transition-colors" />
                </button>

                <button
                  onClick={handleViewPrescriptions}
                  className="group flex items-center justify-between rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-soft-amber/30"
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber group-hover:bg-soft-amber/20">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-graphite">Prescriptions</h3>
                      <p className="text-sm text-drift-gray">Manage prescriptions</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-drift-gray group-hover:text-soft-amber transition-colors" />
                </button>
              </div>
            </>
          ) : (
            // Appointment History Tab Content
            <AppointmentHistory userId={patientId} viewMode="doctor" doctorId={user?.uid} />
          )}
        </>
      ) : (
        // Not found
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-800">Patient Not Found</h3>
          <p className="text-red-600">The patient you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleBackToPatients}
            className="mt-4 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm border border-red-200 transition-colors hover:bg-red-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </button>
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
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
