"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Calendar,
  Clock,
  MessageSquare,
  Pill,
  Plus,
  User,
  Heart,
  Activity,
  Droplet,
  Utensils,
  Moon,
  Smile,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
} from "lucide-react"
import { MiniCalendar } from "@/components/mini-calendar"
import { AppointmentModal } from "@/components/appointment-modal"
import { SuccessNotification } from "@/components/success-notification"
import { DashboardHeaderBanner } from "@/components/dashboard-header-banner"
import { useAuth } from "@/contexts/auth-context"
import { formatDateForDisplay } from "@/lib/appointment-utils"
import {
  getConnectedDoctors,
  getUpcomingAppointments,
  getUnreadMessageCount,
  getCalendarAppointments,
  getDoctorUnavailabilityForPatient,
  getPrescriptionCount,
} from "@/lib/dashboard-utils"
import { getPatientPrescriptions } from "@/lib/prescription-utils"

export default function PatientDashboard() {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [notification, setNotification] = useState({ message: "", isVisible: false })
  const [dashboardData, setDashboardData] = useState({
    doctorInteractions: { count: 0, doctors: [] },
    upcomingAppointments: [],
    recentPrescriptions: [],
    prescriptionCount: 0,
    unreadMessages: 0,
    calendarAppointments: [],
    doctorUnavailability: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Check for success message in URL parameters
  useEffect(() => {
    const success = searchParams.get("success")
    const message = searchParams.get("message")

    if (success === "true" && message) {
      setNotification({
        message: decodeURIComponent(message),
        isVisible: true,
      })
    }
  }, [searchParams])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      try {
        // Get connected doctors
        const doctorInteractions = await getConnectedDoctors(user.uid)

        // Get upcoming appointments
        const upcomingAppointments = await getUpcomingAppointments(user.uid, false, 3) // Limit to 3

        // Get prescription count
        const prescriptionCount = await getPrescriptionCount(user.uid, false)

        // Get prescription details
        const prescriptionResult = await getPatientPrescriptions(user.uid)
        const recentPrescriptions = prescriptionResult.success
          ? prescriptionResult.prescriptions.slice(0, 5).map((prescription) => ({
              id: prescription.id,
              medication: prescription.medications[0]?.name || "Medication",
              dosage: prescription.medications[0]?.dosage || "",
              frequency: prescription.medications[0]?.frequency || "",
              doctor: prescription.doctorName || "Dr. Unknown",
              date: prescription.createdAt?.toDate() || new Date(),
            }))
          : []

        // Get unread message count
        const unreadMessages = await getUnreadMessageCount(user.uid)

        // Get all appointments for calendar
        const calendarAppointments = await getCalendarAppointments(user.uid, false)

        // Get doctor unavailability for connected doctors
        const doctorUnavailability = await getDoctorUnavailabilityForPatient(user.uid)

        setDashboardData({
          doctorInteractions,
          upcomingAppointments: upcomingAppointments.map((apt) => ({
            id: apt.id,
            doctor: apt.otherParty?.displayName || "Dr. Unknown",
            specialty: apt.otherParty?.specialty || "Specialist",
            date: apt.date ? new Date(apt.date) : new Date(),
            time: apt.time || "12:00 PM",
            status: apt.status || "confirmed",
          })),
          recentPrescriptions,
          prescriptionCount,
          unreadMessages,
          calendarAppointments,
          doctorUnavailability,
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        // Fallback to static data if there's an error
        setDashboardData({
          doctorInteractions: {
            count: 3,
            doctors: [
              { id: "doc1", name: "Dr. Sarah Johnson", specialty: "Cardiologist" },
              { id: "doc2", name: "Dr. Michael Chen", specialty: "Dermatologist" },
              { id: "doc3", name: "Dr. Emily Rodriguez", specialty: "Neurologist" },
            ],
          },
          upcomingAppointments: [
            {
              id: "apt1",
              doctor: "Dr. Sarah Johnson",
              specialty: "Cardiologist",
              date: new Date(Date.now() + 86400000), // tomorrow
              time: "10:00 AM",
              status: "confirmed",
            },
            {
              id: "apt2",
              doctor: "Dr. Michael Chen",
              specialty: "Dermatologist",
              date: new Date(Date.now() + 86400000 * 5), // 5 days from now
              time: "2:30 PM",
              status: "confirmed",
            },
          ],
          recentPrescriptions: [
            {
              id: "pres1",
              medication: "Amoxicillin",
              dosage: "500mg",
              frequency: "3 times daily",
              doctor: "Dr. Sarah Johnson",
              date: new Date(Date.now() - 86400000 * 14), // 2 weeks ago
            },
            {
              id: "pres2",
              medication: "Lisinopril",
              dosage: "10mg",
              frequency: "Once daily",
              doctor: "Dr. Sarah Johnson",
              date: new Date(Date.now() - 86400000 * 30), // 1 month ago
            },
          ],
          prescriptionCount: 3,
          unreadMessages: 5,
          calendarAppointments: [],
          doctorUnavailability: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Handle booking a new appointment
  const handleBookAppointment = (newAppointment) => {
    // In a real app, this would save to the backend

    // Update local state to show the new appointment
    setDashboardData((prev) => ({
      ...prev,
      upcomingAppointments: [
        {
          id: `new-${Date.now()}`,
          doctor: newAppointment.doctorName || "Dr. Unknown",
          specialty: "Specialist",
          date: new Date(newAppointment.date),
          time: newAppointment.time,
          status: "pending",
        },
        ...prev.upcomingAppointments,
      ],
    }))

    // Show success notification
    setNotification({
      message: "Appointment booked successfully",
      isVisible: true,
    })
  }

  // Handle calendar date click
  const handleCalendarDateClick = (dateString) => {
    // Set the selected date and open the appointment modal
    setSelectedDate(dateString)
    setIsAppointmentModalOpen(true)
  }

  // Handle opening the appointment modal without a pre-selected date
  const handleOpenAppointmentModal = () => {
    setSelectedDate("") // Clear any previously selected date
    setIsAppointmentModalOpen(true)
  }

  // Handle closing the appointment modal
  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false)
    setSelectedDate("") // Clear the selected date when closing
  }

  // Health tips data
  const healthTips = [
    {
      icon: <Droplet className="h-5 w-5 text-blue-500" />,
      title: "Stay Hydrated",
      content: "Drink at least 8 glasses of water daily to maintain proper hydration.",
    },
    {
      icon: <Activity className="h-5 w-5 text-green-500" />,
      title: "Regular Exercise",
      content: "Aim for at least 30 minutes of moderate exercise 5 days a week.",
    },
    {
      icon: <Utensils className="h-5 w-5 text-orange-500" />,
      title: "Balanced Diet",
      content: "Include fruits, vegetables, whole grains, and lean proteins in your daily meals.",
    },
    {
      icon: <Moon className="h-5 w-5 text-purple-500" />,
      title: "Adequate Sleep",
      content: "Aim for 7-9 hours of quality sleep each night for optimal health.",
    },
    {
      icon: <Smile className="h-5 w-5 text-yellow-500" />,
      title: "Manage Stress",
      content: "Practice mindfulness, deep breathing, or meditation to reduce stress levels.",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Dashboard Header Banner */}
      <DashboardHeaderBanner userRole="patient" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-graphite md:text-3xl">Dashboard</h1>
        <button
          onClick={handleOpenAppointmentModal}
          className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-pale-stone bg-white p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats */}
          <div className="col-span-full grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Appointments */}
            <div className="group rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all duration-300 hover:border-soft-amber hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-drift-gray">Appointments</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber transition-all duration-300 group-hover:bg-soft-amber group-hover:text-white">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-graphite">{dashboardData.upcomingAppointments.length}</p>
              <p className="text-sm text-drift-gray">Upcoming</p>
            </div>

            {/* Prescriptions */}
            <div className="group rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all duration-300 hover:border-soft-amber hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-drift-gray">Prescriptions</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber transition-all duration-300 group-hover:bg-soft-amber group-hover:text-white">
                  <Pill className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-graphite">{dashboardData.prescriptionCount}</p>
              <p className="text-sm text-drift-gray">Active</p>
            </div>

            {/* Messages */}
            <div className="group rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all duration-300 hover:border-soft-amber hover:shadow-md relative">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-drift-gray">Messages</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber transition-all duration-300 group-hover:bg-soft-amber group-hover:text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-graphite">{dashboardData.unreadMessages}</p>
              <p className="text-sm text-drift-gray">Unread</p>

              {/* New message indicator */}
              {dashboardData.unreadMessages > 0 && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {dashboardData.unreadMessages}
                </span>
              )}
            </div>

            {/* Doctors */}
            <div className="group rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all duration-300 hover:border-soft-amber hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-drift-gray">Doctors</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber transition-all duration-300 group-hover:bg-soft-amber group-hover:text-white">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-graphite">{dashboardData.doctorInteractions.count}</p>
              <p className="text-sm text-drift-gray">Connected</p>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="col-span-full rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-1 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-soft-amber" />
                <h2 className="text-xl font-semibold text-graphite">Upcoming Appointments</h2>
              </div>
              <Link
                href="/dashboard/appointments"
                className="flex items-center text-sm font-medium text-soft-amber transition-colors hover:text-amber-600"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.upcomingAppointments.length > 0 ? (
                dashboardData.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col rounded-lg border border-pale-stone p-4 transition-all duration-300 hover:border-soft-amber/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-graphite">{appointment.doctor}</p>
                      <p className="text-sm text-drift-gray">{appointment.specialty}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-drift-gray">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span className="text-sm">{formatDateForDisplay(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-drift-gray">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${
                          appointment.status === "confirmed" || appointment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {appointment.status === "confirmed" || appointment.status === "approved" ? (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        ) : appointment.status === "pending" ? (
                          <Clock className="mr-1 h-3 w-3" />
                        ) : appointment.status === "cancelled" ? (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        ) : null}
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-pale-stone text-soft-amber">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <p className="text-drift-gray mb-2">No upcoming appointments</p>
                  <button
                    onClick={handleOpenAppointmentModal}
                    className="text-soft-amber transition-colors hover:text-amber-600 hover:underline"
                  >
                    Book your first appointment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-soft-amber" />
              <h2 className="text-xl font-semibold text-graphite">Calendar</h2>
            </div>
            <MiniCalendar
              patientAppointments={dashboardData.calendarAppointments}
              doctorUnavailability={dashboardData.doctorUnavailability}
              onDateClick={handleCalendarDateClick}
            />
          </div>

          {/* Recent Prescriptions */}
          <div className="col-span-full rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-1 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Pill className="mr-2 h-5 w-5 text-soft-amber" />
                <h2 className="text-xl font-semibold text-graphite">Recent Prescriptions</h2>
              </div>
              <Link
                href="/dashboard/prescriptions"
                className="flex items-center text-sm font-medium text-soft-amber transition-colors hover:text-amber-600"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.recentPrescriptions.length > 0 ? (
                dashboardData.recentPrescriptions.slice(0, 3).map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex flex-col rounded-lg border border-pale-stone p-4 transition-all duration-300 hover:border-soft-amber/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-graphite">{prescription.medication}</p>
                      <p className="text-sm text-drift-gray">
                        {prescription.dosage} - {prescription.frequency}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-drift-gray">
                        <User className="mr-1 h-4 w-4" />
                        <span className="text-sm">{prescription.doctor}</span>
                      </div>
                      <div className="flex items-center text-drift-gray">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span className="text-sm">{formatDateForDisplay(prescription.date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-pale-stone text-soft-amber">
                    <Pill className="h-8 w-8" />
                  </div>
                  <p className="text-drift-gray">No recent prescriptions</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Tips */}
          <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-soft-amber" />
                <h2 className="text-xl font-semibold text-graphite">Health Tips</h2>
              </div>
              <Link
                href="/dashboard/health-tips"
                className="flex items-center text-sm font-medium text-soft-amber transition-colors hover:text-amber-600"
              >
                View More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {healthTips.slice(0, 3).map((tip, index) => (
                <div
                  key={index}
                  className="group rounded-lg bg-pale-stone p-4 transition-all duration-300 hover:bg-soft-amber/10"
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                      {tip.icon}
                    </div>
                    <h3 className="font-medium text-graphite">{tip.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-drift-gray">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals and Notifications */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        userRole="patient"
        onBook={handleBookAppointment}
        connectedDoctors={dashboardData.doctorInteractions.doctors}
        initialDate={selectedDate} // Pass the selected date to the modal
      />

      <SuccessNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  )
}
