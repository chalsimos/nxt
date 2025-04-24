import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs, // Import getDocs
} from "firebase/firestore"
import { db } from "./firebase"

// Maximum file size in bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Check if file size is valid
export const isFileSizeValid = (file) => {
  return file.size <= MAX_FILE_SIZE
}

// Check if file type is allowed
export const isFileTypeAllowed = (file) => {
  return ALLOWED_FILE_TYPES.includes(file.type)
}

// Get file type category
export const getFileTypeCategory = (file) => {
  const type = file.type

  if (type.startsWith("image/")) return "Image"
  if (type === "application/pdf") return "PDF"
  if (
    type.startsWith("application/msword") ||
    type.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  )
    return "Document"
  if (
    type.startsWith("application/vnd.ms-excel") ||
    type.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  )
    return "Spreadsheet"

  return "Other"
}

// Update the uploadMedicalRecord function to handle errors better
export const uploadMedicalRecord = async (userId, recordData) => {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    // Add record to Firestore
    const recordRef = await addDoc(collection(db, "medicalRecords"), {
      patientId: userId,
      name: recordData.name,
      type: recordData.type,
      fileType: recordData.fileType,
      fileData: recordData.fileData,
      fileSize: recordData.fileSize,
      date: recordData.date,
      notes: recordData.notes || "",
      uploadedDate: serverTimestamp(),
      sharedWith: [], // Initialize empty array of doctors with access
      doctorNotes: [], // Initialize empty array for doctor notes
    })

    return recordRef.id
  } catch (error) {
    console.error("Error uploading medical record:", error)
    throw error
  }
}

// Get medical records for a patient
export const getPatientMedicalRecords = (patientId, callback) => {
  try {
    const q = query(
      collection(db, "medicalRecords"),
      where("patientId", "==", patientId),
      orderBy("uploadedDate", "desc"),
    )

    return onSnapshot(
      q,
      (querySnapshot) => {
        const records = []
        querySnapshot.forEach((doc) => {
          // Don't include the full file data in the list to reduce payload size
          const data = doc.data()
          const record = {
            id: doc.id,
            name: data.name,
            type: data.type,
            fileType: data.fileType,
            fileSize: data.fileSize,
            date: data.date,
            notes: data.notes,
            uploadedDate: data.uploadedDate?.toDate() || new Date(),
            sharedWith: data.sharedWith || [],
            doctorNotes: data.doctorNotes || [],
            // Include a thumbnail for images, but not the full data
            thumbnail: data.fileType.startsWith("image/") ? data.fileData : null,
          }
          records.push(record)
        })
        callback(records)
      },
      (error) => {
        console.error("Error getting medical records:", error)
        callback([])
      },
    )
  } catch (error) {
    console.error("Error setting up medical records listener:", error)
    callback([])
    return () => {}
  }
}

// Get all medical records from connected patients
export const getAllPatientsMedicalRecords = (doctorId, callback) => {
  try {
    // Get all medical records
    const q = query(collection(db, "medicalRecords"), orderBy("uploadedDate", "desc"))

    return onSnapshot(
      q,
      (querySnapshot) => {
        const records = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          // Only include records that are explicitly shared with this doctor
          if (data.sharedWith && data.sharedWith.includes(doctorId)) {
            const record = {
              id: doc.id,
              patientId: data.patientId,
              patientName: data.patientName,
              name: data.name,
              type: data.type,
              fileType: data.fileType,
              fileSize: data.fileSize,
              date: data.date,
              notes: data.notes,
              uploadedDate: data.uploadedDate?.toDate() || new Date(),
              sharedWith: data.sharedWith || [],
              doctorNotes: data.doctorNotes || [],
              // Include a thumbnail for images, but not the full data
              thumbnail: data.fileType.startsWith("image/") ? data.fileData : null,
            }
            records.push(record)
          }
        })
        callback(records)
      },
      (error) => {
        console.error("Error getting medical records:", error)
        callback([])
      },
    )
  } catch (error) {
    console.error("Error setting up medical records listener:", error)
    callback([])
    return () => {}
  }
}

