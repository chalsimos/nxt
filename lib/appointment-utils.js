import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  setDoc,
  limit,
} from "firebase/firestore"
import { db } from "./firebase"

// All possible time slots
const allTimeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
]

// Helper function to normalize date strings to prevent timezone issues
export const normalizeDate = (dateString) => {
  if (!dateString) return ""
  // Create a date object and extract year, month, day
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // getMonth() is zero-based
  const day = date.getDate()

  // Format as YYYY-MM-DD to ensure consistency
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}

// Helper function to format date for display
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    // Set initial status based on who created the appointment
    let initialStatus = "pending"

    // If a doctor creates an appointment, it's automatically approved
    if (appointmentData.createdBy === appointmentData.doctorId) {
      initialStatus = "approved"
    }

    // Normalize the date to prevent timezone issues
    const normalizedDate = normalizeDate(appointmentData.date)

    // Add appointment to Firestore
    const appointmentRef = await addDoc(collection(db, "appointments"), {
      ...appointmentData,
      date: normalizedDate, // Use normalized date
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: initialStatus, // Set initial status based on creator
      notifications: {
        patient: initialStatus === "approved", // Notify patient if doctor created and auto-approved
        doctor: initialStatus === "pending", // Notify doctor if patient created and needs approval
      },
    })

    return appointmentRef.id
  } catch (error) {
    console.error("Error creating appointment:", error)
    throw error
  }
}

// Get appointments for a specific user (patient or doctor)
export const getUserAppointments = (userId, userRole, callback) => {
  if (!userId) {
    console.error("User ID is required")
    callback([])
    return () => {}
  }

  try {
    // Query based on user role
    const fieldToQuery = userRole === "doctor" ? "doctorId" : "patientId"

    const q = query(collection(db, "appointments"), where(fieldToQuery, "==", userId), orderBy("date", "asc"))

    return onSnapshot(
      q,
      (querySnapshot) => {
        const appointments = []
        querySnapshot.forEach((doc) => {
          appointments.push({ id: doc.id, ...doc.data() })
        })
        callback(appointments)
      },
      (error) => {
        console.error("Error getting appointments:", error)
        callback([])
      },
    )
  } catch (error) {
    console.error("Error setting up appointments listener:", error)
    callback([])
    return () => {}
  }
}

// Get a specific appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    if (!appointmentId) {
      throw new Error("Appointment ID is required")
    }

    const appointmentDoc = await getDoc(doc(db, "appointments", appointmentId))

    if (appointmentDoc.exists()) {
      return { id: appointmentDoc.id, ...appointmentDoc.data() }
    } else {
      throw new Error("Appointment not found")
    }
  } catch (error) {
    console.error("Error getting appointment:", error)
    throw error
  }
}

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status, note = "") => {
  try {
    if (!appointmentId) {
      throw new Error("Appointment ID is required")
    }

    const appointmentRef = doc(db, "appointments", appointmentId)
    const appointmentDoc = await getDoc(appointmentRef)

    if (!appointmentDoc.exists()) {
      throw new Error("Appointment not found")
    }

    const appointmentData = appointmentDoc.data()
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
      notifications: {
        patient: true, // Patient needs to be notified of status change
        doctor: false, // Doctor made the change, so no notification needed
      },
    }

    // Add note if provided
    if (note) {
      updateData.note = note
    }

    // If cancelling, add cancellation timestamp
    if (status === "cancelled") {
      updateData.cancelledAt = serverTimestamp()
    }

    // If approving, add approval timestamp
    if (status === "approved") {
      updateData.approvedAt = serverTimestamp()
    }

    // If completing, add completion timestamp
    if (status === "completed") {
      updateData.completedAt = serverTimestamp()
    }

    await updateDoc(appointmentRef, updateData)

    return true
  } catch (error) {
    console.error("Error updating appointment status:", error)
    throw error
  }
}

