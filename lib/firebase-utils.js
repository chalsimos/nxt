import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { db, storage, auth } from "./firebase"

// Get user profile data from Firestore
export async function getUserProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

// Update user profile in Firestore
export async function updateUserProfile(userId, profileData) {
  try {
    // Update the user document
    await updateDoc(doc(db, "users", userId), {
      ...profileData,
      updatedAt: serverTimestamp(),
    })

    // If display name is being updated, also update in Auth
    if (profileData.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
      })
    }

    return true
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Upload profile photo and update user profile
export async function uploadProfilePhoto(userId, file) {
  try {
    // Create a reference to the file location
    const storageRef = ref(storage, `profile_photos/${userId}`)

    // Upload the file
    await uploadBytes(storageRef, file)

    // Get the download URL
    const photoURL = await getDownloadURL(storageRef)

    // Update the user document with the photo URL
    await updateDoc(doc(db, "users", userId), {
      photoURL,
      updatedAt: serverTimestamp(),
    })

    // Update the auth profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL })
    }

    return photoURL
  } catch (error) {
    console.error("Error uploading profile photo:", error)
    throw error
  }
}

// Update last login timestamp
export async function updateLastLogin(userId) {
  try {
    await updateDoc(doc(db, "users", userId), {
      lastLogin: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating last login:", error)
    // Don't throw - this is a non-critical operation
  }
}

// Initialize or update patient profile data
export async function initializePatientProfile(userId, data = {}) {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      // Update existing profile with any new data
      return await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } else {
      // Create new profile
      return await setDoc(userRef, {
        uid: userId,
        role: "patient",
        displayName: data.displayName || "",
        email: data.email || "",
        phone: data.phone || "",
        dob: data.dob || "",
        gender: data.gender || "",
        address: data.address || "",
        emergencyContact: data.emergencyContact || "",
        emergencyPhone: data.emergencyPhone || "",
        bloodType: data.bloodType || "",
        allergies: data.allergies || "",
        medicalConditions: data.medicalConditions || "",
        currentMedications: data.currentMedications || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error initializing patient profile:", error)
    throw error
  }
}

// Initialize or update doctor profile data
export async function initializeDoctorProfile(userId, data = {}) {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      // Update existing profile with any new data
      return await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } else {
      // Create new profile
      return await setDoc(userRef, {
        uid: userId,
        role: "doctor",
        displayName: data.displayName || "",
        email: data.email || "",
        phone: data.phone || "",
        specialty: data.specialty || "",
        licenseNumber: data.licenseNumber || "",
        education: data.education || "",
        experience: data.experience || "",
        languages: data.languages || "",
        bio: data.bio || "",
        officeAddress: data.officeAddress || "",
        officeHours: data.officeHours || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error initializing doctor profile:", error)
    throw error
  }
}

// Get user by ID
export async function getUserById(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}
