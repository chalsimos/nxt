"use client"

import { useState } from "react"
import { Star, Filter, ChevronDown, User, Calendar, ArrowUpRight, X } from "lucide-react"

export default function FeedbackSupportPage() {
  const [activeTab, setActiveTab] = useState("feedback")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Mock feedback data
  const feedbackItems = [
    {
      id: 1,
      user: "John Doe",
      email: "john.doe@example.com",
      type: "suggestion",
      subject: "Add dark mode to patient dashboard",
      message:
        "It would be great to have a dark mode option for the patient dashboard to reduce eye strain during night time use.",
      date: "Apr 7, 2025",
      status: "new",
      rating: 4,
    },
    {
      id: 2,
      user: "Sarah Johnson",
      email: "sarah.j@example.com",
      type: "complaint",
      subject: "Appointment booking issues",
      message:
        "I've been trying to book an appointment with Dr. Smith but keep getting an error message. This has been happening for two days now.",
      date: "Apr 6, 2025",
      status: "in-progress",
      rating: 2,
    },
    {
      id: 3,
      user: "Dr. Emily Chen",
      email: "dr.chen@smartcare.com",
      type: "bug",
      subject: "Patient records not loading",
      message:
        "When I try to access patient records for certain patients, the page gets stuck loading. This is affecting my ability to provide care.",
      date: "Apr 5, 2025",
      status: "in-progress",
      rating: null,
    },
    {
      id: 4,
      user: "Michael Brown",
      email: "m.brown@example.com",
      type: "praise",
      subject: "Great new interface",
      message:
        "I love the new interface changes! The appointment scheduling is much more intuitive now. Great job to the team.",
      date: "Apr 4, 2025",
      status: "closed",
      rating: 5,
    },
    {
      id: 5,
      user: "Lisa Wong",
      email: "lisa.w@example.com",
      type: "suggestion",
      subject: "Medication reminder feature",
      message:
        "It would be helpful to have a medication reminder feature that sends notifications to patients when it's time to take their medication.",
      date: "Apr 3, 2025",
      status: "new",
      rating: 4,
    },
  ]

  // Mock support tickets
  const supportTickets = [
    {
      id: 101,
      user: "Dr. Robert Miller",
      email: "dr.miller@smartcare.com",
      priority: "high",
      subject: "Cannot access patient records",
      message:
        "I'm unable to access any patient records since this morning. I've tried logging out and back in, but the issue persists. This is urgent as I have appointments scheduled today.",
      date: "Apr 7, 2025",
      status: "open",
      lastUpdate: "10 minutes ago",
    },
    {
      id: 102,
      user: "Admin Staff",
      email: "admin@smartcare.com",
      priority: "medium",
      subject: "Billing system error",
      message:
        "The billing system is showing an error when trying to process insurance claims. We need this fixed as soon as possible.",
      date: "Apr 6, 2025",
      status: "in-progress",
      lastUpdate: "1 hour ago",
    },
    {
      id: 103,
      user: "Nurse Jenkins",
      email: "nurse.jenkins@smartcare.com",
      priority: "low",
      subject: "Printer connection issues",
      message:
        "The system is not connecting to the printer in the nurses' station. We've tried restarting both the computer and printer.",
      date: "Apr 5, 2025",
      status: "open",
      lastUpdate: "3 hours ago",
    },
    {
      id: 104,
      user: "Dr. Sarah Johnson",
      email: "dr.johnson@smartcare.com",
      priority: "high",
      subject: "Video call not working",
      message:
        "I'm unable to start video calls with patients. The button is there but nothing happens when I click it. I have a telehealth appointment in 30 minutes.",
      date: "Apr 5, 2025",
      status: "resolved",
      lastUpdate: "Yesterday",
    },
    {
      id: 105,
      user: "Front Desk",
      email: "frontdesk@smartcare.com",
      priority: "medium",
      subject: "Calendar sync issues",
      message:
        "The appointment calendar is not syncing properly with our external calendar system. Some appointments are missing or showing at the wrong times.",
      date: "Apr 4, 2025",
      status: "resolved",
      lastUpdate: "2 days ago",
    },
  ]

  // Get data based on active tab
  const items = activeTab === "feedback" ? feedbackItems : supportTickets

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "new":
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-amber-100 text-amber-800"
      case "closed":
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Type badge color
  const getTypeColor = (type) => {
    switch (type) {
      case "suggestion":
        return "bg-blue-100 text-blue-800"
      case "complaint":
        return "bg-red-100 text-red-800"
      case "bug":
        return "bg-purple-100 text-purple-800"
      case "praise":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Render stars for rating
  const renderStars = (rating) => {
    if (rating === null) return <span className="text-xs text-drift-gray">No rating</span>

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-drift-gray"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Feedback & Support</h1>
          <p className="text-drift-gray mt-1">Manage user feedback and support requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white rounded-md border border-earth-beige hover:bg-pale-stone"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-earth-beige">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Status</label>
              <select className="w-full p-2 border border-earth-beige rounded-md text-sm">
                <option>All Statuses</option>
                <option>New / Open</option>
                <option>In Progress</option>
                <option>Closed / Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                {activeTab === "feedback" ? "Type" : "Priority"}
              </label>
              <select className="w-full p-2 border border-earth-beige rounded-md text-sm">
                {activeTab === "feedback" ? (
                  <>
                    <option>All Types</option>
                    <option>Suggestion</option>
                    <option>Complaint</option>
                    <option>Bug</option>
                    <option>Praise</option>
                  </>
                ) : (
                  <>
                    <option>All Priorities</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Date Range</label>
              <select className="w-full p-2 border border-earth-beige rounded-md text-sm">
                <option>All Time</option>
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-soft-amber text-white text-sm rounded-md hover:bg-soft-amber/90">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-earth-beige px-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab("feedback")}
              className={`py-3 px-1 text-sm font-medium border-b-2 ${
                activeTab === "feedback"
                  ? "border-soft-amber text-soft-amber"
                  : "border-transparent text-drift-gray hover:text-graphite hover:border-earth-beige"
              }`}
            >
              User Feedback
              <span className="ml-1 bg-soft-amber/20 text-soft-amber text-xs px-1.5 py-0.5 rounded-full">
                {feedbackItems.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`py-3 px-1 text-sm font-medium border-b-2 ${
                activeTab === "support"
                  ? "border-soft-amber text-soft-amber"
                  : "border-transparent text-drift-gray hover:text-graphite hover:border-earth-beige"
              }`}
            >
              Support Tickets
              <span className="ml-1 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
                {supportTickets.filter((t) => t.status !== "resolved").length}
              </span>
            </button>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* List of items */}
          <div className={`flex-1 ${selectedTicket ? "hidden md:block" : ""}`}>
            <div className="divide-y divide-earth-beige">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-pale-stone/50 cursor-pointer"
                  onClick={() => setSelectedTicket(item)}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-graphite">{item.subject}</h3>
                        <span className="text-xs text-drift-gray">{item.date}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-drift-gray mr-1" />
                        <span className="text-sm text-drift-gray">{item.user}</span>
                      </div>
                      <p className="text-sm text-drift-gray mt-2 line-clamp-2">{item.message}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                          {activeTab === "feedback" ? (
                            <span
                              className={`inline-block px-2 py-0.5 text-xs rounded-full ${getTypeColor(item.type)}`}
                            >
                              {item.type}
                            </span>
                          ) : (
                            <span
                              className={`inline-block px-2 py-0.5 text-xs rounded-full ${getPriorityColor(item.priority)}`}
                            >
                              {item.priority}
                            </span>
                          )}
                        </div>
                        {activeTab === "feedback" && <div>{renderStars(item.rating)}</div>}
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-drift-gray ml-2 md:hidden" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail view */}
          {selectedTicket && (
            <div
              className={`border-t md:border-t-0 md:border-l border-earth-beige md:w-1/2 ${selectedTicket ? "block" : "hidden md:block"}`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-graphite">{selectedTicket.subject}</h2>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1 rounded-full hover:bg-pale-stone md:hidden"
                  >
                    <X className="h-5 w-5 text-drift-gray" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-soft-amber/20 flex items-center justify-center text-soft-amber mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-graphite">{selectedTicket.user}</p>
                      <p className="text-xs text-drift-gray">{selectedTicket.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-drift-gray mr-1" />
                    <span className="text-sm text-drift-gray">{selectedTicket.date}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedTicket.status)}`}
                  >
                    {selectedTicket.status}
                  </span>
                  {activeTab === "feedback" ? (
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${getTypeColor(selectedTicket.type)}`}
                    >
                      {selectedTicket.type}
                    </span>
                  ) : (
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${getPriorityColor(selectedTicket.priority)}`}
                    >
                      {selectedTicket.priority}
                    </span>
                  )}
                </div>

                {activeTab === "feedback" && selectedTicket.rating !== null && (
                  <div className="mt-3">
                    <p className="text-sm text-drift-gray mb-1">Rating:</p>
                    {renderStars(selectedTicket.rating)}
                  </div>
                )}

                <div className="mt-4 p-4 bg-pale-stone rounded-lg">
                  <p className="text-sm text-graphite whitespace-pre-line">{selectedTicket.message}</p>
                </div>

                {activeTab === "support" && (
                  <div className="mt-4">
                    <p className="text-sm text-drift-gray">Last updated: {selectedTicket.lastUpdate}</p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-graphite">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 bg-soft-amber text-white text-sm rounded-md hover:bg-soft-amber/90">
                      {activeTab === "feedback" ? "Send Response" : "Update Ticket"}
                    </button>
                    <button className="px-3 py-1.5 border border-earth-beige text-sm rounded-md hover:bg-pale-stone">
                      Change Status
                    </button>
                    <button className="px-3 py-1.5 border border-earth-beige text-sm rounded-md hover:bg-pale-stone">
                      {activeTab === "feedback" ? "Forward" : "Assign"}
                    </button>
                    <button className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-md hover:bg-red-50">
                      {activeTab === "feedback" ? "Archive" : "Close Ticket"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