// Reschedule an appointment
export const rescheduleAppointment = async (appointmentId, newDate, newTime, notes = "") => {
  try {
    if (!appointmentId || !newDate || !newTime) {
      throw new Error("Missing required parameters for rescheduling")
    }

    const appointmentRef = doc(db, "appointments", appointmentId)
    const appointmentDoc = await getDoc(appointmentRef)

    if (!appointmentDoc.exists()) {
      throw new Error("Appointment not found")
    }

    // Normalize the date to prevent timezone issues
    const normalizedDate = normalizeDate(newDate)

    // Prepare update data
    const updateData = {
      date: normalizedDate,
      time: newTime,
      status: "pending", // Reset to pending when rescheduled
      updatedAt: serverTimestamp(),
      rescheduledAt: serverTimestamp(),
      notifications: {
        patient: true,
        doctor: true,
      },
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes
    }

    await updateDoc(appointmentRef, updateData)

    return true
  } catch (error) {
    console.error("Error rescheduling appointment:", error)
    throw error
  }
}

// Get available time slots for a doctor on a specific date
export const getAvailableTimeSlots = async (doctorId, date) => {
  try {
    if (!doctorId || !date) {
      console.error("Missing required parameters for getAvailableTimeSlots")
      return {
        available: [],
        unavailable: [],
        isFullyBooked: false,
        isDateUnavailable: false,
        unavailableDates: [],
      }
    }

    // Normalize the date to prevent timezone issues
    const normalizedDate = normalizeDate(date)

    // Check if the date is unavailable for the doctor
    let unavailableDates = []
    try {
      const unavailableDatesDoc = await getDoc(doc(db, "doctorAvailability", doctorId))
      if (unavailableDatesDoc.exists()) {
        // Get the raw unavailable dates
        const rawUnavailableDates = unavailableDatesDoc.data().unavailableDates || []

        // Normalize each date to prevent timezone issues
        unavailableDates = rawUnavailableDates.map((d) => normalizeDate(d))
      }
    } catch (error) {
      console.error("Error getting doctor availability:", error)
      // Continue with empty unavailable dates if there's an error
    }

    // Check if the normalized date is unavailable
    if (unavailableDates.includes(normalizedDate)) {
      return {
        available: [],
        unavailable: [],
        isDateUnavailable: true,
        isFullyBooked: false,
        unavailableDates,
      }
    }

    // Get booked appointments for this doctor on this date
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId),
      where("date", "==", normalizedDate),
      where("status", "in", ["pending", "approved"]), // Only consider pending and approved appointments
    )

    const querySnapshot = await getDocs(q)
    const bookedTimeSlots = []

    querySnapshot.forEach((doc) => {
      bookedTimeSlots.push(doc.data().time)
    })

    // Filter out booked time slots
    const availableTimeSlots = allTimeSlots.filter((slot) => !bookedTimeSlots.includes(slot))

    // Create a list of unavailable slots with reasons
    const unavailableTimeSlots = bookedTimeSlots.map((slot) => ({
      time: slot,
      reason: "Already Booked",
    }))

    // Check if the day is fully booked
    const isFullyBooked = availableTimeSlots.length === 0 && bookedTimeSlots.length > 0

    return {
      available: availableTimeSlots,
      unavailable: unavailableTimeSlots,
      isFullyBooked,
      isDateUnavailable: false,
      unavailableDates,
    }
  } catch (error) {
    console.error("Error getting available time slots:", error)
    // Return empty results if there's an error
    return {
      available: [],
      unavailable: [],
      isFullyBooked: false,
      isDateUnavailable: false,
      unavailableDates: [],
    }
  }
}

