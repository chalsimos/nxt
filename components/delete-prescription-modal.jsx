"use client"

import { useEffect, useState } from "react"
import { X, AlertTriangle } from "lucide-react"

export function DeletePrescriptionModal({ isOpen, onClose, prescription, onDelete }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    const backdrop = document.getElementById("delete-prescription-modal-backdrop")
    const modalContent = document.getElementById("delete-prescription-modal-content")

    if (backdrop) backdrop.style.animation = "fadeOut 0.3s ease-in-out forwards"
    if (modalContent) modalContent.style.animation = "scaleOut 0.3s ease-in-out forwards"

    setTimeout(() => {
      onClose()
    }, 280)
  }

  const handleDelete = async () => {
    if (!prescription || !prescription.id) return

    setIsDeleting(true)
    try {
      await onDelete(prescription.id)
      handleClose()
    } catch (error) {
      console.error("Error deleting prescription:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!prescription) return null

  return (
    <>
      {/* Backdrop with animation */}
      <div
        id="delete-prescription-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      />

      {/* Modal with animation */}
      <div
        id="delete-prescription-modal-content"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
        style={{ animation: "scaleIn 0.3s ease-in-out" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-graphite">Delete Prescription</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-drift-gray transition-colors duration-200 hover:bg-pale-stone hover:text-soft-amber"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-graphite">Are you sure?</h3>
          <p className="mt-2 text-sm text-drift-gray">
            You are about to delete the prescription for <span className="font-medium">{prescription.medication}</span>{" "}
            prescribed to <span className="font-medium">{prescription.patient || prescription.patientName}</span>. This
            action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-stone"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Deleting...
              </>
            ) : (
              "Delete Prescription"
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes scaleOut {
          from { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
        }
      `}</style>
    </>
  )
}
