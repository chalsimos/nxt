import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Function to calculate age from birthdate
export const calculateAge = (birthdate) => {
  const today = new Date()
  const birthDate = new Date(birthdate)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// Function to format date as Month DD, YYYY
export const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString("en-US", options)
}

// Function to generate prescription PDF
export const generatePrescriptionPDF = (prescription, doctorInfo, patientInfo) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5", // Standard prescription size (148mm x 210mm)
  })

  // Add Rx logo
  const rxLogo = `
    R
    x
  `
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

  // Add signature image if available
  if (prescription.signature) {
    try {
      doc.addImage(prescription.signature, "PNG", 10, yPosition, 50, 15)
      yPosition += 20
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
      doc.text("Signature: ____________________", 10, yPosition)
      yPosition += 15
    }
  } else {
    doc.text("Signature: ____________________", 10, yPosition)
    yPosition += 15
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
