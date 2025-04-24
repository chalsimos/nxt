"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react"
import { PrescriptionTemplate } from "@/components/prescription-template"
import { AppointmentCheckModal } from "@/components/appointment-check-modal"
import { SuccessNotification } from "@/components/success-notification"
import { SignaturePad } from "@/components/signature-pad"
import {
  savePrescriptionTemplate,
  generatePrintablePrescription,
  savePrescription,
  getDoctorPatients,
  generatePrescriptionPDF,
} from "@/lib/prescription-utils"
import { useAuth } from "@/contexts/auth-context"

export default function NewPrescriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ message: "", isVisible: false })
  const [showAppointmentCheck, setShowAppointmentCheck] = useState(false)
  const [appointmentVerified, setAppointmentVerified] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [signature, setSignature] = useState(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctorInfo, setDoctorInfo] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    medications: [
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
    notes: "",
    signature: null,
  })

  // Mock medications
  const medicationOptions = [
    "Amoxicillin",
    "Lisinopril",
    "Atorvastatin",
    "Levothyroxine",
    "Metformin",
    "Amlodipine",
    "Metoprolol",
    "Omeprazole",
    "Albuterol",
    "Gabapentin",
  ]

  // Frequency options
  const frequencyOptions = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Weekly",
  ]

  // Duration options
  const durationOptions = [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "30 days",
    "60 days",
    "90 days",
    "6 months",
    "1 year",
    "Indefinite",
  ]

  // Get today's date for min date attribute
  const today = new Date().toISOString().split("T")[0]

  // Load saved templates
  useEffect(() => {
    // In a real app, this would fetch from a database
    // For now, we'll use mock data
    const mockTemplates = [
      {
        id: "template_1",
        name: "Common Cold",
        medications: [
          {
            name: "Paracetamol",
            dosage: "500mg",
            frequency: "Every 6 hours",
            duration: "5 days",
            instructions: "Take as needed for fever or pain",
          },
          {
            name: "Chlorpheniramine",
            dosage: "4mg",
            frequency: "Twice daily",
            duration: "5 days",
            instructions: "May cause drowsiness",
          },
        ],
      },
      {
        id: "template_2",
        name: "Hypertension",
        medications: [
          {
            name: "Amlodipine",
            dosage: "5mg",
            frequency: "Once daily",
            duration: "30 days",
            instructions: "Take in the morning",
          },
        ],
      },
    ]

    // setSavedTemplates(mockTemplates)
  }, [])

  // Fetch doctor info and patients
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setDataLoading(true)
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

        // Get patients
        const result = await getDoctorPatients(user.uid)
        if (result.success) {
          setPatients(result.patients)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Handle patient selection
  const handlePatientChange = (e) => {
    const patientId = e.target.value
    if (patientId) {
      const selectedPatient = patients.find((p) => p.id === patientId)
      if (selectedPatient) {
        setFormData({
          ...formData,
          patientId,
          patientName: selectedPatient.name,
          patientAge: selectedPatient.age,
          patientGender: selectedPatient.gender,
          patientBirthdate: selectedPatient.birthdate,
        })

        // Only show appointment check modal if doctorInfo is available
        if (doctorInfo) {
          setShowAppointmentCheck(true)
        } else {
          // Show notification that doctor info is not available
          setNotification({
            message: "Doctor information is not available. Please try again later.",
            isVisible: true,
          })
        }
      }
    } else {
      setFormData({
        ...formData,
        patientId: "",
        patientName: "",
        patientAge: "",
        patientGender: "",
        patientBirthdate: "",
      })
      setAppointmentVerified(false)
    }
  }

  // Handle medication field changes
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications]
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      medications: updatedMedications,
    })
  }

  // Add a new medication
  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    })
  }

  // Remove a medication
  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = [...formData.medications]
      updatedMedications.splice(index, 1)
      setFormData({
        ...formData,
        medications: updatedMedications,
      })
    }
  }

  // Handle signature change
  const handleSignatureChange = (signatureData) => {
    setFormData({
      ...formData,
      signature: signatureData,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!appointmentVerified) {
      setNotification({
        message: "Please verify patient consultation before creating a prescription",
        isVisible: true,
      })
      return
    }

    if (!formData.signature) {
      setNotification({
        message: "Please add your signature before creating a prescription",
        isVisible: true,
      })
      return
    }

    if (!doctorInfo) {
      setNotification({
        message: "Doctor information is not available",
        isVisible: true,
      })
      return
    }

    setLoading(true)

    try {
      // Prepare prescription data
      const prescriptionData = {
        ...formData,
        doctorId: user.uid,
        doctorName: doctorInfo.name,
        doctorSpecialty: doctorInfo.specialty,
        doctorLicenseNumber: doctorInfo.licenseNumber,
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        // Calculate end date based on the longest medication duration
        // This is a simplification - in a real app you might want to handle this differently
        endDate: calculateEndDate(formData.medications),
      }

      // Save prescription to database
      const result = await savePrescription(prescriptionData)

      if (!result.success) {
        throw new Error(result.message || "Failed to save prescription")
      }

      // If saving as template
      if (saveAsTemplate && templateName) {
        await savePrescriptionTemplate(
          {
            name: templateName,
            medications: formData.medications,
          },
          user.uid,
        )
      }

      // Show success notification
      setNotification({
        message: "Prescription created successfully",
        isVisible: true,
      })

      // Reset form after successful save
      setFormData({
        patientId: "",
        patientName: "",
        patientAge: "",
        patientGender: "",
        medications: [
          {
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
          },
        ],
        notes: "",
        signature: null,
      })
      setAppointmentVerified(false)
      setSaveAsTemplate(false)
      setTemplateName("")

      // Just show success notification, don't show template modal
      setTimeout(() => {
        router.push("/doctor/prescriptions")
      }, 1500)
    } catch (error) {
      console.error("Error saving prescription:", error)
      setNotification({
        message: `Error creating prescription: ${error.message}`,
        isVisible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to calculate end date based on medication duration
  const calculateEndDate = (medications) => {
    const today = new Date()
    let maxDays = 0

    medications.forEach((med) => {
      const duration = med.duration || ""

      // Extract number of days from duration string
      let days = 0
      if (duration.includes("day")) {
        days = Number.parseInt(duration.match(/\d+/)?.[0] || "0")
      } else if (duration.includes("week")) {
        days = Number.parseInt(duration.match(/\d+/)?.[0] || "0") * 7
      } else if (duration.includes("month")) {
        days = Number.parseInt(duration.match(/\d+/)?.[0] || "0") * 30
      } else if (duration.includes("year")) {
        days = Number.parseInt(duration.match(/\d+/)?.[0] || "0") * 365
      }

      maxDays = Math.max(maxDays, days)
    })

    if (maxDays === 0) {
      // Default to 30 days if no valid duration found
      maxDays = 30
    }

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + maxDays)
    return endDate.toISOString().split("T")[0]
  }

  // Handle print preview
  const handlePrintPreview = () => {
    try {
      // Generate printable prescription
      const printWindow = generatePrintablePrescription(
        {
          medications: formData.medications,
          signature: formData.signature,
        },
        doctorInfo,
        {
          name: formData.patientName,
          age: formData.patientAge,
          gender: formData.patientGender,
        },
      )

      // Trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } catch (error) {
      console.error("Error generating print preview:", error)
      setNotification({
        message: "Error generating print preview",
        isVisible: true,
      })
    }
  }

  // Handle PDF download
  const handleDownloadPDF = () => {
    try {
      if (!formData.patientName || !doctorInfo) {
        setNotification({
          message: "Missing patient or doctor information",
          isVisible: true,
        })
        return
      }

      // Generate PDF
      const doc = generatePrescriptionPDF(
        {
          medications: formData.medications,
          signature: formData.signature,
        },
        doctorInfo,
        {
          name: formData.patientName,
          age: formData.patientAge,
          gender: formData.patientGender,
        },
      )

      // Save the PDF
      doc.save(
        `prescription_${formData.patientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
      )

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

  // Handle template save
  const handleSaveTemplate = (template) => {
    // Update form data with template
    setFormData({
      ...formData,
      medications: template.medications,
      signature: template.signature || formData.signature,
    })

    setShowTemplateModal(false)

    // Redirect after successful save
    setTimeout(() => {
      router.push("/doctor/prescriptions")
    }, 1000)
  }

  // Check if form is valid
  const isFormValid = () => {
    if (!formData.patientId) return false

    // Check if all medications have required fields
    return formData.medications.every((med) => med.name && med.dosage && med.frequency && med.duration)
  }

  // Helper function to format date
  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString(undefined, options)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {dataLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-soft-amber border-t-transparent"></div>
          <span className="ml-2 text-graphite">Loading doctor information...</span>
        </div>
      )}
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber/90 to-amber-500 p-6 shadow-md">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">New Prescription</h1>
            <p className="mt-1 text-amber-50">Create a new prescription for your patient</p>
          </div>

          <Link
            href="/doctor/prescriptions"
            className="mt-4 inline-flex items-center rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-white/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 md:mt-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prescriptions
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="rounded-lg border border-earth-beige bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-graphite">Patient Information</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-graphite">
                      Select Patient <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="patientId"
                      value={formData.patientId}
                      onChange={handlePatientChange}
                      className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                      required
                    >
                      <option value="">Select a patient</option>
                      {patients.map((patient, index) =>
                        patient && patient.id ? (
                          <option key={`patient-${patient.id}-${index}`} value={patient.id}>
                            {patient.name}
                          </option>
                        ) : null,
                      )}
                    </select>
                  </div>
                </div>

                {formData.patientId && (
                  <div className="mt-4 grid grid-cols-1 gap-4 rounded-md bg-pale-stone/50 p-4 sm:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-xs text-drift-gray">Patient Name</p>
                        <p className="font-medium text-graphite">{formData.patientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-xs text-drift-gray">Age</p>
                        <p className="font-medium text-graphite">{formData.patientAge} years</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-soft-amber" />
                      <div>
                        <p className="text-xs text-drift-gray">Gender</p>
                        <p className="font-medium text-graphite">{formData.patientGender}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="rounded-lg border border-earth-beige bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-graphite">Medications</h2>
                <button
                  type="button"
                  onClick={addMedication}
                  className="inline-flex items-center rounded-md bg-soft-amber px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-6">
                {formData.medications.map((medication, index) => (
                  <div key={index} className="rounded-lg border border-earth-beige p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium text-graphite">Medication #{index + 1}</h3>
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-graphite"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`medication-${index}`} className="block text-sm font-medium text-graphite">
                          Medication Name <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`medication-${index}`}
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                          className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                          required
                        >
                          <option value="">Select medication</option>
                          {medicationOptions.map((med) => (
                            <option key={med} value={med}>
                              {med}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`dosage-${index}`} className="block text-sm font-medium text-graphite">
                          Dosage <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`dosage-${index}`}
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                          className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`frequency-${index}`} className="block text-sm font-medium text-graphite">
                          Frequency <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`frequency-${index}`}
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                          className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                          required
                        >
                          <option value="">Select frequency</option>
                          {frequencyOptions.map((freq) => (
                            <option key={freq} value={freq}>
                              {freq}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`duration-${index}`} className="block text-sm font-medium text-graphite">
                          Duration <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`duration-${index}`}
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, "duration", e.target.value)}
                          className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                          required
                        >
                          <option value="">Select duration</option>
                          {durationOptions.map((dur) => (
                            <option key={dur} value={dur}>
                              {dur}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor={`instructions-${index}`} className="block text-sm font-medium text-graphite">
                          Instructions
                        </label>
                        <textarea
                          id={`instructions-${index}`}
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, "instructions", e.target.value)}
                          rows={2}
                          className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor's Signature */}
            <div className="rounded-lg border border-earth-beige bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-graphite">
                Doctor's Signature <span className="text-red-500">*</span>
              </h2>
              <p className="mb-4 text-sm text-drift-gray">Please sign below to authorize this prescription</p>

              <SignaturePad onChange={handleSignatureChange} initialSignature={formData.signature} />
            </div>

            {/* Additional Notes */}
            <div className="rounded-lg border border-earth-beige bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-graphite">Additional Notes</h2>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-graphite">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                />
              </div>
            </div>

            {/* Save as Template */}
            <div className="rounded-lg border border-earth-beige bg-white p-6 shadow-sm">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="saveAsTemplate"
                    type="checkbox"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="h-4 w-4 rounded border-earth-beige text-soft-amber focus:ring-soft-amber"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="saveAsTemplate" className="text-sm font-medium text-graphite">
                    Save as Template
                  </label>
                  <p className="text-xs text-drift-gray">Save this prescription as a template for future use</p>
                </div>
              </div>

              {saveAsTemplate && (
                <div className="mt-4">
                  <label htmlFor="templateName" className="block text-sm font-medium text-graphite">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-earth-beige bg-white py-2 px-3 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                    required={saveAsTemplate}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap justify-end gap-3">
              <Link
                href="/doctor/prescriptions"
                className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={!isFormValid() || !appointmentVerified || !formData.signature}
                className="inline-flex items-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || loading || !appointmentVerified || !formData.signature}
                className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Prescription
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Consultation Status */}
          <div className="rounded-lg border border-earth-beige bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-graphite">Consultation Status</h2>

            {!formData.patientId ? (
              <div className="rounded-lg bg-pale-stone/50 p-4 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-drift-gray" />
                <p className="text-sm text-drift-gray">Select a patient to check consultation status</p>
              </div>
            ) : appointmentVerified ? (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Consultation Verified</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>You have consulted with this patient. You can proceed with creating a prescription.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Consultation Required</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        You need to have a consultation with this patient before creating a prescription. Please
                        schedule an appointment first.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prescription Preview */}
          {formData.patientId && (
            <div className="rounded-lg border border-earth-beige bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-graphite">Prescription Preview</h2>
              <p className="mb-4 text-sm text-drift-gray">Live preview of your prescription</p>

              <div className="mb-6 overflow-hidden rounded-lg border border-earth-beige bg-white shadow-sm">
                <div className="p-6">
                  <div className="relative border-b border-gray-300 pb-4 text-center">
                    <div className="absolute left-0 top-0 text-2xl font-bold italic text-soft-amber">Rx</div>
                    <div className="doctor-info">
                      <div className="text-lg font-bold">Dr. {doctorInfo?.name || "Doctor Name"}</div>
                      <div className="text-sm">
                        {doctorInfo?.specialty || "Specialty"} | PRC #{doctorInfo?.licenseNumber || "License"}
                      </div>
                      <div className="text-sm">{doctorInfo?.clinicAddress || "Clinic Address"}</div>
                      <div className="text-sm">Contact No.: {doctorInfo?.contactNumber || "Contact Number"}</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div>Date: {formatDate(new Date())}</div>
                    <div>Patient Name: {formData.patientName || "_______________________"}</div>
                    <div>
                      Age: {formData.patientAge || "____"} &nbsp;&nbsp; Sex: {formData.patientGender || "____"}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-lg font-bold text-soft-amber">Rx:</div>

                    <div className="mt-2 space-y-4">
                      {formData.medications && formData.medications.length > 0 ? (
                        formData.medications.map((med, index) => (
                          <div key={index} className="ml-4">
                            <div>
                              <span className="font-bold">{index + 1}.</span> {med.name || "(No medication name)"}
                            </div>
                            <div className="ml-4">
                              {med.dosage || "(No dosage)"}, {med.frequency || "(No frequency)"},{" "}
                              {med.duration || "(No duration)"}
                            </div>
                            {med.instructions && (
                              <div className="ml-4 italic text-drift-gray">({med.instructions})</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="ml-4 text-drift-gray italic">(No medications added yet)</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-10 space-y-1 pt-10">
                    {formData.signature ? (
                      <div className="mb-2">
                        <img
                          src={formData.signature || "/placeholder.svg"}
                          alt="Doctor's Signature"
                          className="max-h-20"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 border-b border-gray-400 w-48"></div>
                    )}
                    <div>Dr. {doctorInfo?.name || "Doctor Name"}</div>
                    <div>License No.: PRC {doctorInfo?.licenseNumber || "License Number"}</div>
                    <div>PTR No.: {doctorInfo?.ptrNumber || "PTR Number"}</div>
                    <div>S2 No.: {doctorInfo?.s2Number || "S2 Number"}</div>
                  </div>

                  <div className="mt-8 border-t border-gray-300 pt-2 text-center text-xs text-gray-500">
                    This prescription is electronically generated via Smart Care Health System
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Check Modal */}
      {doctorInfo && showAppointmentCheck && (
        <AppointmentCheckModal
          isOpen={showAppointmentCheck}
          onClose={() => setShowAppointmentCheck(false)}
          doctorId={doctorInfo.id}
          patientId={formData.patientId}
          onVerified={() => {
            setAppointmentVerified(true)
            setShowAppointmentCheck(false)
          }}
        />
      )}

      {/* Prescription Template Modal */}
      {doctorInfo && showTemplateModal && (
        <PrescriptionTemplate
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          prescription={{
            medications: formData.medications,
            signature: formData.signature,
          }}
          doctorInfo={doctorInfo}
          patientInfo={{
            name: formData.patientName,
            age: formData.patientAge,
            gender: formData.patientGender,
          }}
          onSave={handleSaveTemplate}
          onPrint={handlePrintPreview}
          isEditable={false}
        />
      )}

      {/* Success Notification */}
      <SuccessNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  )
}
