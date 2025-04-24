"use client"

import { useState } from "react"
import { Star, Send, MessageSquare, ThumbsUp, AlertCircle, Mail, Phone } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export default function DoctorFeedbackPage() {
  const isMobile = useMobile()
  const [feedbackType, setFeedbackType] = useState("general")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [pastFeedback, setPastFeedback] = useState([
    {
      id: 1,
      type: "platform",
      rating: 4,
      message: "The patient management system is excellent, but I'd like more customization options for the dashboard.",
      date: "2023-11-10",
      status: "responded",
      response: "Thank you for your feedback. We're working on more customization options in our next update.",
    },
    {
      id: 2,
      type: "technical",
      rating: 3,
      message: "The video call feature sometimes has audio lag during consultations.",
      date: "2023-10-25",
      status: "pending",
    },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (rating === 0) {
      alert("Please provide a rating")
      return
    }

    if (!feedbackText.trim()) {
      alert("Please provide feedback details")
      return
    }

    // In a real app, this would send the feedback to an API
    const newFeedback = {
      id: pastFeedback.length + 1,
      type: feedbackType,
      rating,
      message: feedbackText,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    }

    setPastFeedback([newFeedback, ...pastFeedback])
    setSubmitted(true)
    setRating(0)
    setFeedbackText("")

    // Reset submitted state after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-graphite mb-2">Feedback & Support</h1>
        <p className="text-drift-gray">
          Share your experience or report issues to help us improve the platform for healthcare providers
        </p>
      </div>

      {submitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <ThumbsUp className="h-5 w-5 mr-2" />
          <span>Thank you for your feedback! We appreciate your professional input.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feedback Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-earth-beige p-6">
            <h2 className="text-xl font-semibold text-graphite mb-4">Submit Feedback</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-graphite mb-2">Feedback Type</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md text-sm ${
                      feedbackType === "general"
                        ? "bg-soft-amber text-white"
                        : "bg-pale-stone text-drift-gray hover:bg-earth-beige"
                    }`}
                    onClick={() => setFeedbackType("general")}
                  >
                    General Feedback
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md text-sm ${
                      feedbackType === "platform"
                        ? "bg-soft-amber text-white"
                        : "bg-pale-stone text-drift-gray hover:bg-earth-beige"
                    }`}
                    onClick={() => setFeedbackType("platform")}
                  >
                    Platform Feedback
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md text-sm ${
                      feedbackType === "technical"
                        ? "bg-soft-amber text-white"
                        : "bg-pale-stone text-drift-gray hover:bg-earth-beige"
                    }`}
                    onClick={() => setFeedbackType("technical")}
                  >
                    Technical Issue
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-graphite mb-2">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="feedback" className="block text-sm font-medium text-graphite mb-2">
                  Your Feedback
                </label>
                <textarea
                  id="feedback"
                  rows="4"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={
                    feedbackType === "technical"
                      ? "Please describe the issue you're experiencing in detail..."
                      : "Share your professional insights and suggestions..."
                  }
                  className="w-full p-3 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-amber"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Support & Past Feedback */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-earth-beige p-6 mb-6">
            <h2 className="text-xl font-semibold text-graphite mb-4">Provider Support</h2>
            <p className="text-drift-gray mb-4">
              Contact our dedicated healthcare provider support team for assistance.
            </p>
            <div className="flex flex-col space-y-3">
              <a
                href="#"
                className="inline-flex items-center px-4 py-2 bg-pale-stone text-graphite rounded-md hover:bg-earth-beige"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Provider Chat
              </a>
              <a
                href="mailto:provider-support@smartcare.com"
                className="inline-flex items-center px-4 py-2 bg-pale-stone text-graphite rounded-md hover:bg-earth-beige"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
              <a
                href="tel:+18007654321"
                className="inline-flex items-center px-4 py-2 bg-pale-stone text-graphite rounded-md hover:bg-earth-beige"
              >
                <Phone className="h-4 w-4 mr-2" />
                Priority Line
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-earth-beige p-6">
            <h2 className="text-xl font-semibold text-graphite mb-4">Your Past Feedback</h2>
            {pastFeedback.length > 0 ? (
              <div className="space-y-4">
                {pastFeedback.map((feedback) => (
                  <div key={feedback.id} className="border-b border-earth-beige pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-medium text-graphite">
                          {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)} Feedback
                        </span>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-drift-gray">{feedback.date}</span>
                    </div>
                    <p className="text-sm text-graphite mb-2">{feedback.message}</p>

                    {feedback.status === "responded" && (
                      <div className="mt-2 pl-3 border-l-2 border-soft-amber">
                        <p className="text-xs font-medium text-soft-amber mb-1">Response:</p>
                        <p className="text-sm text-drift-gray">{feedback.response}</p>
                      </div>
                    )}

                    <div className="mt-2 flex items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          feedback.status === "responded"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {feedback.status === "responded" ? "Responded" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-drift-gray mx-auto mb-2" />
                <p className="text-drift-gray">You haven't submitted any feedback yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