// Get a specific medical record by ID
export const getMedicalRecordById = async (recordId) => {
  try {
    const recordDoc = await getDoc(doc(db, "medicalRecords", recordId))

    if (recordDoc.exists()) {
      const data = recordDoc.data()
      return {
        id: recordDoc.id,
        ...data,
        uploadedDate: data.uploadedDate?.toDate() || new Date(),
        sharedWith: data.sharedWith || [],
        doctorNotes: data.doctorNotes || [],
      }
    } else {
      throw new Error("Medical record not found")
    }
  } catch (error) {
    console.error("Error getting medical record:", error)
    throw error
  }
}

// Delete a medical record
export const deleteMedicalRecord = async (recordId) => {
  try {
    await deleteDoc(doc(db, "medicalRecords", recordId))
    return true
  } catch (error) {
    console.error("Error deleting medical record:", error)
    throw error
  }
}

// Check if a doctor has explicit access to a patient's records
export const checkDoctorRecordAccess = async (doctorId, recordId) => {
  try {
    const recordDoc = await getDoc(doc(db, "medicalRecords", recordId))

    if (!recordDoc.exists()) {
      return false
    }

    const data = recordDoc.data()
    return data.sharedWith && data.sharedWith.includes(doctorId)
  } catch (error) {
    console.error("Error checking doctor record access:", error)
    return false
  }
}

// Get medical records for a specific patient (for doctor view)
export const getPatientMedicalRecordsForDoctor = (doctorId, patientId, callback) => {
  try {
    // Set up listener for records
    const q = query(
      collection(db, "medicalRecords"),
      where("patientId", "==", patientId),
      orderBy("uploadedDate", "desc"),
    )

    return onSnapshot(
      q,
      (querySnapshot) => {
        const records = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()

          // Only include records that are explicitly shared with this doctor
          if (data.sharedWith && data.sharedWith.includes(doctorId)) {
            const record = {
              id: doc.id,
              name: data.name,
              type: data.type,
              fileType: data.fileType,
              fileSize: data.fileSize,
              date: data.date,
              notes: data.notes,
              uploadedDate: data.uploadedDate?.toDate() || new Date(),
              sharedWith: data.sharedWith || [],
              doctorNotes: data.doctorNotes || [],
              // Include a thumbnail for images, but not the full data
              thumbnail: data.fileType.startsWith("image/") ? data.fileData : null,
              // Flag to indicate if this doctor has access
              hasAccess: data.sharedWith && data.sharedWith.includes(doctorId),
            }
            records.push(record)
          }
        })
        callback(records)
      },
      (error) => {
        console.error("Error getting medical records for doctor:", error)
        callback([])
      },
    )
  } catch (error) {
    console.error("Error setting up patient medical records for doctor:", error)
    callback([])
    return () => {}
  }
}

// Share a record with a doctor
export const shareRecordWithDoctor = async (recordId, doctorId, patientName) => {
  try {
    const recordRef = doc(db, "medicalRecords", recordId)
    const recordDoc = await getDoc(recordRef)

    if (!recordDoc.exists()) {
      throw new Error("Record not found")
    }

    // Get the patient data to include in the record
    const patientId = recordDoc.data().patientId
    const patientDoc = await getDoc(doc(db, "users", patientId))
    const patientData = patientDoc.exists() ? patientDoc.data() : {}

    // Update the record's sharedWith array and add patient info
    await updateDoc(recordRef, {
      sharedWith: arrayUnion(doctorId),
      patientName: patientName || patientData.displayName || "Patient",
    })

    // Create a notification for the doctor
    await addDoc(collection(db, "notifications"), {
      userId: doctorId,
      type: "record_shared",
      message: `${patientName} has shared a medical record with you`,
      recordId: recordId,
      createdAt: serverTimestamp(),
      read: false,
    })

    return true
  } catch (error) {
    console.error("Error sharing record with doctor:", error)
    throw error
  }
}

