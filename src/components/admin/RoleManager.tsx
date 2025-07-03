import React, { useState, useEffect } from "react";
import {
  Shield,
  UserPlus,
  Users,
  Settings,
  Search,
  RefreshCw,
  Trash2,
  Crown,
  Lock,
} from "lucide-react";
import { createClient } from "utils/supabase/client";

{
  /* 
  RoleManager Component - ONLY the super admin (shared account) can access and change roles
  Regular admins and volunteers cannot access this component at all
  */
}

interface AdminAccount {
  id: string;
  email: string;
  role: "admin" | "volunteer";
  status: "active" | "inactive" | "suspended";
  firstName?: string;
  lastName?: string;
  created_at: string;
}

interface RoleManagerProps {
  className?: string;
  showHeader?: boolean;
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
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const supabase = createClient();

  // Create admin form state
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "admin" as "admin" | "volunteer",
  });

  // Verify super admin access on component mount
  useEffect(() => {
    const verifySuperAdminAccess = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!user || authError) {
          setIsSuperAdmin(false);
          setIsVerifying(false);
          return;
        }

        // Check if user is super admin
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("role, status")
          .eq("id", user.id)
          .single();

        if (adminError || !adminData) {
          setIsSuperAdmin(false);
          setIsVerifying(false);
          return;
        }

        // Only allow access if user is super_admin and active
        const hasAccess =
          adminData.role === "super_admin" && adminData.status === "active";
        setIsSuperAdmin(hasAccess);
      } catch (error) {
        console.error("Error verifying super admin access:", error);
        setIsSuperAdmin(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifySuperAdminAccess();
  }, [supabase]);

  // Fetch admin accounts (only if super admin)
  const fetchAdminAccounts = async () => {
    if (!isSuperAdmin) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/list");
      const result = await response.json();

      if (result.success) {
        // Filter out super_admin accounts from the list for security
        const nonSuperAdminAccounts = result.data.filter(
          (account: any) => account.role !== "super_admin",
        );
        setAdminAccounts(nonSuperAdminAccounts);
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

  // Create admin account (super admin only)
  const handleCreateAdmin = async () => {
    if (!isSuperAdmin) {
      alert("Access denied: Super admin privileges required");
      return;
    }

    if (!createForm.email || !createForm.password) {
      alert("Please fill in email and password fields");
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
        setCreateForm({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "admin",
        });
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

  // Update admin role (super admin only)
  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!isSuperAdmin) {
      alert("Access denied: Super admin privileges required");
      return;
    }

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

  // Delete admin account (super admin only)
  const handleDeleteAdmin = async (userId: string, email: string) => {
    if (!isSuperAdmin) {
      alert("Access denied: Super admin privileges required");
      return;
    }

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
        body: JSON.stringify({
          userId,
          reason: "Account deletion by super admin",
        }),
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
    const matchesSearch =
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get role statistics
  const roleStats = {
    total: adminAccounts.length,
    admins: adminAccounts.filter((a) => a.role === "admin").length,
    volunteers: adminAccounts.filter((a) => a.role === "volunteer").length,
    active: adminAccounts.filter((a) => a.status === "active").length,
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

  // Fetch admin accounts when super admin status is confirmed
  useEffect(() => {
    if (isSuperAdmin === true) {
      fetchAdminAccounts();
    }
  }, [isSuperAdmin]);

  // Show loading during verification
  if (isVerifying) {
    return (
      <div className={`${className} flex items-center justify-center py-12`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not super admin
  if (isSuperAdmin === false) {
    return (
      <div className={`${className} bg-white rounded-lg shadow p-8`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            Only Super Administrators can access the Role Manager.
          </p>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-900">Super Admin Only</h4>
            </div>
            <p className="text-sm text-red-700">
              For security reasons, only the designated super admin account can
              create, edit, or delete admin and volunteer accounts. If you need
              access to this feature, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main component render (only for super admins)
  return (
    <div className={className}>
      {/* Header - conditionally rendered */}
      {showHeader && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Role Manager
                </h1>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Super Admin Only
                </span>
              </div>
              <p className="text-gray-600">
                Create and manage admin and volunteer accounts. Only accessible
                to super administrators.
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Settings className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-emerald-600">
                {roleStats.active}
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
            <p className="text-sm text-gray-600 mt-1">
              Create admin or volunteer accounts. Super admin accounts cannot be
              created through this interface.
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
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
                  Password *
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
                  First Name
                </label>
                <input
                  type="text"
                  value={createForm.firstName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, firstName: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={createForm.lastName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, lastName: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
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
                  placeholder="Search by email or name..."
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
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {admin.email}
                        </p>
                        {admin.firstName && admin.lastName && (
                          <span className="text-sm text-gray-500">
                            ({admin.firstName} {admin.lastName})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}
                        >
                          {admin.role === "admin"
                            ? "Admin"
                            : admin.role.charAt(0).toUpperCase() +
                              admin.role.slice(1)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            admin.status === "active"
                              ? "bg-green-100 text-green-800"
                              : admin.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.status?.charAt(0).toUpperCase() +
                            (admin.status?.slice(1) || "")}
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
              <Crown className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-900">Super Admin</h4>
            </div>
            <p className="text-sm text-gray-600">
              Ultimate system access including role management, system settings,
              and all admin capabilities. Only one super admin account exists
              for security.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Admin</h4>
            </div>
            <p className="text-sm text-gray-600">
              Full participant management, check-ins, bulk operations, and event
              coordination. Cannot create other admin accounts or access system
              settings.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Volunteer</h4>
            </div>
            <p className="text-sm text-gray-600">
              Limited access for check-ins, basic participant support, and event
              assistance. Read-only access to most features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
