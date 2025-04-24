"use client"

import { useState } from "react"
import { UserPlus, Edit, Trash2, Shield, Search, Plus } from "lucide-react"

export default function RolesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Sample roles data
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access with all permissions",
      users: 2,
      permissions: ["all"],
    },
    {
      id: 2,
      name: "Admin",
      description: "Administrative access with limited system settings",
      users: 5,
      permissions: ["users.view", "users.create", "users.edit", "appointments.all", "reports.view"],
    },
    {
      id: 3,
      name: "Doctor Manager",
      description: "Manages doctor accounts and schedules",
      users: 8,
      permissions: ["doctors.view", "doctors.create", "doctors.edit", "schedules.all"],
    },
    {
      id: 4,
      name: "Patient Support",
      description: "Handles patient inquiries and account management",
      users: 12,
      permissions: ["patients.view", "patients.edit", "support.all"],
    },
    {
      id: 5,
      name: "Billing Admin",
      description: "Manages billing and payment processing",
      users: 4,
      permissions: ["billing.all", "reports.financial"],
    },
  ]

  const handleCreateRole = () => {
    setIsCreating(true)
    setSelectedRole(null)
  }

  const handleEditRole = (role) => {
    setIsEditing(true)
    setSelectedRole(role)
  }

  const handleSaveRole = () => {
    // Simulate saving
    setTimeout(() => {
      setIsCreating(false)
      setIsEditing(false)
      setSelectedRole(null)
    }, 1000)
  }

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-graphite">Roles & Permissions</h1>
        <p className="text-drift-gray">Manage user roles and access permissions</p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-drift-gray" />
          </div>
        </div>

        <button
          onClick={handleCreateRole}
          className="flex items-center px-4 py-2 bg-soft-amber text-white rounded-md hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-soft-amber focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span>Create New Role</span>
        </button>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-earth-beige">
            <thead>
              <tr className="bg-pale-stone/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-drift-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-beige">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-pale-stone/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-soft-amber mr-2" />
                      <div>
                        <div className="text-sm font-medium text-graphite">{role.name}</div>
                        <div className="text-xs text-drift-gray">{role.permissions.length} permissions</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-drift-gray">{role.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-drift-gray">{role.users} users</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-drift-gray">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-soft-amber hover:text-soft-amber/80 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="sr-only">Edit</span>
                    </button>
                    {role.name !== "Super Admin" && (
                      <button className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Editor Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-soft-amber/20 sm:mx-0 sm:h-10 sm:w-10">
                    <UserPlus className="h-6 w-6 text-soft-amber" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-graphite">
                      {isCreating ? "Create New Role" : "Edit Role"}
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-graphite mb-1">Role Name</label>
                        <input
                          type="text"
                          defaultValue={selectedRole?.name || ""}
                          className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-graphite mb-1">Description</label>
                        <textarea
                          rows="2"
                          defaultValue={selectedRole?.description || ""}
                          className="w-full px-3 py-2 border border-earth-beige rounded-md focus:outline-none focus:ring-2 focus:ring-soft-amber focus:border-soft-amber"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-graphite mb-1">Permissions</label>
                        <div className="max-h-60 overflow-y-auto border border-earth-beige rounded-md p-2">
                          {[
                            "Users Management",
                            "Doctor Management",
                            "Patient Management",
                            "Appointment Management",
                            "Billing & Payments",
                            "Reports & Analytics",
                            "System Settings",
                            "Audit Logs",
                            "Notifications",
                            "Feedback & Support",
                          ].map((category, idx) => (
                            <div key={idx} className="mb-3">
                              <div className="flex items-center mb-1">
                                <input
                                  id={`category-${idx}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-soft-amber focus:ring-soft-amber border-earth-beige rounded"
                                  defaultChecked={idx < 3}
                                />
                                <label
                                  htmlFor={`category-${idx}`}
                                  className="ml-2 block text-sm font-medium text-graphite"
                                >
                                  {category}
                                </label>
                              </div>
                              <div className="ml-6 space-y-1">
                                {["View", "Create", "Edit", "Delete"].map((action, actionIdx) => (
                                  <div key={actionIdx} className="flex items-center">
                                    <input
                                      id={`${idx}-${actionIdx}`}
                                      type="checkbox"
                                      className="h-4 w-4 text-soft-amber focus:ring-soft-amber border-earth-beige rounded"
                                      defaultChecked={actionIdx < 3 && idx < 3}
                                    />
                                    <label
                                      htmlFor={`${idx}-${actionIdx}`}
                                      className="ml-2 block text-xs text-drift-gray"
                                    >
                                      {action}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-pale-stone/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveRole}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-soft-amber text-base font-medium text-white hover:bg-soft-amber/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-amber sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isCreating ? "Create Role" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false)
                    setIsEditing(false)
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-earth-beige shadow-sm px-4 py-2 bg-white text-base font-medium text-graphite hover:bg-pale-stone focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-beige sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
