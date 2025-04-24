"use client"

import { useState, useEffect } from "react"
import { X, Search, UserPlus, Check, AlertCircle, Users, Share2 } from "lucide-react"
import { getAllDoctors, shareRecordWithDoctor, unshareRecordWithDoctor } from "@/lib/record-utils"
import { useAuth } from "@/contexts/auth-context"

export function ShareRecordModal({ isOpen, onClose, record }) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [doctors, setDoctors] = useState([])
  const [sharedDoctors, setSharedDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [activeTab, setActiveTab] = useState("all") // "all" or "shared"

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
      // Reset state after closing
      setSearchTerm("")
      setError("")
      setSuccess("")
    }, 300)
  }

  // Load doctors and shared doctors
  useEffect(() => {
    if (!isOpen || !record) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError("")

        // Get all doctors
        const allDoctors = await getAllDoctors()
        setDoctors(allDoctors)

        // Get doctors this record is shared with
        // Check if the record has sharedWith property
        if (record.sharedWith && Array.isArray(record.sharedWith)) {
          // If the record already has the sharedWith array, use it to get doctor details
          const sharedDoctorIds = record.sharedWith
          const sharedDoctorsList = []

          for (const doctorId of sharedDoctorIds) {
            const doctorInfo = allDoctors.find((d) => d.id === doctorId)
            if (doctorInfo) {
              sharedDoctorsList.push(doctorInfo)
            }
          }

          setSharedDoctors(sharedDoctorsList)
        } else {
          // If no sharedWith property, set empty array
          setSharedDoctors([])
        }
      } catch (error) {
        console.error("Error loading doctors:", error)
        setError("Failed to load doctors. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isOpen, record])

  // Handle sharing record with a doctor
  const handleShareRecord = async (doctorId, doctorName) => {
    try {
      setSharing(true)
      setError("")
      setSuccess("")

      // Check if already shared
      if (sharedDoctors.some((doctor) => doctor.id === doctorId)) {
        setError(`This record is already shared with Dr. ${doctorName}`)
        setSharing(false)
        return
      }

      // Share record
      await shareRecordWithDoctor(record.id, doctorId, user?.displayName || "Patient")

      // Update shared doctors list
      const doctorToAdd = doctors.find((d) => d.id === doctorId)
      if (doctorToAdd) {
        setSharedDoctors([...sharedDoctors, doctorToAdd])
      }

      setSuccess(`Record successfully shared with Dr. ${doctorName}`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error) {
      console.error("Error sharing record:", error)
      setError(error.message || "Failed to share record. Please try again.")
    } finally {
      setSharing(false)
    }
  }

  // Handle unsharing record with a doctor
  const handleUnshareRecord = async (doctorId, doctorName) => {
    try {
      setSharing(true)
      setError("")
      setSuccess("")

      // Unshare record
      await unshareRecordWithDoctor(record.id, doctorId)

      // Update shared doctors list
      const updatedSharedDoctors = sharedDoctors.filter((doctor) => doctor.id !== doctorId)
      setSharedDoctors(updatedSharedDoctors)

      setSuccess(`Record access revoked from Dr. ${doctorName}`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error) {
      console.error("Error unsharing record:", error)
      setError("Failed to revoke access. Please try again.")
    } finally {
      setSharing(false)
    }
  }

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } ${isClosing ? "opacity-0 scale-95" : ""}`}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber transition-colors duration-200"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex items-center mb-4">
          <Share2 className="h-6 w-6 text-soft-amber mr-2" />
          <h2 className="text-xl font-bold text-graphite">Share Medical Record</h2>
        </div>

        {record && (
          <div className="mb-4 p-3 bg-pale-stone/30 rounded-md">
            <p className="font-medium text-graphite">{record.name}</p>
            <p className="text-sm text-drift-gray">
              Type: {record.type} • Date: {new Date(record.date).toLocaleDateString()}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700 animate-fadeIn">
            <div className="flex">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-green-700 animate-fadeIn">
            <div className="flex">
              <Check className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-pale-stone mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "all"
                ? "text-soft-amber border-b-2 border-soft-amber"
                : "text-drift-gray hover:text-graphite"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Doctors
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "shared"
                ? "text-soft-amber border-b-2 border-soft-amber"
                : "text-drift-gray hover:text-graphite"
            }`}
            onClick={() => setActiveTab("shared")}
          >
            Shared With ({sharedDoctors.length})
          </button>
        </div>

        {/* Search (only show in All Doctors tab) */}
        {activeTab === "all" && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-drift-gray" />
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-earth-beige bg-white py-2 pl-10 pr-3 text-graphite placeholder:text-drift-gray/60 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
            />
          </div>
        )}

        {/* Doctor List */}
        <div className="max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soft-amber"></div>
            </div>
          ) : activeTab === "all" ? (
            // All Doctors Tab
            filteredDoctors.length > 0 ? (
              <div className="space-y-3">
                {filteredDoctors.map((doctor) => {
                  const isShared = sharedDoctors.some((d) => d.id === doctor.id)
                  return (
                    <div
                      key={doctor.id}
                      className="flex items-center justify-between rounded-md border border-pale-stone p-3 hover:border-soft-amber/30 hover:bg-pale-stone/20 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-pale-stone overflow-hidden mr-3">
                          {doctor.photoURL ? (
                            <img
                              src={doctor.photoURL || "/placeholder.svg"}
                              alt={doctor.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-soft-amber/10">
                              <Users className="h-5 w-5 text-soft-amber" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-graphite">{doctor.name}</p>
                          <p className="text-xs text-drift-gray">
                            {doctor.specialty ? doctor.specialty : doctor.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          isShared
                            ? handleUnshareRecord(doctor.id, doctor.name)
                            : handleShareRecord(doctor.id, doctor.name)
                        }
                        disabled={sharing}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                          isShared
                            ? "bg-pale-stone text-drift-gray hover:bg-red-50 hover:text-red-600"
                            : "bg-soft-amber text-white hover:bg-amber-600"
                        }`}
                      >
                        {isShared ? (
                          "Revoke Access"
                        ) : (
                          <>
                            <UserPlus className="mr-1 inline-block h-4 w-4" />
                            Share
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-drift-gray">
                {searchTerm ? "No doctors match your search" : "No doctors found"}
              </div>
            )
          ) : // Shared With Tab
          sharedDoctors.length > 0 ? (
            <div className="space-y-3">
              {sharedDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between rounded-md border border-pale-stone p-3 hover:border-soft-amber/30 hover:bg-pale-stone/20 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-pale-stone overflow-hidden mr-3">
                      {doctor.photoURL ? (
                        <img
                          src={doctor.photoURL || "/placeholder.svg"}
                          alt={doctor.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-soft-amber/10">
                          <Users className="h-5 w-5 text-soft-amber" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-graphite">{doctor.name}</p>
                      <p className="text-xs text-drift-gray">{doctor.specialty ? doctor.specialty : doctor.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnshareRecord(doctor.id, doctor.name)}
                    disabled={sharing}
                    className="rounded-md bg-pale-stone px-3 py-1.5 text-sm font-medium text-drift-gray hover:bg-red-50 hover:text-red-600"
                  >
                    Revoke Access
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-drift-gray">You haven't shared this record with any doctors yet</div>
          )}
        </div>
      </div>
    </>
  )
}
