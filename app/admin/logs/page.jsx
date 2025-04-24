"use client"

import { useState } from "react"
import { Search, Filter, Download, AlertCircle, Info, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [logType, setLogType] = useState("all")
  const [dateRange, setDateRange] = useState("today")
  const [isLoading, setIsLoading] = useState(false)

  // Sample logs data
  const logs = [
    {
      id: 1,
      timestamp: "2025-04-08T11:42:23",
      user: "admin@example.com",
      action: "User Login",
      details: "Admin user logged in successfully",
      ip: "192.168.1.1",
      type: "info",
    },
    {
      id: 2,
      timestamp: "2025-04-08T11:38:12",
      user: "doctor@example.com",
      action: "Appointment Created",
      details: "New appointment scheduled with patient ID: PAT-2023-0042",
      ip: "192.168.1.45",
      type: "success",
    },
    {
      id: 3,
      timestamp: "2025-04-08T11:35:07",
      user: "system",
      action: "Backup Failed",
      details: "Daily database backup failed: Connection timeout",
      ip: "localhost",
      type: "error",
    },
    {
      id: 4,
      timestamp: "2025-04-08T11:30:55",
      user: "patient@example.com",
      action: "Password Reset",
      details: "Password reset requested for account",
      ip: "203.0.113.42",
      type: "warning",
    },
    {
      id: 5,
      timestamp: "2025-04-08T11:28:19",
      user: "admin@example.com",
      action: "User Created",
      details: "New doctor account created: Dr. Jane Smith",
      ip: "192.168.1.1",
      type: "success",
    },
    {
      id: 6,
      timestamp: "2025-04-08T11:25:03",
      user: "system",
      action: "Notification Sent",
      details: "Appointment reminder sent to 24 patients",
      ip: "localhost",
      type: "info",
    },
    {
      id: 7,
      timestamp: "2025-04-08T11:20:41",
      user: "doctor@example.com",
      action: "Record Updated",
      details: "Patient medical record updated for PAT-2023-0037",
      ip: "192.168.1.45",
      type: "info",
    },
  ]

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getLogIcon = (type) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const filteredLogs = logs
    .filter((log) => logType === "all" || log.type === logType)
    .filter(
      (log) =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-graphite">Audit Logs</h1>
        <p className="text-drift-gray">Monitor system activities and user actions</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-drift-gray" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-auto">
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
              >
                <option value="all">All Types</option>
                <option value="info">Information</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-earth-beige rounded-md hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-soft-amber"
            >
              <RefreshCw className={`h-5 w-5 mr-2 text-drift-gray ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button className="flex items-center px-4 py-2 border border-earth-beige rounded-md hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-soft-amber">
              <Filter className="h-5 w-5 mr-2 text-drift-gray" />
              <span>More Filters</span>
            </button>

            <button className="flex items-center px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2">
              <Download className="h-5 w-5 mr-2" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-earth-beige">
            <thead>
              <tr className="bg-pale-stone/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-beige">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-5 w-5 text-soft-amber animate-spin mr-2" />
                      <span className="text-drift-gray">Loading logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-drift-gray">
                    No logs found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-pale-stone/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-drift-gray">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-drift-gray">{log.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getLogIcon(log.type)}
                        <span className="ml-2 text-sm font-medium text-graphite">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-drift-gray">{log.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-drift-gray">{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
