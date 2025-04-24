"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, Mail, Phone, User } from "lucide-react"
import { SaveConfirmationModal } from "@/components/save-confirmation-modal"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from "@/lib/firebase-utils"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    photoURL: "",
  })

  // Fetch user profile data
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return

      try {
        setLoading(true)
        const userData = await getUserProfile(user.uid)
        if (userData) {
          setProfile({
            displayName: userData.displayName || user.displayName || "",
            email: userData.email || user.email || "",
            phone: userData.phone || "",
            dob: userData.dob || "",
            gender: userData.gender || "",
            address: userData.address || "",
            emergencyContact: userData.emergencyContact || "",
            emergencyPhone: userData.emergencyPhone || "",
            bloodType: userData.bloodType || "",
            allergies: userData.allergies || "",
            medicalConditions: userData.medicalConditions || "",
            currentMedications: userData.currentMedications || "",
            photoURL: userData.photoURL || user.photoURL || "",
          })
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e) => {
    if (!user || !e.target.files || !e.target.files[0]) return

    try {
      const file = e.target.files[0]
      const photoURL = await uploadProfilePhoto(user.uid, file)
      setProfile((prev) => ({ ...prev, photoURL }))
    } catch (err) {
      console.error("Error uploading photo:", err)
      setError("Failed to upload photo")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)
      await updateUserProfile(user.uid, {
        displayName: profile.displayName,
        phone: profile.phone,
        dob: profile.dob,
        gender: profile.gender,
        address: profile.address,
        emergencyContact: profile.emergencyContact,
        emergencyPhone: profile.emergencyPhone,
        bloodType: profile.bloodType,
        allergies: profile.allergies,
        medicalConditions: profile.medicalConditions,
        currentMedications: profile.currentMedications,
      })
      setIsEditing(false)
      setShowSaveModal(true)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile.displayName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-soft-amber"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-soft-amber to-deep-amber p-6 text-white shadow-md">
        <div className="relative z-10">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">My Profile</h1>
              <p className="mt-1 text-white/90">Manage your personal information and preferences</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isEditing
                  ? "bg-white text-soft-amber hover:bg-gray-100 focus:ring-white"
                  : "bg-white/20 text-white hover:bg-white/30 focus:ring-white/50 backdrop-blur-sm"
              }`}
              disabled={loading}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-32 right-16 h-48 w-48 rounded-full bg-white/5"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Photo */}
        <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="h-32 w-32 overflow-hidden rounded-full bg-pale-stone border-4 border-white shadow-md">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL || "/placeholder.svg"}
                    alt={profile.displayName || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-full w-full p-6 text-drift-gray" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    className="absolute bottom-0 right-0 rounded-full bg-soft-amber p-2 text-white shadow-sm hover:bg-amber-600 transition-colors"
                    onClick={handlePhotoClick}
                  >
                    <Camera className="h-5 w-5" />
                    <span className="sr-only">Change photo</span>
                  </button>
                </>
              )}
            </div>
            <h2 className="text-xl font-semibold text-graphite">{profile.displayName}</h2>
            <div className="mt-2 inline-flex items-center rounded-full bg-soft-amber/10 px-3 py-1 text-sm font-medium text-soft-amber">
              Patient
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Mail className="h-4 w-4 text-soft-amber" />
              <span className="text-sm text-drift-gray">{profile.email}</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Phone className="h-4 w-4 text-soft-amber" />
              <span className="text-sm text-drift-gray">{profile.phone || "Not provided"}</span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="col-span-2 rounded-lg border border-pale-stone bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-graphite flex items-center">
            <span>Personal Information</span>
            {isEditing && <span className="ml-2 text-sm font-normal text-soft-amber">(Editing)</span>}
          </h2>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-graphite">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-graphite">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-graphite">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-graphite">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={profile.dob}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-graphite">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-graphite">
                    Blood Type
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={profile.bloodType}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-graphite">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-graphite">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-graphite">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={profile.emergencyPhone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-graphite">
                  Allergies
                </label>
                <input
                  type="text"
                  id="allergies"
                  name="allergies"
                  value={profile.allergies}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                />
              </div>

              <div>
                <label htmlFor="medicalConditions" className="block text-sm font-medium text-graphite">
                  Medical Conditions
                </label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  value={profile.medicalConditions}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                />
              </div>

              <div>
                <label htmlFor="currentMedications" className="block text-sm font-medium text-graphite">
                  Current Medications
                </label>
                <textarea
                  id="currentMedications"
                  name="currentMedications"
                  value={profile.currentMedications}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-earth-beige p-2 focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-earth-beige">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-md border border-earth-beige bg-white px-4 py-2 text-sm font-medium text-graphite shadow-sm transition-colors hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-earth-beige focus:ring-offset-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg bg-pale-stone/30 p-4">
                  <h3 className="text-sm font-medium text-soft-amber">Personal Details</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Full Name</p>
                      <p className="text-graphite">{profile.displayName || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Email</p>
                      <p className="text-graphite">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Phone</p>
                      <p className="text-graphite">{profile.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Date of Birth</p>
                      <p className="text-graphite">
                        {profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-pale-stone/30 p-4">
                  <h3 className="text-sm font-medium text-soft-amber">Medical Information</h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Gender</p>
                      <p className="text-graphite">{profile.gender || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Blood Type</p>
                      <p className="text-graphite">{profile.bloodType || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Allergies</p>
                      <p className="text-graphite">{profile.allergies || "None"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-pale-stone/30 p-4">
                <h3 className="text-sm font-medium text-soft-amber">Contact Information</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-drift-gray">Address</p>
                    <p className="text-graphite">{profile.address || "Not provided"}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Emergency Contact</p>
                      <p className="text-graphite">{profile.emergencyContact || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-drift-gray">Emergency Phone</p>
                      <p className="text-graphite">{profile.emergencyPhone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-pale-stone/30 p-4">
                <h3 className="text-sm font-medium text-soft-amber">Health Information</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-drift-gray">Medical Conditions</p>
                    <p className="text-graphite">{profile.medicalConditions || "None"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-drift-gray">Current Medications</p>
                    <p className="text-graphite">{profile.currentMedications || "None"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SaveConfirmationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Profile Updated"
        message="Your profile information has been successfully updated."
      />
    </div>
  )
}
