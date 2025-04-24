"use client"

import { useState, useEffect, useRef } from "react"
import { FileText, Share2, Clock, AlertCircle, Shield, UserPlus } from "lucide-react"

export default function NoRecordsAnimation() {
  const [isVisible, setIsVisible] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const floatingRef = useRef(null)
  const orbit1Ref = useRef(null)
  const orbit2Ref = useRef(null)
  const orbit3Ref = useRef(null)

  useEffect(() => {
    // Initial animation
    const initialTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Continuous subtle animations
    const animationInterval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 3000)

    // Create continuous orbital animations with JavaScript for smoother performance
    let angle1 = 0
    let angle2 = Math.PI / 2 // Start at 90 degrees
    let angle3 = Math.PI // Start at 180 degrees
    let floatY = 0
    let floatDirection = 1

    const animate = () => {
      if (floatingRef.current && orbit1Ref.current && orbit2Ref.current && orbit3Ref.current) {
        // Orbital animations
        angle1 += 0.01
        angle2 += 0.008
        angle3 += 0.012

        const radius = 80
        const x1 = Math.cos(angle1) * radius
        const y1 = Math.sin(angle1) * radius * 0.5 // Elliptical orbit

        const x2 = Math.cos(angle2) * radius * 0.7
        const y2 = Math.sin(angle2) * radius * 0.7

        const x3 = Math.cos(angle3) * radius * 0.6
        const y3 = Math.sin(angle3) * radius * 0.9

        orbit1Ref.current.style.transform = `translate(${x1}px, ${y1}px)`
        orbit2Ref.current.style.transform = `translate(${x2}px, ${y2}px)`
        orbit3Ref.current.style.transform = `translate(${x3}px, ${y3}px)`

        // Floating animation for the central element
        floatY += 0.05 * floatDirection
        if (floatY > 5) floatDirection = -1
        if (floatY < -5) floatDirection = 1

        floatingRef.current.style.transform = `translateY(${floatY}px)`
      }

      requestAnimationFrame(animate)
    }

    const animationFrame = requestAnimationFrame(animate)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(animationInterval)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div
        className={`flex max-w-3xl flex-col items-center rounded-lg bg-white p-8 text-center shadow-lg transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Main animation container */}
        <div className="relative mb-10 h-64 w-64">
          {/* Central floating element */}
          <div ref={floatingRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className={`flex h-32 w-32 items-center justify-center rounded-full bg-soft-amber/10 transition-all duration-500 ${
                animationStep === 1 ? "scale-105" : "scale-100"
              }`}
            >
              <div
                className={`relative transition-all duration-1000 ${
                  isVisible ? "rotate-0 scale-100" : "rotate-90 scale-0"
                }`}
              >
                <FileText
                  className={`h-16 w-16 text-soft-amber transition-all duration-500 ${
                    animationStep === 2 ? "opacity-80" : "opacity-100"
                  }`}
                />
                <div
                  className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white transition-all delay-500 duration-500 ${
                    isVisible ? "scale-100" : "scale-0"
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Orbiting elements */}
          <div ref={orbit1Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full bg-amber-50 p-3 shadow-md">
              <Share2
                className={`h-6 w-6 text-amber-500 transition-all duration-300 ${
                  animationStep === 0 ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          </div>

          <div ref={orbit2Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full bg-amber-50 p-3 shadow-md">
              <Clock
                className={`h-6 w-6 text-amber-500 transition-all duration-300 ${
                  animationStep === 3 ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          </div>

          <div ref={orbit3Ref} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-full bg-amber-50 p-3 shadow-md">
              <UserPlus
                className={`h-6 w-6 text-amber-500 transition-all duration-300 ${
                  animationStep === 1 ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          </div>

          {/* Small floating document icons */}
          <div className="absolute -top-4 right-10" style={{ animation: "float 4s ease-in-out infinite" }}>
            <div className="rounded-full bg-soft-amber/10 p-1.5">
              <FileText className="h-4 w-4 text-soft-amber" />
            </div>
          </div>

          <div className="absolute bottom-0 left-10" style={{ animation: "float 4s ease-in-out infinite 1s" }}>
            <div className="rounded-full bg-soft-amber/10 p-1.5">
              <FileText className="h-4 w-4 text-soft-amber" />
            </div>
          </div>

          <div className="absolute -bottom-8 right-16" style={{ animation: "float 4s ease-in-out infinite 2s" }}>
            <div className="rounded-full bg-soft-amber/10 p-1.5">
              <FileText className="h-4 w-4 text-soft-amber" />
            </div>
          </div>
        </div>

        <h2
          className={`mb-3 text-2xl font-bold text-gray-800 transition-all delay-300 duration-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          No Medical Records Shared Yet
        </h2>

        <p
          className={`mb-6 max-w-lg text-gray-600 transition-all delay-500 duration-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          You don't have any medical records shared with you at the moment. Patients need to explicitly share their
          records with you from their dashboard.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div
            className={`rounded-lg border border-amber-200 bg-amber-50 p-4 transition-all delay-700 duration-500 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-start">
              <Shield className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <h3 className="mb-1 font-medium text-amber-700">Patient Privacy Protection</h3>
                <p className="text-sm text-amber-700">
                  Smart Care protects patient privacy by requiring explicit consent before sharing medical records.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg border border-amber-200 bg-amber-50 p-4 transition-all delay-900 duration-500 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-start">
              <Share2 className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <h3 className="mb-1 font-medium text-amber-700">How Records Are Shared</h3>
                <p className="text-sm text-amber-700">
                  Patients can share specific records with you through their dashboard. Once shared, you'll have
                  immediate access.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-8 w-full max-w-md rounded-lg bg-gradient-to-r from-soft-amber/20 to-amber-500/20 p-4 transition-all delay-1100 duration-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ animation: "pulse 3s infinite" }}
        >
          <p className="text-center text-sm font-medium text-gray-700">
            You can remind patients to share their records with you during their next appointment or via the messaging
            system.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}
