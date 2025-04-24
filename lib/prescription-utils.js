import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { db } from "./firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore"

// Function to calculate age from birthdate
export const calculateAge = (birthdate) => {
  if (!birthdate) return "N/A"

  try {
    const today = new Date()
    const birthDate = new Date(birthdate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDifference = today.getMonth() - birthDate.getMonth()

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age.toString()
  } catch (error) {
    console.error("Error calculating age:", error)
    return "N/A"
  }
}

// Function to format date as Month DD, YYYY
export const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString("en-US", options)
}

// Function to generate prescription PDF
export const generatePrintablePrescription = (prescription, doctorInfo, patientInfo) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5", // Standard prescription size (148mm x 210mm)
  })

  // Add Rx logo
  const rxLogo = "Rx"

  doc.setFont("helvetica", "bold")
  doc.setFontSize(24)
  doc.text(rxLogo, 15, 20)

  // Add header
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Dr. " + doctorInfo.name, 148 / 2, 15, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(doctorInfo.specialty, 148 / 2, 20, { align: "center" })
  doc.text(`PRC #${doctorInfo.licenseNumber}`, 148 / 2, 25, { align: "center" })
  doc.text(doctorInfo.clinicAddress, 148 / 2, 30, { align: "center" })
  doc.text(doctorInfo.contactNumber, 148 / 2, 35, { align: "center" })

  // Add separator line
  doc.setLineWidth(0.5)
  doc.line(10, 40, 138, 40)

  // Add date
  doc.text(`Date: ${formatDate(new Date())}`, 10, 50)

  // Add patient info
  doc.text(`Patient Name: ${patientInfo.name}`, 10, 60)
  doc.text(`Age: ${patientInfo.age}    Sex: ${patientInfo.gender}`, 10, 65)

  // Add Rx symbol
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Rx:", 10, 75)

  // Add medications
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  let yPosition = 85
  prescription.medications.forEach((med, index) => {
    doc.text(`${index + 1}. ${med.name}`, 15, yPosition)
    yPosition += 5
    doc.text(`   ${med.dosage}, ${med.frequency}, ${med.duration}`, 15, yPosition)
    yPosition += 5
    if (med.instructions) {
      doc.text(`   (${med.instructions})`, 15, yPosition)
      yPosition += 10
    } else {
      yPosition += 5
    }
  })

  // Add signature
  yPosition += 10
  doc.text("Signature: ____________________", 10, yPosition)
  yPosition += 5

  // Add license info
  doc.text(`License No.: PRC ${doctorInfo.licenseNumber}`, 10, yPosition)
  yPosition += 5
  doc.text(`PTR No.: ${doctorInfo.ptrNumber}`, 10, yPosition)
  yPosition += 5
  doc.text(`S2 No.: ${doctorInfo.s2Number}`, 10, yPosition)

  // Add footer line
  doc.setLineWidth(0.5)
  doc.line(10, 190, 138, 190)

  // Add footer text
  doc.setFontSize(8)
  doc.text("This prescription is electronically generated via Smart Care Health System", 148 / 2, 195, {
    align: "center",
  })

  return doc
}

// Function to save prescription template
export const savePrescriptionTemplate = async (templateData, userId) => {
  try {
    // In a real app, this would save to a database
    console.log("Saving template:", templateData)
    // Mock successful save
    return {
      success: true,
      templateId: `template_${Date.now()}`,
      message: "Template saved successfully",
    }
  } catch (error) {
    console.error("Error saving template:", error)
    return {
      success: false,
      message: "Failed to save template",
    }
  }
}

// Get doctor's prescriptions
export const getDoctorPrescriptions = async (doctorId) => {
  try {
    // Query prescriptions for this doctor
    const prescriptionsQuery = query(collection(db, "prescriptions"), where("doctorId", "==", doctorId))

    const prescriptionsSnapshot = await getDocs(prescriptionsQuery)

    // Convert snapshot to array of prescription objects
    const prescriptions = []
    prescriptionsSnapshot.forEach((doc) => {
      const prescriptionData = doc.data()
      // Only include prescriptions that are not deleted
      if (prescriptionData.status !== "deleted") {
        prescriptions.push({
          id: doc.id,
          ...prescriptionData,
        })
      }
    })

    return {
      success: true,
      prescriptions: prescriptions,
    }
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error)
    return {
      success: false,
      message: "Failed to fetch prescriptions",
      prescriptions: [],
    }
  }
}

