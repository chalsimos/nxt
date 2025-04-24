"use client"

import { useState } from "react"
import { User, Mail, Phone, Shield, Save, Camera } from "lucide-react"

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    // Simulate saving
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-graphite">Admin Profile</h1>
        <p className="text-drift-gray mt-1">Manage your account information and preferences</p>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center">
          <span className="mr-2">✓</span> Profile updated successfully
        </div>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-soft-amber/20 flex items-center justify-center text-soft-amber">
              <User className="h-12 w-12" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-pale-stone">
              <Camera className="h-4 w-4 text-drift-gray" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold text-graphite">Admin User</h2>
            <p className="text-drift-gray">System Administrator</p>
            <div className="mt-2 flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="flex items-center justify-center md:justify-start">
                <Mail className="h-4 w-4 text-drift-gray mr-1" />
                <span className="text-sm text-drift-gray">admin@smartcare.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Phone className="h-4 w-4 text-drift-gray mr-1" />
                <span className="text-sm text-drift-gray">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Shield className="h-4 w-4 text-drift-gray mr-1" />
                <span className="text-sm text-drift-gray">Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-earth-beige">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === "profile"
                ? "border-soft-amber text-soft-amber"
                : "border-transparent text-drift-gray hover:text-graphite hover:border-earth-beige"
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === "security"
                ? "border-soft-amber text-soft-amber"
                : "border-transparent text-drift-gray hover:text-graphite hover:border-earth-beige"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`py-2 px-1 text-sm font-medium border-b-2 ${
              activeTab === "preferences"
                ? "border-soft-amber text-soft-amber"
                : "border-transparent text-drift-gray hover:text-graphite hover:border-earth-beige"
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-graphite border-b border-earth-beige pb-2">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">First Name</label>
                <input type="text" defaultValue="Admin" className="w-full p-2 border border-earth-beige rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Last Name</label>
                <input type="text" defaultValue="User" className="w-full p-2 border border-earth-beige rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="admin@smartcare.com"
                  className="w-full p-2 border border-earth-beige rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full p-2 border border-earth-beige rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-graphite mb-1">Job Title</label>
                <input
                  type="text"
                  defaultValue="System Administrator"
                  className="w-full p-2 border border-earth-beige rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-graphite mb-1">Bio</label>
                <textarea
                  defaultValue="Experienced system administrator with a focus on healthcare IT systems."
                  className="w-full p-2 border border-earth-beige rounded-md h-24"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-graphite border-b border-earth-beige pb-2">Security Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-graphite mb-3">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      className="w-full p-2 border border-earth-beige rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full p-2 border border-earth-beige rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full p-2 border border-earth-beige rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-earth-beige">
                <h3 className="font-medium text-graphite mb-3">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-graphite">Protect your account with two-factor authentication</p>
                    <p className="text-xs text-drift-gray mt-1">
                      Status: <span className="text-green-600 font-medium">Enabled</span>
                    </p>
                  </div>
                  <button className="px-3 py-1.5 border border-earth-beige text-sm rounded-md hover:bg-pale-stone">
                    Configure
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-earth-beige">
                <h3 className="font-medium text-graphite mb-3">Login Sessions</h3>
                <p className="text-sm text-drift-gray mb-2">Currently active sessions on your account:</p>

                <div className="space-y-2">
                  <div className="p-3 bg-pale-stone rounded-md flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-graphite">Current Session</p>
                      <p className="text-xs text-drift-gray">Chrome on Windows • IP: 192.168.1.1</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                  </div>

                  <div className="p-3 bg-white border border-earth-beige rounded-md flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-graphite">Mobile App</p>
                      <p className="text-xs text-drift-gray">iPhone • Last active: 2 hours ago</p>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-sm">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-graphite border-b border-earth-beige pb-2">User Preferences</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-graphite mb-3">Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="email-notifications" defaultChecked className="mr-2" />
                    <label htmlFor="email-notifications" className="text-sm text-graphite">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="browser-notifications" defaultChecked className="mr-2" />
                    <label htmlFor="browser-notifications" className="text-sm text-graphite">
                      Browser Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="sms-notifications" className="mr-2" />
                    <label htmlFor="sms-notifications" className="text-sm text-graphite">
                      SMS Notifications
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-earth-beige">
                <h3 className="font-medium text-graphite mb-3">Display Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Language</label>
                    <select className="w-full p-2 border border-earth-beige rounded-md">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Chinese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Time Zone</label>
                    <select className="w-full p-2 border border-earth-beige rounded-md">
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                      <option>UTC</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input type="checkbox" id="dark-mode" className="mr-2" />
                    <label htmlFor="dark-mode" className="text-sm text-graphite">
                      Enable Dark Mode
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-earth-beige">
                <h3 className="font-medium text-graphite mb-3">Dashboard Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="show-welcome" defaultChecked className="mr-2" />
                    <label htmlFor="show-welcome" className="text-sm text-graphite">
                      Show welcome message on login
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="compact-view" className="mr-2" />
                    <label htmlFor="compact-view" className="text-sm text-graphite">
                      Use compact view for tables
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Default Dashboard View</label>
                    <select className="w-full p-2 border border-earth-beige rounded-md">
                      <option>Overview</option>
                      <option>Analytics</option>
                      <option>User Management</option>
                      <option>System Status</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
