"use client"

import { useState } from "react"
import { Download, FileText, Filter, Calendar, RefreshCw } from "lucide-react"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("financial")
  const [dateRange, setDateRange] = useState("last30")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = () => {
    setIsGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-graphite">Reports & Exports</h1>
        <p className="text-drift-gray">Generate and download system reports</p>
      </div>

      {/* Report Type Tabs */}
      <div className="mb-6 border-b border-earth-beige">
        <div className="flex space-x-4">
          {["financial", "patient", "doctor", "appointment", "system"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-soft-amber text-soft-amber"
                  : "text-drift-gray hover:text-graphite"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Reports
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-graphite mb-2">Report Options</h2>
            <p className="text-sm text-drift-gray">Configure your report parameters</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-graphite mb-1">Date Range</label>
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-drift-gray" />
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-graphite mb-1">Format</label>
              <div className="relative">
                <select className="w-full sm:w-48 pl-10 pr-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber">
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV File</option>
                  <option value="json">JSON Data</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-drift-gray" />
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-graphite mb-1">Additional Filters</label>
              <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-earth-beige rounded-md hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-soft-amber">
                <Filter className="h-5 w-5 mr-2 text-drift-gray" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-graphite">Report Preview</h2>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2 disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>

        {/* Report Content */}
        <div className="border border-earth-beige rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
          {isGenerating ? (
            <div className="animate-pulse">
              <RefreshCw className="h-12 w-12 text-soft-amber animate-spin mb-4" />
              <p className="text-lg font-medium text-graphite">Generating your report...</p>
              <p className="text-drift-gray mt-2">This may take a few moments</p>
            </div>
          ) : (
            <>
              <FileText className="h-16 w-16 text-drift-gray mb-4" />
              <h3 className="text-xl font-medium text-graphite mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report
              </h3>
              <p className="text-drift-gray max-w-md">
                Click the "Generate Report" button to create a detailed {activeTab} report based on your selected
                parameters.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-medium text-graphite mb-4">Recent Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-earth-beige">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Date Generated
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Format
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-beige">
              {[
                {
                  name: "Monthly Financial Summary",
                  type: "Financial",
                  date: "Apr 7, 2025",
                  format: "PDF",
                },
                {
                  name: "Patient Registration Statistics",
                  type: "Patient",
                  date: "Apr 5, 2025",
                  format: "Excel",
                },
                {
                  name: "Doctor Performance Analysis",
                  type: "Doctor",
                  date: "Apr 3, 2025",
                  format: "PDF",
                },
                {
                  name: "Appointment Completion Rate",
                  type: "Appointment",
                  date: "Apr 1, 2025",
                  format: "CSV",
                },
                {
                  name: "System Usage Metrics",
                  type: "System",
                  date: "Mar 28, 2025",
                  format: "JSON",
                },
              ].map((report, index) => (
                <tr key={index} className="hover:bg-pale-stone/30">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-graphite">{report.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-drift-gray">{report.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-drift-gray">{report.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-drift-gray">{report.format}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-drift-gray">
                    <button className="text-soft-amber hover:text-soft-amber/80 mr-3">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
