"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, Calendar } from "lucide-react"
import { checkPatientConsultation } from "@/lib/prescription-utils"

export function AppointmentCheckModal({ isOpen, onClose, doctorId, patientId, onVerified }) {
  const [loading, setLoading] = useState(true)
  const [hasConsulted, setHasConsulted] = useState(false)
  const [message, setMessage] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      checkConsultation()
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, patientId, doctorId])

  const checkConsultation = async () => {
    if (!doctorId || !patientId) return

    setLoading(true)
    try {
      const result = await checkPatientConsultation(doctorId, patientId)
      setHasConsulted(result.hasConsulted)
      setMessage(result.message)
    } catch (error) {
      console.error("Error checking consultation:", error)
      setHasConsulted(false)
      setMessage("Error verifying patient consultation")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    const backdrop = document.getElementById("appointment-check-backdrop")
    const modalContent = document.getElementById("appointment-check-content")

    if (backdrop) backdrop.style.animation = "fadeOut 0.3s ease-in-out forwards"
    if (modalContent) modalContent.style.animation = "scaleOut 0.3s ease-in-out forwards"

    setTimeout(() => {
      onClose()
    }, 280)
  }

  const handleContinue = () => {
    if (hasConsulted && onVerified) {
      onVerified()
    } else {
      handleClose()
    }
  }

  if (!isOpen && !isVisible) return null

  return (
    <>
      {/* Backdrop with animation */}
      <div
        id="appointment-check-backdrop"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Modal with animation */}
      <div
        id="appointment-check-content"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg"
        style={{ animation: "scaleIn 0.3s ease-in-out" }}
      >
        <div className="flex items-center justify-between border-b border-pale-stone p-4">
          <h2 className="text-xl font-semibold text-graphite">Consultation Check</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-drift-gray transition-colors hover:bg-pale-stone hover:text-soft-amber"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-soft-amber border-t-transparent"></div>
              <span className="ml-3 text-drift-gray">Checking consultation status...</span>
            </div>
          ) : hasConsulted ? (
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
                      You need to have a consultation with this patient before creating a prescription. Please schedule
                      an appointment first.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
            >
              Cancel
            </button>
            {hasConsulted ? (
              <button
                onClick={handleContinue}
                className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
