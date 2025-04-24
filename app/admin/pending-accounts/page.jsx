"use client"
import { useState, useEffect } from "react"
import { Search, Filter, Check, X, Clock, Calendar, User } from "lucide-react"

// Mock pending accounts data
const mockPendingAccounts = [
  {
    id: 1,
    name: "Thomas Lee",
    email: "thomas.lee@example.com",
    role: "patient",
    requestedDate: "2023-04-05",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Dr. Maria Garcia",
    email: "maria.garcia@example.com",
    role: "doctor",
    requestedDate: "2023-04-05",
    status: "pending",
    specialty: "Dermatology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Alex Johnson",
    email: "alex.j@example.com",
    role: "patient",
    requestedDate: "2023-04-04",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Dr. Kevin Wong",
    email: "kevin.wong@example.com",
    role: "doctor",
    requestedDate: "2023-04-04",
    status: "pending",
    specialty: "Cardiology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Samantha Miller",
    email: "samantha.m@example.com",
    role: "patient",
    requestedDate: "2023-04-03",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    name: "Dr. Rachel Adams",
    email: "rachel.a@example.com",
    role: "doctor",
    requestedDate: "2023-04-03",
    status: "pending",
    specialty: "Pediatrics",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 7,
    name: "Daniel Brown",
    email: "daniel.b@example.com",
    role: "patient",
    requestedDate: "2023-04-02",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 8,
    name: "Dr. James Wilson",
    email: "james.w@example.com",
    role: "doctor",
    requestedDate: "2023-04-02",
    status: "pending",
    specialty: "Orthopedics",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 9,
    name: "Olivia Martinez",
    email: "olivia.m@example.com",
    role: "patient",
    requestedDate: "2023-04-01",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 10,
    name: "Dr. David Kim",
    email: "david.k@example.com",
    role: "doctor",
    requestedDate: "2023-04-01",
    status: "pending",
    specialty: "Neurology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 11,
    name: "Emma Wilson",
    email: "emma.w@example.com",
    role: "patient",
    requestedDate: "2023-03-31",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 12,
    name: "Dr. Sarah Johnson",
    email: "sarah.j@example.com",
    role: "doctor",
    requestedDate: "2023-03-31",
    status: "pending",
    specialty: "Internal Medicine",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 13,
    name: "Michael Chen",
    email: "michael.c@example.com",
    role: "patient",
    requestedDate: "2023-03-30",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 14,
    name: "Dr. Emily Rodriguez",
    email: "emily.r@example.com",
    role: "doctor",
    requestedDate: "2023-03-30",
    status: "pending",
    specialty: "Psychiatry",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 15,
    name: "William Taylor",
    email: "william.t@example.com",
    role: "patient",
    requestedDate: "2023-03-29",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 16,
    name: "Dr. Robert Wilson",
    email: "robert.w@example.com",
    role: "doctor",
    requestedDate: "2023-03-29",
    status: "pending",
    specialty: "Ophthalmology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 17,
    name: "Sophia Chen",
    email: "sophia.c@example.com",
    role: "patient",
    requestedDate: "2023-03-28",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 18,
    name: "Dr. Jessica Patel",
    email: "jessica.p@example.com",
    role: "doctor",
    requestedDate: "2023-03-28",
    status: "pending",
    specialty: "Endocrinology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 19,
    name: "James Rodriguez",
    email: "james.r@example.com",
    role: "patient",
    requestedDate: "2023-03-27",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 20,
    name: "Dr. Michael Chen",
    email: "michael.chen@example.com",
    role: "doctor",
    requestedDate: "2023-03-27",
    status: "pending",
    specialty: "Gastroenterology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 21,
    name: "Ava Brown",
    email: "ava.b@example.com",
    role: "patient",
    requestedDate: "2023-03-26",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 22,
    name: "Dr. David Lee",
    email: "david.lee@example.com",
    role: "doctor",
    requestedDate: "2023-03-26",
    status: "pending",
    specialty: "Urology",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 23,
    name: "Ethan Davis",
    email: "ethan.d@example.com",
    role: "patient",
    requestedDate: "2023-03-25",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function PendingAccountsPage() {
  const [pendingAccounts, setPendingAccounts] = useState([])
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch pending accounts data
  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setPendingAccounts(mockPendingAccounts)
      setFilteredAccounts(mockPendingAccounts)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle search and filter
  useEffect(() => {
    let result = pendingAccounts

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (account) =>
          account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((account) => account.role === roleFilter)
    }

    setFilteredAccounts(result)
  }, [searchTerm, roleFilter, pendingAccounts])

  // Handle account approval
  const handleApproveAccount = () => {
    if (selectedAccount) {
      // In a real app, this would make an API call to approve the account
      const updatedAccounts = pendingAccounts.filter((account) => account.id !== selectedAccount.id)
      setPendingAccounts(updatedAccounts)
      setFilteredAccounts(
        updatedAccounts.filter((account) => {
          if (roleFilter !== "all") {
            return account.role === roleFilter
          }
          return true
        }),
      )

      setShowApproveModal(false)
      setSelectedAccount(null)

      // Show success toast
      setSuccessMessage(`${selectedAccount.name}'s account has been approved.`)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  // Handle account rejection
  const handleRejectAccount = () => {
    if (selectedAccount) {
      // In a real app, this would make an API call to reject the account
      const updatedAccounts = pendingAccounts.filter((account) => account.id !== selectedAccount.id)
      setPendingAccounts(updatedAccounts)
      setFilteredAccounts(
        updatedAccounts.filter((account) => {
          if (roleFilter !== "all") {
            return account.role === roleFilter
          }
          return true
        }),
      )

      setShowRejectModal(false)
      setSelectedAccount(null)

      // Show success toast
      setSuccessMessage(`${selectedAccount.name}'s account has been rejected.`)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gray-200 h-8 w-64 rounded"></h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 w-full">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="bg-gray-200 h-10 w-full md:w-64 rounded"></div>
            <div className="bg-gray-200 h-10 w-full md:w-48 rounded"></div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="py-3 px-4 border-b border-earth-beige">
                      <div className="bg-gray-200 h-6 w-full rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-4 px-4 border-b border-earth-beige">
                        <div className="bg-gray-200 h-6 w-full rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-graphite">
          Pending Account Requests{" "}
          <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full ml-2">{pendingAccounts.length}</span>
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 w-full">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-1 focus:ring-soft-amber"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
          </div>

          <div className="relative w-full md:w-48">
            <select
              className="w-full pl-10 pr-4 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-1 focus:ring-soft-amber appearance-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-drift-gray" />
          </div>
        </div>

        {/* Pending Accounts Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Role
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Requested Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Status
                </th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-drift-gray border-b border-earth-beige">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-pale-stone/50">
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <div className="flex items-center">
                        <img
                          src={account.avatar || "/placeholder.svg"}
                          alt={account.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <span className="font-medium text-graphite">{account.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">{account.email}</td>
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.role === "doctor" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {account.role === "doctor" ? (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Doctor
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Patient
                          </>
                        )}
                      </span>
                      {account.role === "doctor" && account.specialty && (
                        <span className="block text-xs text-drift-gray mt-1">{account.specialty}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-drift-gray">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-drift-gray" />
                        {formatDate(account.requestedDate)}
                      </div>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    </td>
                    <td className="py-4 px-4 border-b border-earth-beige text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAccount(account)
                            setShowApproveModal(true)
                          }}
                          className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                          aria-label="Approve account"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account)
                            setShowRejectModal(true)
                          }}
                          className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          aria-label="Reject account"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-drift-gray border-b border-earth-beige">
                    No pending accounts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-drift-gray">
            Showing <span className="font-medium">{filteredAccounts.length}</span> of{" "}
            <span className="font-medium">{pendingAccounts.length}</span> pending accounts
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90">1</button>
            <button className="px-3 py-1 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone">
              2
            </button>
            <button className="px-3 py-1 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone">
              3
            </button>
            <button className="px-3 py-1 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-graphite mb-2">Approve Account</h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to approve {selectedAccount?.name}'s account as a {selectedAccount?.role}?
              {selectedAccount?.role === "doctor" && selectedAccount?.specialty && (
                <span className="block mt-2">Specialty: {selectedAccount.specialty}</span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAccount}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-graphite mb-2">Reject Account</h3>
            <p className="text-drift-gray mb-4">
              Are you sure you want to reject {selectedAccount?.name}'s account request? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-earth-beige rounded-md text-drift-gray hover:bg-pale-stone"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50">
          <Check className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}
    </div>
  )
}
