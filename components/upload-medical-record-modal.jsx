"use client"

import { useState, useEffect } from "react"
import {
  X,
  Upload,
  AlertCircle,
  FileText,
  ImageIcon,
  FileCheck,
  FileSpreadsheet,
  FileIcon as FilePdf,
} from "lucide-react"
import {
  isFileSizeValid,
  isFileTypeAllowed,
  fileToBase64,
  uploadMedicalRecord,
  MAX_FILE_SIZE,
  getFileTypeCategory,
} from "@/lib/record-utils"

export function UploadMedicalRecordModal({ isOpen, onClose, userId, onSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [recordName, setRecordName] = useState("")
  const [recordType, setRecordType] = useState("")
  const [recordDate, setRecordDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customType, setCustomType] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Record types
  const recordTypes = ["Lab Result", "Imaging", "Prescription", "Visit Note", "Vaccination", "Insurance", "Other"]

  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
    }
  }, [isOpen])

  // Handle closing with animation
  const handleClose = () => {
    if (loading) return

    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsVisible(false)

      // Reset form after closing animation
      setTimeout(() => {
        setFile(null)
        setPreview(null)
        setRecordName("")
        setRecordType("")
        setCustomType("")
        setRecordDate("")
        setNotes("")
        setError("")
        setUploadProgress(0)
      }, 300)
    }, 300)
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    processFile(selectedFile)
  }

  // Process the selected file
  const processFile = (selectedFile) => {
    if (!selectedFile) return

    // Check file size
    if (!isFileSizeValid(selectedFile)) {
      setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
      return
    }

    // Check file type
    if (!isFileTypeAllowed(selectedFile)) {
      setError("File type not allowed. Please upload a PDF, image, or document file.")
      return
    }

    setFile(selectedFile)
    setError("")

    // Auto-suggest record name from file name
    if (!recordName) {
      const fileName = selectedFile.name.split(".")[0]
      setRecordName(fileName.charAt(0).toUpperCase() + fileName.slice(1))
    }

    // Auto-suggest record type based on file type
    if (!recordType) {
      const fileCategory = getFileTypeCategory(selectedFile)
      if (fileCategory === "Image") setRecordType("Imaging")
      else if (fileCategory === "PDF") setRecordType("Lab Result")
      else if (fileCategory === "Document") setRecordType("Visit Note")
    }

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    if (!recordName) {
      setError("Please enter a name for the record.")
      return
    }

    if (!recordType && !customType) {
      setError("Please select or enter a record type.")
      return
    }

    if (!recordDate) {
      setError("Please enter a date for the record.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setUploadProgress(10)

      // Convert file to base64
      const fileData = await fileToBase64(file)
      setUploadProgress(50)

      // Upload record to Firestore
      await uploadMedicalRecord(userId, {
        name: recordName,
        type: recordType === "Other" ? customType : recordType,
        fileType: file.type,
        fileData: fileData,
        fileSize: file.size,
        date: recordDate,
        notes: notes,
      })

      setUploadProgress(100)

      // Notify parent component of success
      if (onSuccess) onSuccess()

      // Close modal
      handleClose()
    } catch (error) {
      console.error("Error uploading record:", error)
      setError(`Failed to upload record: ${error.message || "Please try again."}`)
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  // Get file icon based on file type
  const getFileIcon = () => {
    if (!file) return <Upload className="h-12 w-12 text-drift-gray" />
    if (file.type.startsWith("image/")) return <ImageIcon className="h-12 w-12 text-soft-amber" />
    if (file.type === "application/pdf") return <FilePdf className="h-12 w-12 text-red-500" />
    if (file.type.includes("spreadsheet") || file.type.includes("excel"))
      return <FileSpreadsheet className="h-12 w-12 text-green-600" />
    return <FileText className="h-12 w-12 text-soft-amber" />
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
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } ${isClosing ? "opacity-0 scale-95" : ""}`}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber transition-colors duration-200"
          disabled={loading}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <h2 className="mb-4 text-xl font-bold text-graphite">Upload Medical Record</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">
            <div className="flex">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-graphite">Record File</label>
            <div className="mt-1">
              {!file ? (
                <div
                  className={`flex items-center justify-center rounded-md border-2 border-dashed ${
                    dragActive ? "border-soft-amber bg-soft-amber/5" : "border-earth-beige hover:border-soft-amber"
                  } p-6 transition-colors duration-200`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <label className="flex cursor-pointer flex-col items-center">
                    <Upload className="mb-2 h-8 w-8 text-drift-gray" />
                    <span className="mb-1 text-sm font-medium text-graphite">Drag and drop or click to upload</span>
                    <span className="text-xs text-drift-gray">PDF, Images, or Documents (max 10MB)</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    />
                  </label>
                </div>
              ) : (
                <div className="rounded-md border border-earth-beige bg-pale-stone/30 p-4">
                  <div className="flex items-center">
                    {preview ? (
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Preview"
                        className="mr-4 h-16 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-md bg-pale-stone">
                        {getFileIcon()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-graphite">{file.name}</p>
                      <p className="text-sm text-drift-gray">
                        {(file.size / 1024).toFixed(1)} KB • {file.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                      }}
                      className="rounded-full p-1 text-drift-gray hover:bg-pale-stone hover:text-soft-amber"
                      disabled={loading}
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Record Name */}
          <div>
            <label htmlFor="recordName" className="block text-sm font-medium text-graphite">
              Record Name
            </label>
            <input
              type="text"
              id="recordName"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-earth-beige p-2 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              placeholder="e.g., Blood Test Results"
              required
              disabled={loading}
            />
          </div>

          {/* Record Type */}
          <div>
            <label htmlFor="recordType" className="block text-sm font-medium text-graphite">
              Record Type
            </label>
            <select
              id="recordType"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-earth-beige p-2 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              required
              disabled={loading}
            >
              <option value="">Select a type</option>
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Type (if "Other" is selected) */}
          {recordType === "Other" && (
            <div>
              <label htmlFor="customType" className="block text-sm font-medium text-graphite">
                Custom Type
              </label>
              <input
                type="text"
                id="customType"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="mt-1 block w-full rounded-md border border-earth-beige p-2 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                placeholder="Enter custom record type"
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Record Date */}
          <div>
            <label htmlFor="recordDate" className="block text-sm font-medium text-graphite">
              Record Date
            </label>
            <input
              type="date"
              id="recordDate"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-earth-beige p-2 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              required
              disabled={loading}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-graphite">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-earth-beige p-2 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              placeholder="Add any additional notes about this record"
              disabled={loading}
            />
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-drift-gray">Uploading...</span>
                <span className="text-soft-amber font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-pale-stone rounded-full h-2">
                <div
                  className="bg-soft-amber h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-earth-beige px-4 py-2 text-sm font-medium text-graphite hover:bg-pale-stone transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              disabled={loading || !file || !recordName || (!recordType && !customType) || !recordDate}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Upload Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
