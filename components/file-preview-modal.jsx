"use client"

import { useState, useRef, useEffect } from "react"
import { X, Download, ZoomIn, ZoomOut, RotateCw, Play, Pause } from "lucide-react"
import { createDataURL, downloadFile } from "@/lib/file-utils"

export default function FilePreviewModal({ isOpen, onClose, file, fileName }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const audioRef = useRef(null)
  const videoRef = useRef(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setIsPlaying(false)
    }
  }, [isOpen])

  if (!isOpen || !file) return null

  const handleDownload = () => {
    if (!file || !file.base64 || !file.type) return
    const dataUrl = createDataURL(file.base64, file.type)
    downloadFile(dataUrl, fileName || "download")
  }

  const togglePlay = () => {
    if (file.type.startsWith("audio/") && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (file.type.startsWith("video/") && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const rotate = () => setRotation((prev) => (prev + 90) % 360)

  const renderContent = () => {
    const dataUrl = createDataURL(file.base64, file.type)

    if (file.type.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={dataUrl || "/placeholder.svg"}
            alt={fileName || "Preview"}
            className="max-h-full max-w-full object-contain transition-transform"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          />
        </div>
      )
    } else if (file.type.startsWith("video/")) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <video
            ref={videoRef}
            src={dataUrl}
            className="max-h-[80%] max-w-full"
            controls={false}
            onEnded={() => setIsPlaying(false)}
          />
          <div className="mt-4 flex items-center space-x-4">
            <button onClick={togglePlay} className="p-2 rounded-full bg-soft-amber text-white hover:bg-amber-600">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <div className="text-sm text-gray-700">
              {file.duration
                ? `Duration: ${Math.floor(file.duration / 60)}:${String(file.duration % 60).padStart(2, "0")}`
                : ""}
            </div>
          </div>
        </div>
      )
    } else if (file.type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-64 h-64 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <audio ref={audioRef} src={dataUrl} className="hidden" onEnded={() => setIsPlaying(false)} />
          <div className="mt-4 flex items-center space-x-4">
            <button onClick={togglePlay} className="p-2 rounded-full bg-soft-amber text-white hover:bg-amber-600">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <div className="text-sm text-gray-700">{fileName || "Audio file"}</div>
          </div>
        </div>
      )
    } else if (file.type === "application/pdf") {
      return <iframe src={dataUrl} className="w-full h-full" title={fileName || "PDF Preview"} />
    } else if (file.type.startsWith("text/")) {
      try {
        const text = atob(file.base64)
        return (
          <div className="w-full h-full overflow-auto bg-white p-4 rounded">
            <pre className="whitespace-pre-wrap text-sm">{text}</pre>
          </div>
        )
      } catch (e) {
        return <div className="text-red-500">Error displaying text content</div>
      }
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="p-8 rounded-full bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-medium">{fileName || "File"}</p>
            <p className="text-sm text-gray-500">{file.type || "Unknown file type"}</p>
          </div>
        </div>
      )
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 transition-opacity" onClick={onClose} />
      <div className="fixed inset-4 z-50 flex flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-medium truncate">{fileName || "File Preview"}</h3>
          <div className="flex items-center space-x-2">
            {file.type.startsWith("image/") && (
              <>
                <button onClick={zoomIn} className="p-1 rounded-full hover:bg-gray-100" title="Zoom In">
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button onClick={zoomOut} className="p-1 rounded-full hover:bg-gray-100" title="Zoom Out">
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button onClick={rotate} className="p-1 rounded-full hover:bg-gray-100" title="Rotate">
                  <RotateCw className="h-5 w-5" />
                </button>
              </>
            )}
            <button onClick={handleDownload} className="p-1 rounded-full hover:bg-gray-100" title="Download">
              <Download className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" title="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">{renderContent()}</div>
      </div>
    </>
  )
}
