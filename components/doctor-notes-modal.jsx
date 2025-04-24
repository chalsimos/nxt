"use client"

import { useState, useEffect } from "react"
import { X, MessageSquare, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

export function DoctorNotesModal({ isOpen, onClose, record }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const notesPerPage = 3

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
    }
  }, [isOpen])

  // Handle closing with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsVisible(false)
    }, 300)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleString()
  }

  // Calculate pagination
  const totalNotes = record?.doctorNotes?.length || 0
  const totalPages = Math.ceil(totalNotes / notesPerPage)
  const startIndex = (currentPage - 1) * notesPerPage
  const endIndex = Math.min(startIndex + notesPerPage, totalNotes)
  const currentNotes = record?.doctorNotes?.slice(startIndex, endIndex) || []

  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (!isOpen && !isVisible) return null

  return (
    <>
      {/* Backdrop with animation */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${isClosing ? "opacity-0" : ""}`}
        onClick={handleClose}
      />

      {/* Modal with animation */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } ${isClosing ? "opacity-0 scale-95" : ""}`}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-amber-500 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex items-center mb-4">
          <MessageSquare className="h-6 w-6 text-amber-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Doctor Notes</h2>
        </div>

        {record && (
          <div className="mb-4 p-3 bg-gray-100/70 rounded-md">
            <p className="font-medium text-gray-800">{record.name}</p>
            <p className="text-sm text-gray-500">
              Type: {record.type} • Date: {new Date(record.date).toLocaleDateString()}
            </p>
          </div>
        )}

        {totalNotes > 0 ? (
          <div className="space-y-4">
            {currentNotes.map((note, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0">
                    {note.doctorPhotoURL ? (
                      <img
                        src={note.doctorPhotoURL || "/placeholder.svg"}
                        alt={note.doctorName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                        <User className="h-5 w-5 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-gray-800">{note.doctorName || "Doctor"}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1 sm:mt-0">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span className="mr-2">{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600">{note.note}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{endIndex} of {totalNotes} notes
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`rounded-md p-1 ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-100 hover:text-amber-500"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`rounded-md p-1 ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-100 hover:text-amber-500"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-800">No Notes Yet</h3>
            <p className="text-gray-500">There are no doctor notes for this record yet.</p>
          </div>
        )}
      </div>
    </>
  )
}
