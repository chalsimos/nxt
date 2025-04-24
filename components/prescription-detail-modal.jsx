"use client"

import { useEffect, useState } from "react"
import { Download, User, X } from "lucide-react"

export function PrescriptionDetailModal({ isOpen, onClose, prescription, onEdit, onDownload }) {
  const [isVisible, setIsVisible] = useState(false)

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen && !isVisible) return null

  // Handle closing with animation
  const handleClose = () => {
    const backdrop = document.getElementById("prescription-detail-modal-backdrop")
    const modalContent = document.getElementById("prescription-detail-modal-content")

    if (backdrop) backdrop.style.animation = "fadeOut 0.3s ease-in-out forwards"
    if (modalContent) modalContent.style.animation = "scaleOut 0.3s ease-in-out forwards"

    setTimeout(() => {
      onClose()
    }, 280)
  }

  if (!prescription) return null

  // Update the handleDownload function in the component
  const handleDownload = () => {
    if (onDownload) {
      onDownload(prescription)
    }
  }

  return (
    <>
      {/* Backdrop with animation */}
      <div
        id="prescription-detail-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Modal with animation */}
      <div
        id="prescription-detail-modal-content"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
        style={{ animation: "scaleIn 0.3s ease-in-out" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-graphite">Prescription Details</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-drift-gray transition-colors duration-200 hover:bg-pale-stone hover:text-soft-amber"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-pale-stone">
              <User className="h-full w-full p-2 text-drift-gray" />
            </div>
            <div>
              <p className="font-medium text-graphite">{prescription.patient || prescription.patientName}</p>
            </div>
          </div>

          <div className="rounded-lg border border-pale-stone bg-pale-stone/30 p-4">
            {prescription.medications && prescription.medications.length > 0 ? (
              <div className="space-y-4">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="border-b border-pale-stone pb-3 last:border-0 last:pb-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-drift-gray">Medication</p>
                        <p className="font-medium text-graphite">{med.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-drift-gray">Dosage</p>
                        <p className="font-medium text-graphite">{med.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-drift-gray">Frequency</p>
                        <p className="font-medium text-graphite">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-drift-gray">Duration</p>
                        <p className="font-medium text-graphite">{med.duration}</p>
                      </div>
                    </div>
                    {med.instructions && (
                      <div className="mt-2">
                        <p className="text-sm text-drift-gray">Instructions</p>
                        <p className="text-graphite">{med.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-drift-gray">Medication</p>
                  <p className="font-medium text-graphite">{prescription.medication}</p>
                </div>
                <div>
                  <p className="text-sm text-drift-gray">Dosage</p>
                  <p className="font-medium text-graphite">{prescription.dosage}</p>
                </div>
                <div>
                  <p className="text-sm text-drift-gray">Frequency</p>
                  <p className="font-medium text-graphite">{prescription.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-drift-gray">Status</p>
                  <p className="font-medium capitalize text-graphite">{prescription.status}</p>
                </div>
                <div>
                  <p className="text-sm text-drift-gray">Start Date</p>
                  <p className="font-medium text-graphite">{new Date(prescription.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-drift-gray">End Date</p>
                  <p className="font-medium text-graphite">
                    {prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : "No end date"}
                  </p>
                </div>
              </div>
            )}

            {prescription.notes && (
              <div className="mt-4">
                <p className="text-sm text-drift-gray">Notes</p>
                <p className="text-graphite">{prescription.notes}</p>
              </div>
            )}

            {prescription.signature && (
              <div className="mt-4">
                <p className="text-sm text-drift-gray">Doctor's Signature</p>
                <img
                  src={prescription.signature || "/placeholder.svg"}
                  alt="Doctor's Signature"
                  className="mt-1 max-h-16"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(prescription)
                  handleClose()
                }}
                className="inline-flex items-center rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                Edit
              </button>
            )}
            <button
              onClick={handleDownload}
              className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
