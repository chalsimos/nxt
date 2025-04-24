"use client"
import { useState, useEffect } from "react"
import { Users, UserCog, Calendar, Clock, Activity, HardDrive, AlertCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"

// Mock data - would be fetched from API in production
const mockStats = {
  totalPatients: 1248,
  totalDoctors: 87,
  appointmentsToday: 156,
  pendingAccounts: 23,
  systemStatus: {
    diskSpace: "78%",
    uptime: "99.9%",
    lastBackup: "2 days ago",
    serverLoad: "Normal",
  },
}

// Mock activity log data
const mockActivityLog = [
  { id: 1, user: "Dr. Sarah Johnson", action: "Updated availability", time: "10 minutes ago" },
  { id: 2, user: "Admin Mark", action: "Approved new doctor account", time: "25 minutes ago" },
  { id: 3, user: "Patient Thomas Lee", action: "Scheduled appointment", time: "1 hour ago" },
  { id: 4, user: "System", action: "Backup completed", time: "3 hours ago" },
  { id: 5, user: "Dr. Michael Chen", action: "Added new prescription", time: "5 hours ago" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats)
  const [activityLog, setActivityLog] = useState(mockActivityLog)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse w-full">
        <h1 className="text-2xl font-bold mb-6 bg-gray-200 h-8 w-48 rounded"></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-32 w-full">
              <div className="bg-gray-200 h-6 w-24 rounded mb-2"></div>
              <div className="bg-gray-200 h-10 w-16 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 h-80 w-full"></div>
          <div className="bg-white rounded-lg shadow-sm p-6 h-80 w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-transition-enter w-full">
      <h1 className="text-2xl font-bold mb-6 text-graphite">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="h-6 w-6 text-soft-amber" />}
          link="/admin/patients"
        />
        <StatsCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={<UserCog className="h-6 w-6 text-soft-amber" />}
          link="/admin/doctors"
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.appointmentsToday}
          icon={<Calendar className="h-6 w-6 text-soft-amber" />}
          link="/admin/appointments"
        />
        <StatsCard
          title="Pending Accounts"
          value={stats.pendingAccounts}
          icon={<Clock className="h-6 w-6 text-soft-amber" />}
          link="/admin/pending-accounts"
          alert={stats.pendingAccounts > 0}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-graphite">Latest Activity</h2>
            <Link href="/admin/logs" className="text-soft-amber hover:underline text-sm flex items-center">
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start border-b border-earth-beige pb-3 last:border-0">
                <Activity className="h-5 w-5 text-soft-amber mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-graphite">{log.user}</p>
                  <p className="text-sm text-drift-gray">{log.action}</p>
                  <p className="text-xs text-drift-gray mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 w-full">
          <h2 className="text-lg font-semibold mb-4 text-graphite">System Status</h2>
          <div className="space-y-4">
            <StatusItem
              label="Disk Space"
              value={stats.systemStatus.diskSpace}
              icon={<HardDrive className="h-5 w-5 text-soft-amber" />}
            />
            <StatusItem
              label="System Uptime"
              value={stats.systemStatus.uptime}
              icon={<Activity className="h-5 w-5 text-green-500" />}
            />
            <StatusItem
              label="Last Backup"
              value={stats.systemStatus.lastBackup}
              icon={<Clock className="h-5 w-5 text-soft-amber" />}
            />
            <StatusItem
              label="Server Load"
              value={stats.systemStatus.serverLoad}
              icon={<AlertCircle className="h-5 w-5 text-green-500" />}
            />

            <div className="pt-4 mt-4 border-t border-earth-beige">
              <Link
                href="/admin/settings"
                className="inline-flex items-center justify-center px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90 transition-colors w-full"
              >
                System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon, link, alert = false }) {
  return (
    <Link href={link} className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group w-full">
        {alert && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-drift-gray font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-graphite">{value}</p>
          </div>
          <div className="p-2 rounded-full bg-pale-stone group-hover:bg-soft-amber/10 transition-colors">{icon}</div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-soft-amber/20 group-hover:bg-soft-amber transition-colors"></div>
      </div>
    </Link>
  )
}

// Status Item Component
function StatusItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        <span className="ml-2 text-sm text-drift-gray">{label}</span>
      </div>
      <span className="text-sm font-medium text-graphite">{value}</span>
    </div>
  )
}
