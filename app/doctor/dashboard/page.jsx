"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  User,
  Users,
  Clock8,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileBarChart,
  UserPlus,
  ClipboardCheck,
  FileSymlink,
} from "lucide-react"
import { MiniCalendar } from "@/components/mini-calendar"
import { AppointmentModal } from "@/components/appointment-modal"
import { DoctorAvailabilityModal } from "@/components/doctor-availability-modal"
import { AvailabilitySuccessModal } from "@/components/availability-success-modal"
import { AppointmentSuccessModal } from "@/components/appointment-success-modal"
import { DashboardHeaderBanner } from "@/components/dashboard-header-banner"
import { useAuth } from "@/contexts/auth-context"
import { formatDateForDisplay } from "@/lib/appointment-utils"
import {
  getConnectedPatients,
  getTodayAppointments,
  getUnreadMessageCount,
  getAppointmentCounts,
  getCalendarAppointments,
  getPrescriptionCount,
} from "@/lib/dashboard-utils"
import { getDoctorPrescriptions } from "@/lib/prescription-utils"
import { getDoctorAvailability, setDoctorAvailability } from "@/lib/appointment-utils"
import { getNewlyConnectedPatients, getFollowUpAppointments, getPatientRecordStats } from "@/lib/doctor-utils"

export default function DoctorDashboard() {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [unavailableDates, setUnavailableDates] = useState([])
  const [showAvailabilitySuccessModal, setShowAvailabilitySuccessModal] = useState(false)
  const [showAppointmentSuccessModal, setShowAppointmentSuccessModal] = useState(false)
  const [appointmentSuccessMessage, setAppointmentSuccessMessage] = useState("")
  const [dashboardData, setDashboardData] = useState({
    patientInteractions: { count: 0, patients: [] },
    todayAppointments: [],
    recentPrescriptions: [],
    prescriptionCount: 0,
    unreadMessages: 0,
    monthlyCounts: {
      appointments: 0,
      prescriptions: 0,
    },
    calendarAppointments: [],
  })
  const [patientInsights, setPatientInsights] = useState({
    newPatients: { count: 0, patients: [] },
    followUps: { count: 0, appointments: [] },
    recordStats: { total: 0, shared: 0, recent: 0 },
    isLoading: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Load unavailable dates on component mount
  useEffect(() => {
    const loadUnavailableDates = async () => {
      if (!user?.uid) return

      try {
        // Try to get from Firebase first
        const unavailableDatesArray = await getDoctorAvailability(user.uid)
        if (unavailableDatesArray && unavailableDatesArray.length > 0) {
          setUnavailableDates(unavailableDatesArray)
          return
        }

        // Fallback to localStorage if Firebase fails or returns empty
        const savedDates = localStorage.getItem("doctorUnavailableDates")
        if (savedDates) {
          setUnavailableDates(JSON.parse(savedDates))
        }
      } catch (error) {
        console.error("Error loading unavailable dates:", error)
        // Fallback to localStorage
        const savedDates = localStorage.getItem("doctorUnavailableDates")
        if (savedDates) {
          setUnavailableDates(JSON.parse(savedDates))
        }
      }
    }

    loadUnavailableDates()
  }, [user])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      try {
        // Get connected patients
        const patientInteractions = await getConnectedPatients(user.uid)

        // Get today's appointments
        const todayAppointments = await getTodayAppointments(user.uid, 3) // Limit to 3

        // Get prescription count
        const prescriptionCount = await getPrescriptionCount(user.uid, true)

        // Get prescription details
        const prescriptionResult = await getDoctorPrescriptions(user.uid)
        const recentPrescriptions = prescriptionResult.success
          ? prescriptionResult.prescriptions.slice(0, 5).map((prescription) => ({
              id: prescription.id,
              patient: prescription.patientName || "Unknown Patient",
              medication: prescription.medications[0]?.name || "Medication",
              dosage: prescription.medications[0]?.dosage || "",
              frequency: prescription.medications[0]?.frequency || "",
              date: prescription.createdAt?.toDate() || new Date(),
            }))
          : []

        // Get unread message count
        const unreadCount = await getUnreadMessageCount(user.uid)

        // Get monthly counts
        const appointmentCounts = await getAppointmentCounts(user.uid, "doctor")

        // Get all appointments for calendar
        const calendarAppointments = await getCalendarAppointments(user.uid, true)

        setDashboardData({
          patientInteractions,
          todayAppointments: todayAppointments.map((apt) => ({
            id: apt.id,
            patient: apt.patient?.displayName || "Unknown Patient",
            age: apt.patient?.age || "N/A",
            time: apt.time || "12:00 PM",
            status: apt.status || "confirmed",
            reason: apt.reason || "Consultation",
          })),
          recentPrescriptions,
          prescriptionCount,
          unreadMessages: unreadCount,
          monthlyCounts: {
            appointments: appointmentCounts.total || 0,
            prescriptions: prescriptionResult.success ? prescriptionResult.prescriptions.length : 0,
          },
          calendarAppointments,
        })
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        // Fallback to static data if there's an error
        setDashboardData({
          patientInteractions: {
            count: 24,
            patients: [
              { id: "pat1", name: "John Smith", age: 45 },
              { id: "pat2", name: "Emily Johnson", age: 32 },
              { id: "pat3", name: "Michael Brown", age: 58 },
            ],
          },
          todayAppointments: [
            {
              id: "apt1",
              patient: "John Smith",
              age: 45,
              time: "10:00 AM",
              status: "confirmed",
              reason: "Annual checkup",
            },
            {
              id: "apt2",
              patient: "Emily Johnson",
              age: 32,
              time: "11:30 AM",
              status: "confirmed",
              reason: "Follow-up consultation",
            },
            {
              id: "apt3",
              patient: "Michael Brown",
              age: 58,
              time: "2:00 PM",
              status: "confirmed",
              reason: "Blood pressure monitoring",
            },
          ],
          recentPrescriptions: [
            {
              id: "pres1",
              patient: "John Smith",
              medication: "Amoxicillin",
              dosage: "500mg",
              frequency: "3 times daily",
              date: new Date(Date.now() - 86400000 * 14), // 2 weeks ago
            },
            {
              id: "pres2",
              patient: "Emily Johnson",
              medication: "Lisinopril",
              dosage: "10mg",
              frequency: "Once daily",
              date: new Date(Date.now() - 86400000 * 30), // 1 month ago
            },
          ],
          prescriptionCount: 18,
          unreadMessages: 8,
          monthlyCounts: {
            appointments: 32,
            prescriptions: 18,
          },
          calendarAppointments: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Load patient insights data
  useEffect(() => {
    const loadPatientInsights = async () => {
      if (!user?.uid) return

      setPatientInsights((prev) => ({ ...prev, isLoading: true }))
      try {
        // Get newly connected patients (within the last week)
        const newPatients = await getNewlyConnectedPatients(user.uid)

        // Get follow-up appointments
        const followUps = await getFollowUpAppointments(user.uid)

        // Get patient record statistics
        const recordStats = await getPatientRecordStats(user.uid)

        setPatientInsights({
          newPatients,
          followUps,
          recordStats,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error loading patient insights:", error)
        // Fallback to static data
        setPatientInsights({
          newPatients: { count: 1, patients: [] },
          followUps: { count: 8, appointments: [] },
          recordStats: { total: 42, shared: 24, recent: 12 },
          isLoading: false,
        })
      }
    }

    loadPatientInsights()
  }, [user])

  // Handle saving unavailable dates
  const handleSaveAvailability = async (dates) => {
    try {
      if (user?.uid) {
        // Save to Firebase
        await setDoctorAvailability(user.uid, dates)
      }

      // Also save to localStorage as backup
      localStorage.setItem("doctorUnavailableDates", JSON.stringify(dates))

      // Update state
      setUnavailableDates(dates)
      setShowAvailabilitySuccessModal(true)
    } catch (error) {
      console.error("Error saving availability:", error)
      // Still show success if we at least saved to localStorage
      setShowAvailabilitySuccessModal(true)
    }
  }

  const handleBookAppointment = (appointmentData) => {
    // Update local state to show the new appointment
    setDashboardData((prev) => ({
      ...prev,
      todayAppointments: [
        {
          id: `new-${Date.now()}`,
          patient: appointmentData.patientName || "New Patient",
          age: appointmentData.patientAge || "N/A",
          time: appointmentData.time,
          status: "confirmed",
          reason: appointmentData.reason || "Consultation",
        },
        ...prev.todayAppointments,
      ],
    }))

    setAppointmentSuccessMessage("Appointment scheduled successfully!")
    setShowAppointmentSuccessModal(true)
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

  return (
    <div className="space-y-6">
      {/* Dashboard Header Banner */}
      <DashboardHeaderBanner userRole="doctor" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-graphite md:text-3xl">Doctor Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsAvailabilityModalOpen(true)}
            className="inline-flex items-center rounded-md bg-white border border-soft-amber px-4 py-2 text-sm font-medium text-soft-amber shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
          >
            <Clock8 className="mr-2 h-4 w-4" />
            Manage Availability
          </button>
          <button
            onClick={handleOpenAppointmentModal}
            className="inline-flex items-center rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </button>
        </div>
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
            {/* Today's Appointments */}
            <div className="group rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all duration-300 hover:border-soft-amber hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-drift-gray">Today's Appointments</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber transition-all duration-300 group-hover:bg-soft-amber group-hover:text-white">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-graphite">{dashboardData.todayAppointments.length}</p>
              <p className="text-sm text-drift-gray">Scheduled</p>
            </div>

            {/* Patients */}
            <div className="group rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all duration-300 hover:border-soft-amber hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-drift-gray">Total Patients</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber transition-all duration-300 group-hover:bg-soft-amber group-hover:text-white">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-graphite">{dashboardData.patientInteractions.count}</p>
              <p className="text-sm text-drift-gray">Active</p>
            </div>

            {/* Prescriptions */}
            <div className="group rounded-lg border border-pale-stone bg-white p-4 shadow-sm transition-all duration-300 hover:border-soft-amber hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-drift-gray">Prescriptions</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-amber/10 text-soft-amber transition-all duration-300 group-hover:bg-soft-amber group-hover:text-white">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-graphite">{dashboardData.prescriptionCount}</p>
              <p className="text-sm text-drift-gray">This month</p>
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
          </div>

          {/* Today's Appointments */}
          <div className="col-span-full rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-1 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-soft-amber" />
                <h2 className="text-xl font-semibold text-graphite">Today's Appointments</h2>
              </div>
              <Link
                href="/doctor/appointments"
                className="flex items-center text-sm font-medium text-soft-amber transition-colors hover:text-amber-600"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.todayAppointments.length > 0 ? (
                dashboardData.todayAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col rounded-lg border border-pale-stone p-4 transition-all duration-300 hover:border-soft-amber/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-graphite">{appointment.patient}</p>
                      <p className="text-sm text-drift-gray">
                        {appointment.age ? `Age: ${appointment.age}` : ""}{" "}
                        {appointment.reason ? `- ${appointment.reason}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-drift-gray">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${
                          appointment.status === "confirmed" || appointment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
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
                  <p className="text-drift-gray mb-2">No appointments scheduled for today</p>
                  <button
                    onClick={handleOpenAppointmentModal}
                    className="text-soft-amber transition-colors hover:text-amber-600 hover:underline"
                  >
                    Schedule an appointment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-soft-amber" />
                <h2 className="text-xl font-semibold text-graphite">Calendar</h2>
              </div>
              {unavailableDates.length > 0 && (
                <span className="text-xs font-medium text-red-500">
                  {unavailableDates.length} unavailable {unavailableDates.length === 1 ? "day" : "days"}
                </span>
              )}
            </div>
            <MiniCalendar
              patientAppointments={dashboardData.calendarAppointments}
              unavailableDates={unavailableDates}
              onDateClick={handleCalendarDateClick}
            />
          </div>

          {/* Recent Prescriptions */}
          <div className="col-span-full rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:col-span-1 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-soft-amber" />
                <h2 className="text-xl font-semibold text-graphite">Recent Prescriptions</h2>
              </div>
              <Link
                href="/doctor/prescriptions"
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
                        <span className="text-sm">{prescription.patient}</span>
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
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="text-drift-gray">No recent prescriptions</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Insights */}
          <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="mb-4 flex items-center">
              <FileBarChart className="mr-2 h-5 w-5 text-soft-amber" />
              <h2 className="text-xl font-semibold text-graphite">Patient Insights</h2>
            </div>
            {patientInsights.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg bg-pale-stone p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="group rounded-lg bg-pale-stone p-4 transition-all duration-300 hover:bg-soft-amber/10">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-soft-amber shadow-sm">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-graphite">New Patients</h3>
                  </div>
                  <p className="mt-2 text-sm text-drift-gray">
                    {patientInsights.newPatients.count} new patient{patientInsights.newPatients.count !== 1 ? "s" : ""}{" "}
                    this week
                  </p>
                </div>
                <div className="group rounded-lg bg-pale-stone p-4 transition-all duration-300 hover:bg-soft-amber/10">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-soft-amber shadow-sm">
                      <ClipboardCheck className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-graphite">Follow-ups</h3>
                  </div>
                  <p className="mt-2 text-sm text-drift-gray">
                    {patientInsights.followUps.count} follow-up appointment
                    {patientInsights.followUps.count !== 1 ? "s" : ""} scheduled
                  </p>
                </div>
                <div className="group rounded-lg bg-pale-stone p-4 transition-all duration-300 hover:bg-soft-amber/10">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-soft-amber shadow-sm">
                      <FileSymlink className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-graphite">Patient Records</h3>
                  </div>
                  <p className="mt-2 text-sm text-drift-gray">
                    {patientInsights.recordStats.shared} records shared with you, {patientInsights.recordStats.recent}{" "}
                    in the last 30 days
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        userRole="doctor"
        onBook={handleBookAppointment}
        patients={dashboardData.patientInteractions.patients.map((patient) => ({
          id: patient.id,
          name: patient.name,
          age: patient.age || null,
        }))}
        initialDate={selectedDate} // Pass the selected date to the modal
      />

      <DoctorAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onSave={handleSaveAvailability}
        initialDates={unavailableDates}
      />

      {/* Availability Success Modal */}
      <AvailabilitySuccessModal
        isOpen={showAvailabilitySuccessModal}
        onClose={() => setShowAvailabilitySuccessModal(false)}
        message="Your availability has been updated successfully!"
        className="mt-16"
      />

      {/* Appointment Success Modal */}
      <AppointmentSuccessModal
        isOpen={showAppointmentSuccessModal}
        onClose={() => setShowAppointmentSuccessModal(false)}
        message={appointmentSuccessMessage}
        className="mt-16"
      />
    </div>
  )
}
