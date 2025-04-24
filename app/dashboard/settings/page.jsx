"use client"

import { useState } from "react"
import { Bell, Lock, Moon, Shield, Sun } from "lucide-react"
import { SaveConfirmationModal } from "@/components/save-confirmation-modal"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "light",
    language: "english",
    notifications: {
      appointments: true,
      messages: true,
      prescriptions: true,
      reminders: true,
      marketing: false,
    },
    privacy: {
      shareData: false,
      allowAnalytics: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: "30",
    },
  })
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleThemeChange = (theme) => {
    setSettings({ ...settings, theme })
  }

  const handleLanguageChange = (e) => {
    setSettings({ ...settings, language: e.target.value })
  }

  const handleNotificationChange = (key) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    })
  }

  const handlePrivacyChange = (key) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key],
      },
    })
  }

  const handleSecurityChange = (key, value) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [key]: typeof value === "boolean" ? value : value,
      },
    })
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    setShowSaveModal(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-graphite md:text-3xl">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-graphite">Appearance</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-graphite">Theme</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`flex flex-col items-center rounded-lg border p-4 transition-colors ${
                    settings.theme === "light"
                      ? "border-soft-amber bg-pale-stone text-soft-amber"
                      : "border-earth-beige text-drift-gray hover:bg-pale-stone"
                  }`}
                >
                  <Sun className="mb-2 h-6 w-6" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`flex flex-col items-center rounded-lg border p-4 transition-colors ${
                    settings.theme === "dark"
                      ? "border-soft-amber bg-pale-stone text-soft-amber"
                      : "border-earth-beige text-drift-gray hover:bg-pale-stone"
                  }`}
                >
                  <Moon className="mb-2 h-6 w-6" />
                  <span className="text-sm">Dark</span>
                </button>
                <button
                  onClick={() => handleThemeChange("system")}
                  className={`flex flex-col items-center rounded-lg border p-4 transition-colors ${
                    settings.theme === "system"
                      ? "border-soft-amber bg-pale-stone text-soft-amber"
                      : "border-earth-beige text-drift-gray hover:bg-pale-stone"
                  }`}
                >
                  <div className="mb-2 flex">
                    <Sun className="h-6 w-6" />
                    <Moon className="h-6 w-6" />
                  </div>
                  <span className="text-sm">System</span>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="language" className="mb-2 block text-sm font-medium text-graphite">
                Language
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={handleLanguageChange}
                className="w-full max-w-xs rounded-md border border-earth-beige bg-white py-2 pl-3 pr-10 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-soft-amber" />
            <h2 className="text-xl font-semibold text-graphite">Notifications</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="notify-appointments" className="text-sm text-graphite">
                Appointment Reminders
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="notify-appointments"
                  className="peer sr-only"
                  checked={settings.notifications.appointments}
                  onChange={() => handleNotificationChange("appointments")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="notify-messages" className="text-sm text-graphite">
                New Messages
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="notify-messages"
                  className="peer sr-only"
                  checked={settings.notifications.messages}
                  onChange={() => handleNotificationChange("messages")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="notify-prescriptions" className="text-sm text-graphite">
                Prescription Updates
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="notify-prescriptions"
                  className="peer sr-only"
                  checked={settings.notifications.prescriptions}
                  onChange={() => handleNotificationChange("prescriptions")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="notify-reminders" className="text-sm text-graphite">
                Medication Reminders
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="notify-reminders"
                  className="peer sr-only"
                  checked={settings.notifications.reminders}
                  onChange={() => handleNotificationChange("reminders")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="notify-marketing" className="text-sm text-graphite">
                Marketing & Promotions
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="notify-marketing"
                  className="peer sr-only"
                  checked={settings.notifications.marketing}
                  onChange={() => handleNotificationChange("marketing")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-soft-amber" />
            <h2 className="text-xl font-semibold text-graphite">Privacy</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="privacy-share" className="text-sm font-medium text-graphite">
                  Share Health Data with Providers
                </label>
                <p className="text-xs text-drift-gray">
                  Allow your health data to be shared with your healthcare providers
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="privacy-share"
                  className="peer sr-only"
                  checked={settings.privacy.shareData}
                  onChange={() => handlePrivacyChange("shareData")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="privacy-analytics" className="text-sm font-medium text-graphite">
                  Allow Analytics
                </label>
                <p className="text-xs text-drift-gray">Help us improve by allowing anonymous usage data collection</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="privacy-analytics"
                  className="peer sr-only"
                  checked={settings.privacy.allowAnalytics}
                  onChange={() => handlePrivacyChange("allowAnalytics")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-lg border border-pale-stone bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-soft-amber" />
            <h2 className="text-xl font-semibold text-graphite">Security</h2>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="security-2fa" className="text-sm font-medium text-graphite">
                  Two-Factor Authentication
                </label>
                <p className="text-xs text-drift-gray">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  id="security-2fa"
                  className="peer sr-only"
                  checked={settings.security.twoFactor}
                  onChange={() => handleSecurityChange("twoFactor", !settings.security.twoFactor)}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-soft-amber peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-soft-amber"></div>
              </label>
            </div>
            <div>
              <label htmlFor="session-timeout" className="mb-1 block text-sm font-medium text-graphite">
                Session Timeout (minutes)
              </label>
              <select
                id="session-timeout"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSecurityChange("sessionTimeout", e.target.value)}
                className="w-full max-w-xs rounded-md border border-earth-beige bg-white py-2 pl-3 pr-10 text-graphite focus:border-soft-amber focus:outline-none focus:ring-1 focus:ring-soft-amber"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div className="pt-2">
              <button className="text-sm font-medium text-soft-amber hover:underline">Change Password</button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="rounded-md bg-soft-amber px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
          >
            Save Settings
          </button>
        </div>
      </div>

      <SaveConfirmationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Settings Saved"
        message="Your settings have been successfully updated."
      />
    </div>
  )
}