// Set doctor availability
export const setDoctorAvailability = async (doctorId, unavailableDates) => {
  try {
    if (!doctorId) {
      throw new Error("Doctor ID is required")
    }

    // Normalize each date to prevent timezone issues
    const normalizedDates = unavailableDates.map((date) => normalizeDate(date))

    const availabilityRef = doc(db, "doctorAvailability", doctorId)

    await updateDoc(availabilityRef, {
      unavailableDates: normalizedDates,
      updatedAt: serverTimestamp(),
    }).catch(async (error) => {
      // If document doesn't exist, create it
      if (error.code === "not-found") {
        await setDoc(availabilityRef, {
          doctorId,
          unavailableDates: normalizedDates,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        throw error
      }
    })

    return true
  } catch (error) {
    console.error("Error setting doctor availability:", error)
    throw error
  }
}

// Get doctor availability
export const getDoctorAvailability = async (doctorId) => {
  try {
    if (!doctorId) {
      throw new Error("Doctor ID is required")
    }

    const availabilityDoc = await getDoc(doc(db, "doctorAvailability", doctorId))

    if (availabilityDoc.exists()) {
      return availabilityDoc.data().unavailableDates || []
    } else {
      return []
    }
  } catch (error) {
    console.error("Error getting doctor availability:", error)
    return [] // Return empty array on error
  }
}

// Get all doctors with their availability
export const getAllDoctors = async () => {
  try {
    // First, get all users with role "doctor"
    const q = query(collection(db, "users"), where("role", "==", "doctor"))
    const querySnapshot = await getDocs(q)
    const doctors = []

    // Process each doctor
    for (const docSnapshot of querySnapshot.docs) {
      const doctorData = docSnapshot.data()
      let availability = []

      // Try to get doctor's availability
      try {
        const unavailableDatesDoc = await getDoc(doc(db, "doctorAvailability", docSnapshot.id))
        if (unavailableDatesDoc.exists()) {
          availability = unavailableDatesDoc.data().unavailableDates || []
        }
      } catch (error) {
        console.error(`Error getting availability for doctor ${docSnapshot.id}:`, error)
        // Continue with empty availability
      }

      doctors.push({
        id: docSnapshot.id,
        name: doctorData.displayName || "Unknown Doctor",
        specialty: doctorData.specialty || "General Practitioner",
        photoURL: doctorData.photoURL || null,
        unavailableDates: availability,
      })
    }

    return doctors
  } catch (error) {
    console.error("Error getting all doctors:", error)
    return [] // Return empty array on error
  }
}

// Mark appointment notifications as read
export const markAppointmentNotificationsAsRead = async (appointmentId, userRole) => {
  try {
    if (!appointmentId || !userRole) {
      throw new Error("Appointment ID and user role are required")
    }

    const appointmentRef = doc(db, "appointments", appointmentId)
    const appointmentDoc = await getDoc(appointmentRef)

    if (!appointmentDoc.exists()) {
      throw new Error("Appointment not found")
    }

    const notifications = appointmentDoc.data().notifications || {}

    // Update only the notification for the current user role
    notifications[userRole] = false

    await updateDoc(appointmentRef, {
      notifications,
    })

    return true
  } catch (error) {
    console.error("Error marking appointment notifications as read:", error)
    throw error
  }
}

// Get appointment counts by status for a user
export const getAppointmentCounts = async (userId, userRole) => {
  try {
    if (!userId || !userRole) {
      throw new Error("User ID and role are required")
    }

    const fieldToQuery = userRole === "doctor" ? "doctorId" : "patientId"

    const q = query(collection(db, "appointments"), where(fieldToQuery, "==", userId))

    const querySnapshot = await getDocs(q)

    const counts = {
      upcoming: 0,
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    querySnapshot.forEach((doc) => {
      const appointment = doc.data()
      counts.total++

      // Count by status
      if (appointment.status) {
        counts[appointment.status]++
      }

      // Count upcoming (approved appointments with future dates)
      if (appointment.status === "approved") {
        const appointmentDate = new Date(appointment.date)
        if (appointmentDate >= today) {
          counts.upcoming++
        }
      }
    })

    return counts
  } catch (error) {
    console.error("Error getting appointment counts:", error)
    return {
      upcoming: 0,
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    } // Return empty counts on error
  }
}

// Get all available patients for doctor to message
export const getAvailablePatients = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "patient"), limit(50))

    const querySnapshot = await getDocs(q)
    const patients = []

    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() })
    })

    return patients
  } catch (error) {
    console.error("Error getting available patients:", error)
    return [] // Return empty array on error
  }
}