// Get patient's prescriptions
export const getPatientPrescriptions = async (patientId) => {
  try {
    // Query prescriptions for this patient
    const prescriptionsQuery = query(collection(db, "prescriptions"), where("patientId", "==", patientId))

    const prescriptionsSnapshot = await getDocs(prescriptionsQuery)

    // Convert snapshot to array of prescription objects
    const prescriptions = []
    prescriptionsSnapshot.forEach((doc) => {
      const prescriptionData = doc.data()
      // Only include prescriptions that are not deleted
      if (prescriptionData.status !== "deleted") {
        prescriptions.push({
          id: doc.id,
          ...prescriptionData,
        })
      }
    })

    return {
      success: true,
      prescriptions: prescriptions,
    }
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error)
    return {
      success: false,
      message: "Failed to fetch prescriptions",
      prescriptions: [],
    }
  }
}

// Update prescription
export const updatePrescription = async (prescriptionId, updateData) => {
  try {
    const prescriptionRef = doc(db, "prescriptions", prescriptionId)
    await updateDoc(prescriptionRef, updateData)

    return {
      success: true,
      message: "Prescription updated successfully",
    }
  } catch (error) {
    console.error("Error updating prescription:", error)
    return {
      success: false,
      message: "Failed to update prescription",
    }
  }
}

// Delete prescription
export const deletePrescription = async (prescriptionId) => {
  try {
    // In a real app, you might want to soft delete by updating a status field
    // or implement proper deletion logic
    const prescriptionRef = doc(db, "prescriptions", prescriptionId)
    await updateDoc(prescriptionRef, { status: "deleted" })

    return {
      success: true,
      message: "Prescription deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting prescription:", error)
    return {
      success: false,
      message: "Failed to delete prescription",
    }
  }
}

// Check if a doctor has consulted with a patient
export const checkPatientConsultation = async (doctorId, patientId) => {
  try {
    // Check if there's an appointment between the doctor and patient
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId),
      where("patientId", "==", patientId),
    )

    const appointmentsSnapshot = await getDocs(appointmentsQuery)

    if (!appointmentsSnapshot.empty) {
      return {
        hasConsulted: true,
        message: "Consultation verified",
      }
    } else {
      return {
        hasConsulted: false,
        message: "No prior consultation found. Please schedule an appointment first.",
      }
    }
  } catch (error) {
    console.error("Error checking consultation:", error)
    return {
      hasConsulted: false,
      message: "Error verifying consultation",
    }
  }
}

// Get all patients connected to a doctor
export const getDoctorPatients = async (doctorId) => {
  try {
    // Query appointments to find patients connected to this doctor
    const appointmentsQuery = query(collection(db, "appointments"), where("doctorId", "==", doctorId))
    const appointmentsSnapshot = await getDocs(appointmentsQuery)

    // Get unique patient IDs from appointments
    const patientIds = new Set()
    appointmentsSnapshot.forEach((doc) => {
      const appointment = doc.data()
      if (appointment.patientId) {
        patientIds.add(appointment.patientId)
      }
    })

    // Fetch complete patient information from users collection
    const patients = []
    for (const patientId of patientIds) {
      try {
        const userDoc = await getDoc(doc(db, "users", patientId))

        if (userDoc.exists()) {
          const userData = userDoc.data()

          // Calculate age from DOB if available
          const age = userData.dob ? calculateAge(userData.dob) : "N/A"

          patients.push({
            id: patientId,
            name: userData.displayName || "Unknown Patient",
            age: age,
            gender: userData.gender || "N/A",
            birthdate: userData.dob || null,
          })
        } else {
          // Fallback if user document doesn't exist
          patients.push({
            id: patientId,
            name: "Unknown Patient",
            age: "N/A",
            gender: "N/A",
            birthdate: null,
          })
        }
      } catch (error) {
        console.error(`Error fetching patient ${patientId}:`, error)
      }
    }

    return {
      success: true,
      patients: patients,
    }
  } catch (error) {
    console.error("Error getting connected patients:", error)
    return {
      success: false,
      message: "Failed to get connected patients",
      patients: [],
    }
  }
}