// Unshare a record with a doctor
export const unshareRecordWithDoctor = async (recordId, doctorId) => {
  try {
    const recordRef = doc(db, "medicalRecords", recordId)

    // Remove doctor from sharedWith array
    await updateDoc(recordRef, {
      sharedWith: arrayRemove(doctorId),
    })

    return true
  } catch (error) {
    console.error("Error unsharing record with doctor:", error)
    throw error
  }
}

// Add a doctor note to a record
export const addDoctorNoteToRecord = async (recordId, doctorId, doctorName, note) => {
  try {
    // Check if doctor has access to this record
    const hasAccess = await checkDoctorRecordAccess(doctorId, recordId)

    if (!hasAccess) {
      throw new Error("You don't have permission to add notes to this record")
    }

    const recordRef = doc(db, "medicalRecords", recordId)

    // Add note to doctorNotes array
    await updateDoc(recordRef, {
      doctorNotes: arrayUnion({
        doctorId,
        doctorName,
        note,
        createdAt: new Date().toISOString(),
      }),
    })

    // Get the patient ID from the record
    const recordDoc = await getDoc(recordRef)
    const patientId = recordDoc.data().patientId

    // Create a notification for the patient
    await addDoc(collection(db, "notifications"), {
      userId: patientId,
      type: "record_note_added",
      message: `Dr. ${doctorName} added a note to your medical record`,
      recordId: recordId,
      createdAt: serverTimestamp(),
      read: false,
    })

    return true
  } catch (error) {
    console.error("Error adding doctor note to record:", error)
    throw error
  }
}

// Get all doctors (for sharing records)
export const getAllDoctors = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "doctor"))
    const querySnapshot = await getDocs(q)

    const doctors = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      doctors.push({
        id: doc.id,
        name: data.name || data.displayName || "Unknown Doctor",
        email: data.email || "",
        photoURL: data.photoURL || null,
        specialty: data.specialty || "",
      })
    })

    return doctors
  } catch (error) {
    console.error("Error getting all doctors:", error)
    throw error
  }
}

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

// Get doctors that a record is shared with
export const getRecordSharedDoctors = async (recordId) => {
  try {
    // Get the record
    const recordDoc = await getDoc(doc(db, "medicalRecords", recordId))

    if (!recordDoc.exists()) {
      throw new Error("Record not found")
    }

    const data = recordDoc.data()
    const sharedWithIds = data.sharedWith || []

    if (sharedWithIds.length === 0) {
      return []
    }

    // Get doctor details for each ID
    const doctors = []

    for (const doctorId of sharedWithIds) {
      const doctorDoc = await getDoc(doc(db, "users", doctorId))
      if (doctorDoc.exists()) {
        const doctorData = doctorDoc.data()
        doctors.push({
          id: doctorDoc.id,
          name: doctorData.name || doctorData.displayName || "Unknown Doctor",
          email: doctorData.email || "",
          photoURL: doctorData.photoURL || null,
          specialty: doctorData.specialty || "",
        })
      }
    }

    return doctors
  } catch (error) {
    console.error("Error getting record shared doctors:", error)
    throw error
  }
}

// Get shared medical records for a doctor
export const getSharedMedicalRecords = async (doctorId, patientId) => {
  try {
    const recordsRef = collection(db, "medicalRecords")
    const q = query(recordsRef, where("patientId", "==", patientId), where("sharedWith", "array-contains", doctorId))

    const querySnapshot = await getDocs(q)
    const records = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      records.push({
        id: doc.id,
        title: data.name,
        description: data.notes || "",
        type: data.type,
        fileType: data.fileType,
        fileSize: data.fileSize,
        createdAt: data.uploadedDate?.toDate() || new Date(),
        sharedAt: data.sharedDate?.toDate() || new Date(),
        // Include a thumbnail for images, but not the full data
        thumbnail: data.fileType?.startsWith("image/") ? data.fileData : null,
      })
    })

    return records
  } catch (error) {
    console.error("Error getting shared medical records:", error)
    return []
  }
}
