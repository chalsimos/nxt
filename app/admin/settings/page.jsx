"use client"

import { useState } from "react"
import { Save, RefreshCw, Globe, Bell, Shield, Mail, Clock, Palette } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-graphite">System Settings</h1>
        <p className="text-drift-gray">Configure system-wide settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <div className="mb-6 border-b border-earth-beige">
        <div className="flex flex-wrap space-x-4">
          {[
            { id: "general", label: "General", icon: <Globe className="h-4 w-4 mr-1" /> },
            { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4 mr-1" /> },
            { id: "security", label: "Security", icon: <Shield className="h-4 w-4 mr-1" /> },
            { id: "email", label: "Email", icon: <Mail className="h-4 w-4 mr-1" /> },
            { id: "scheduling", label: "Scheduling", icon: <Clock className="h-4 w-4 mr-1" /> },
            { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4 mr-1" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-soft-amber text-soft-amber"
                  : "text-drift-gray hover:text-graphite"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Success Message */}
        {showSaveSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Settings saved successfully!
          </div>
        )}

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-graphite mb-4">General Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">System Name</label>
                <input
                  type="text"
                  defaultValue="Smart Care"
                  className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Contact Email</label>
                <input
                  type="email"
                  defaultValue="admin@smartcare.com"
                  className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Default Language</label>
                <select className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Time Zone</label>
                <select className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber">
                  <option value="utc">UTC</option>
                  <option value="est">Eastern Time (ET)</option>
                  <option value="cst">Central Time (CT)</option>
                  <option value="mst">Mountain Time (MT)</option>
                  <option value="pst">Pacific Time (PT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">System Description</label>
              <textarea
                rows="3"
                defaultValue="Smart Care is a comprehensive healthcare management system connecting patients with healthcare providers."
                className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
              ></textarea>
            </div>

            <div className="flex items-center">
              <input
                id="maintenance-mode"
                type="checkbox"
                className="h-4 w-4 text-soft-amber focus:ring-soft-amber border-earth-beige rounded"
              />
              <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-graphite">
                Enable Maintenance Mode
              </label>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-graphite mb-4">Notification Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-earth-beige rounded-md">
                <div>
                  <h3 className="font-medium text-graphite">Email Notifications</h3>
                  <p className="text-sm text-drift-gray">Send system notifications via email</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="email-toggle" className="sr-only" defaultChecked />
                  <label
                    htmlFor="email-toggle"
                    className="block h-6 w-12 rounded-full bg-earth-beige cursor-pointer transition-colors duration-200 ease-in-out"
                  >
                    <span
                      className="absolute left-1 top-1 bg-white border border-gray-200 h-4 w-4 rounded-full transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-6"
                      style={{ transform: "translateX(6px)" }}
                    ></span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-earth-beige rounded-md">
                <div>
                  <h3 className="font-medium text-graphite">SMS Notifications</h3>
                  <p className="text-sm text-drift-gray">Send system notifications via SMS</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="sms-toggle" className="sr-only" />
                  <label
                    htmlFor="sms-toggle"
                    className="block h-6 w-12 rounded-full bg-earth-beige cursor-pointer transition-colors duration-200 ease-in-out"
                  >
                    <span className="absolute left-1 top-1 bg-white border border-gray-200 h-4 w-4 rounded-full transition-transform duration-200 ease-in-out transform translate-x-0"></span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-earth-beige rounded-md">
                <div>
                  <h3 className="font-medium text-graphite">Push Notifications</h3>
                  <p className="text-sm text-drift-gray">Send system notifications via push notifications</p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input type="checkbox" id="push-toggle" className="sr-only" defaultChecked />
                  <label
                    htmlFor="push-toggle"
                    className="block h-6 w-12 rounded-full bg-earth-beige cursor-pointer transition-colors duration-200 ease-in-out"
                  >
                    <span
                      className="absolute left-1 top-1 bg-white border border-gray-200 h-4 w-4 rounded-full transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-6"
                      style={{ transform: "translateX(6px)" }}
                    ></span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Notification Frequency</label>
              <select className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber">
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly Digest</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab !== "general" && activeTab !== "notifications" && (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-medium text-graphite mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
              </h2>
              <p className="text-drift-gray">This settings section is under development</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
