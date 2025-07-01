import React, { useState, useEffect } from "react";
import {
  Shield,
  UserPlus,
  Users,
  Settings,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface AdminAccount {
  id: string;
  email: string;
  role: "admin" | "volunteer";
  created_at: string;
}

interface RoleManagerProps {
  className?: string;
  showHeader?: boolean; // Allow hiding header when embedded
}

export function RoleManager({
  className = "",
  showHeader = true,
}: RoleManagerProps) {
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Create admin form state
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    role: "admin" as "admin" | "volunteer",
  });

  // Fetch admin accounts
  const fetchAdminAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/list");
      const result = await response.json();

      if (result.success) {
        setAdminAccounts(result.data);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error fetching admin accounts:", error);
      alert("Failed to fetch admin accounts");
    } finally {
      setLoading(false);
    }
  };

  // Create admin account
  const handleCreateAdmin = async () => {
    if (!createForm.email || !createForm.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const result = await response.json();

      if (result.success) {
        alert("Admin account created successfully!");
        setCreateForm({ email: "", password: "", role: "admin" });
        setShowCreateForm(false);
        fetchAdminAccounts();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating admin account:", error);
      alert("Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  // Update admin role
  const handleUpdateRole = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const result = await response.json();

      if (result.success) {
        setAdminAccounts((prev) =>
          prev.map((admin) =>
            admin.id === userId ? { ...admin, role: newRole as any } : admin,
          ),
        );
        alert("Role updated successfully!");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // Delete admin account
  const handleDeleteAdmin = async (userId: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the admin account for ${email}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        setAdminAccounts((prev) => prev.filter((admin) => admin.id !== userId));
        alert("Admin account deleted successfully!");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting admin account:", error);
      alert("Failed to delete admin account");
    } finally {
      setLoading(false);
    }
  };

  // Filter admins based on search and role
  const filteredAdmins = adminAccounts.filter((admin) => {
    const matchesSearch = admin.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get role statistics
  const roleStats = {
    total: adminAccounts.length,
    admins: adminAccounts.filter((a) => a.role === "admin").length,
    volunteers: adminAccounts.filter((a) => a.role === "volunteer").length,
  };

  // Get role color for badges
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "volunteer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "volunteer":
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchAdminAccounts();
  }, []);

  return (
    <div className={className}>
      {/* Header - conditionally rendered */}
      {showHeader && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Role Manager
              </h1>
              <p className="text-gray-600">
                Manage admin accounts and assign roles: Admin or Volunteer
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAdminAccounts}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-md shadow hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {showCreateForm ? "Cancel" : "Add Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Accounts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {roleStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-blue-600">
                {roleStats.admins}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Volunteers</p>
              <p className="text-2xl font-bold text-green-600">
                {roleStats.volunteers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create New Admin Account
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      role: e.target.value as any,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleCreateAdmin}
                disabled={loading}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredAdmins.length} of {adminAccounts.length} accounts
            </div>
          </div>
        </div>

        {/* Admin Accounts List */}
        <div className="px-6 py-4">
          {loading && adminAccounts.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Loading admin accounts...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${getRoleColor(admin.role)}`}
                      >
                        {getRoleIcon(admin.role)}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{admin.email}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}
                        >
                          {admin.role === "admin"
                            ? "Admin"
                            : admin.role.charAt(0).toUpperCase() +
                              admin.role.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Created:{" "}
                          {new Date(admin.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={admin.role}
                      onChange={(e) =>
                        handleUpdateRole(admin.id, e.target.value)
                      }
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="admin">Admin</option>
                      <option value="volunteer">Volunteer</option>
                    </select>

                    <button
                      onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      disabled={loading}
                      title="Delete Account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredAdmins.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    {searchTerm || roleFilter !== "all"
                      ? "No admin accounts match your search criteria"
                      : "No admin accounts found"}
                  </p>
                  {!searchTerm && roleFilter === "all" && (
                    <p className="text-sm text-gray-400">
                      Create your first admin account above
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Role Descriptions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-900">Admin</h4>
            </div>
            <p className="text-sm text-gray-600">
              Full access to all features including user management, admin
              creation, and system settings.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Volunteer</h4>
            </div>
            <p className="text-sm text-gray-600">
              Limited access to help with check-ins, basic participant support,
              and event assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
