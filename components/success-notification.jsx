"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"

export function SuccessNotification({ message, isVisible, onClose }) {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true)
      const timer = setTimeout(() => {
        setIsShowing(false)
        setTimeout(() => {
          onClose()
        }, 300) // Wait for fade out animation
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex w-full max-w-sm items-center rounded-lg border border-green-100 bg-white p-4 shadow-lg transition-all duration-300 ${
        isShowing ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
      style={{
        animation: isShowing ? "slideInDown 0.5s ease-out" : "slideOutUp 0.3s ease-in-out",
      }}
    >
      <div className="mr-3 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
        <CheckCircle className="h-5 w-5 text-green-600" />
      </div>
      <div className="ml-2 flex-1 text-sm font-medium text-graphite">{message}</div>
      <button
        type="button"
        onClick={() => {
          setIsShowing(false)
          setTimeout(() => {
            onClose()
          }, 300)
        }}
        className="ml-auto -mx-1.5 -my-1.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1.5 text-drift-gray hover:bg-pale-stone hover:text-soft-amber transition-colors duration-200"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