// Save a new prescription
export const savePrescription = async (prescriptionData) => {
  try {
    // Add prescription to Firestore
    const prescriptionRef = await addDoc(collection(db, "prescriptions"), {
      ...prescriptionData,
      createdAt: serverTimestamp(),
    })

    return {
      success: true,
      prescriptionId: prescriptionRef.id,
      message: "Prescription saved successfully",
    }
  } catch (error) {
    console.error("Error saving prescription:", error)
    return {
      success: false,
      message: "Failed to save prescription",
    }
  }
}

// Generate PDF for prescription
export const generatePrescriptionPDF = (prescription, doctorInfo, patientInfo) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5", // Standard prescription size (148mm x 210mm)
  })

  // Add Rx logo
  const rxLogo = "Rx"
  doc.setFont("helvetica", "bold")
  doc.setFontSize(24)
  doc.text(rxLogo, 15, 20)

  // Add header
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Dr. " + doctorInfo.name, 148 / 2, 15, { align: "center" })

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(doctorInfo.specialty, 148 / 2, 20, { align: "center" })
  doc.text(`PRC #${doctorInfo.licenseNumber}`, 148 / 2, 25, { align: "center" })
  doc.text(doctorInfo.clinicAddress, 148 / 2, 30, { align: "center" })
  doc.text(doctorInfo.contactNumber, 148 / 2, 35, { align: "center" })

  // Add separator line
  doc.setLineWidth(0.5)
  doc.line(10, 40, 138, 40)

  // Add date
  doc.text(`Date: ${formatDate(new Date())}`, 10, 50)

  // Add patient info
  doc.text(`Patient Name: ${patientInfo.name}`, 10, 60)
  doc.text(`Age: ${patientInfo.age}    Sex: ${patientInfo.gender}`, 10, 65)

  // Add Rx symbol
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Rx:", 10, 75)

  // Add medications
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  let yPosition = 85
  prescription.medications.forEach((med, index) => {
    doc.text(`${index + 1}. ${med.name}`, 15, yPosition)
    yPosition += 5
    doc.text(`   ${med.dosage}, ${med.frequency}, ${med.duration}`, 15, yPosition)
    yPosition += 5
    if (med.instructions) {
      doc.text(`   (${med.instructions})`, 15, yPosition)
      yPosition += 10
    } else {
      yPosition += 5
    }
  })

  // Add signature
  yPosition += 10
  if (prescription.signature) {
    // If there's a signature image, add it
    try {
      doc.addImage(prescription.signature, "PNG", 10, yPosition, 40, 20)
      yPosition += 25
    } catch (error) {
      console.error("Error adding signature image:", error)
      doc.text("Signature: ____________________", 10, yPosition)
      yPosition += 5
    }
  } else {
    doc.text("Signature: ____________________", 10, yPosition)
    yPosition += 5
  }

  // Add license info
  doc.text(`License No.: PRC ${doctorInfo.licenseNumber}`, 10, yPosition)
  yPosition += 5
  doc.text(`PTR No.: ${doctorInfo.ptrNumber}`, 10, yPosition)
  yPosition += 5
  doc.text(`S2 No.: ${doctorInfo.s2Number}`, 10, yPosition)

  // Add footer line
  doc.setLineWidth(0.5)
  doc.line(10, 190, 138, 190)

  // Add footer text
  doc.setFontSize(8)
  doc.text("This prescription is electronically generated via Smart Care Health System", 148 / 2, 195, {
    align: "center",
  })

  return doc
}
