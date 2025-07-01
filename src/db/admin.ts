"use server";
import { eq, sql, and, desc, gte, lte } from "drizzle-orm";
import { db } from "./drizzle";
import {
  admins,
  profiles as profilesTable,
  users,
  adminAuditLog,
} from "./schema";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../../utils/supabase/server";

export async function isAdmin(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  // Check if user is any type of admin (admin or super_admin) and active
  const validAdminsWithId = await db
    .select()
    .from(admins)
    .where(and(eq(admins.id, auth.user.id), eq(admins.status, "active")));

  return { data: validAdminsWithId.length > 0 };
}

// Check if user is specifically a super admin
export async function isSuperAdmin(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const validSuperAdmins = await db
    .select()
    .from(admins)
    .where(
      and(
        eq(admins.id, auth.user.id),
        eq(admins.role, "super_admin"),
        eq(admins.status, "active"),
      ),
    );

  return { data: validSuperAdmins.length > 0 };
}

// Get current admin details
export async function getCurrentAdminDetails(supabase?: SupabaseClient) {
  if (!supabase) {
    supabase = await createClient();
  }

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError };
  }

  const adminDetails = await db
    .select()
    .from(admins)
    .where(eq(admins.id, auth.user.id))
    .limit(1);

  if (adminDetails.length === 0) {
    return { error: { message: "Admin not found" } };
  }

  return { data: adminDetails[0] };
}

{
  /*Super Admin only functions */
}

// List all admin accounts (super admin only)
export async function listAllAdmins() {
  try {
    const supabase = await createClient();

    // Check if current user is super admin
    const { data: isSuperAdminUser, error: superAdminError } =
      await isSuperAdmin(supabase);
    if (superAdminError || !isSuperAdminUser) {
      return {
        success: false,
        error: "Unauthorized: Super Admin access required",
      };
    }

    const adminAccounts = await db
      .select({
        id: admins.id,
        email: admins.email,
        role: admins.role,
        status: admins.status,
        firstName: admins.firstName,
        lastName: admins.lastName,
        created_at: admins.created_at,
        updated_at: admins.updated_at,
        is_admin_only: admins.is_admin_only,
      })
      .from(admins)
      .orderBy(desc(admins.created_at));

    return { success: true, data: adminAccounts };
  } catch (error) {
    console.error("Error listing admin accounts:", error);
    return { success: false, error: "Failed to list admin accounts" };
  }
}

// Create new admin account
export async function createAdminAccount(
  email: string,
  password: string,
  role: "admin" | "super_admin" = "admin",
  firstName?: string,
  lastName?: string,
) {
  try {
    const supabase = await createClient();

    // Check if current user is super admin
    const { data: isSuperAdminUser, error: superAdminError } =
      await isSuperAdmin(supabase);
    if (superAdminError || !isSuperAdminUser) {
      return {
        success: false,
        error: "Unauthorized: Super Admin access required",
      };
    }

    // Get current user for audit logging
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Check if email already exists in profiles (regular users)
    const existingUser = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: "This email is already registered as a regular user",
      };
    }

    // Check if email already exists in admins
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    if (existingAdmin.length > 0) {
      return {
        success: false,
        error: "Admin account with this email already exists",
      };
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          account_type: "admin_only",
          role: role,
          firstName: firstName,
          lastName: lastName,
        },
      });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Failed to create admin account",
      };
    }

    // Add to admins table
    await db.insert(admins).values({
      id: authData.user.id,
      email: email,
      role: role,
      status: "active",
      firstName: firstName,
      lastName: lastName,
      is_admin_only: true,
    });

    // Log the action
    await logAdminAction(
      currentUser?.id || "",
      "CREATE_ADMIN",
      authData.user.id,
      email,
      {
        role: role,
        firstName: firstName,
        lastName: lastName,
      },
    );

    return {
      success: true,
      message: `${role} account created successfully`,
      userId: authData.user.id,
    };
  } catch (error) {
    console.error("Error creating admin account:", error);
    return { success: false, error: "Failed to create admin account" };
  }
}

// Update admin role (super admin only)
export async function updateAdminRole(
  userId: string,
  newRole: "admin" | "super_admin",
) {
  try {
    const supabase = await createClient();

    // Check if current user is super admin
    const { data: isSuperAdminUser, error: superAdminError } =
      await isSuperAdmin(supabase);
    if (superAdminError || !isSuperAdminUser) {
      return {
        success: false,
        error: "Unauthorized: Super Admin access required",
      };
    }

    // Get current user for audit logging
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Get current admin data
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, userId))
      .limit(1);

    if (existingAdmin.length === 0) {
      return { success: false, error: "Admin account not found" };
    }

    const oldRole = existingAdmin[0].role;

    // Prevent demoting the last super admin
    if (oldRole === "super_admin" && newRole !== "super_admin") {
      const superAdminCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(admins)
        .where(
          and(eq(admins.role, "super_admin"), eq(admins.status, "active")),
        );

      if (superAdminCount[0].count <= 1) {
        return { success: false, error: "Cannot demote the last super admin" };
      }
    }

    // Update role in admins table
    await db.update(admins).set({ role: newRole }).where(eq(admins.id, userId));

    // Update in Supabase user metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        account_type: "admin_only",
        role: newRole,
        firstName: existingAdmin[0].firstName,
        lastName: existingAdmin[0].lastName,
      },
    });

    // Log the action
    await logAdminAction(
      currentUser?.id || "",
      "UPDATE_ADMIN_ROLE",
      userId,
      existingAdmin[0].email,
      {
        oldRole: oldRole,
        newRole: newRole,
      },
    );

    return { success: true, message: "Admin role updated successfully" };
  } catch (error) {
    console.error("Error updating admin role:", error);
    return { success: false, error: "Failed to update admin role" };
  }
}

// Update admin status (super admin only)
export async function updateAdminStatus(
  userId: string,
  newStatus: "active" | "inactive" | "suspended",
  reason?: string,
) {
  try {
    const supabase = await createClient();

    // Check if current user is super admin
    const { data: isSuperAdminUser, error: superAdminError } =
      await isSuperAdmin(supabase);
    if (superAdminError || !isSuperAdminUser) {
      return {
        success: false,
        error: "Unauthorized: Super Admin access required",
      };
    }

    // Get current user for audit logging
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Don't allow changing your own status
    if (currentUser?.id === userId) {
      return { success: false, error: "Cannot change your own admin status" };
    }

    // Get current admin data
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, userId))
      .limit(1);

    if (existingAdmin.length === 0) {
      return { success: false, error: "Admin account not found" };
    }

    const oldStatus = existingAdmin[0].status;

    // Prevent deactivating the last active super admin
    if (existingAdmin[0].role === "super_admin" && newStatus !== "active") {
      const activeSuperAdminCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(admins)
        .where(
          and(eq(admins.role, "super_admin"), eq(admins.status, "active")),
        );

      if (activeSuperAdminCount[0].count <= 1) {
        return {
          success: false,
          error: "Cannot deactivate the last active super admin",
        };
      }
    }

    // Update status in admins table
    await db
      .update(admins)
      .set({ status: newStatus })
      .where(eq(admins.id, userId));

    // Log the action
    await logAdminAction(
      currentUser?.id || "",
      `UPDATE_ADMIN_STATUS_${newStatus.toUpperCase()}`,
      userId,
      existingAdmin[0].email,
      {
        oldStatus: oldStatus,
        newStatus: newStatus,
        reason: reason,
      },
    );

    return { success: true, message: `Admin status updated to ${newStatus}` };
  } catch (error) {
    console.error("Error updating admin status:", error);
    return { success: false, error: "Failed to update admin status" };
  }
}

// Delete admin account completely (super admin only)
export async function deleteAdminAccount(userId: string, reason: string) {
  try {
    const supabase = await createClient();

    // Check if current user is super admin
    const { data: isSuperAdminUser, error: superAdminError } =
      await isSuperAdmin(supabase);
    if (superAdminError || !isSuperAdminUser) {
      return {
        success: false,
        error: "Unauthorized: Super Admin access required",
      };
    }

    // Get current user for audit logging
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Don't allow deleting yourself
    if (currentUser?.id === userId) {
      return { success: false, error: "Cannot delete your own admin account" };
    }

    // Get admin data before deletion
    const adminToDelete = await db
      .select()
      .from(admins)
      .where(eq(admins.id, userId))
      .limit(1);

    if (adminToDelete.length === 0) {
      return { success: false, error: "Admin account not found" };
    }

    // Prevent deleting the last super admin
    if (adminToDelete[0].role === "super_admin") {
      const superAdminCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(admins)
        .where(
          and(eq(admins.role, "super_admin"), eq(admins.status, "active")),
        );

      if (superAdminCount[0].count <= 1) {
        return { success: false, error: "Cannot delete the last super admin" };
      }
    }

    // Log the action before deletion
    await logAdminAction(
      currentUser?.id || "",
      "DELETE_ADMIN",
      userId,
      adminToDelete[0].email,
      {
        role: adminToDelete[0].role,
        reason: reason,
      },
    );

    // Remove from admins table
    await db.delete(admins).where(eq(admins.id, userId));

    // Delete from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return {
        success: true,
        message: "Admin access removed (auth deletion failed)",
      };
    }

    return { success: true, message: "Admin account deleted successfully" };
  } catch (error) {
    console.error("Error deleting admin account:", error);
    return { success: false, error: "Failed to delete admin account" };
  }
}

{
  /* Audit and system stats functions */
}
// Get system statistics (super admin only)
export async function getSystemStats() {
  try {
    const supabase = await createClient();

    // Check if current user is super admin
    const { data: isSuperAdminUser, error: superAdminError } =
      await isSuperAdmin(supabase);
    if (superAdminError || !isSuperAdminUser) {
      return {
        success: false,
        error: "Unauthorized: Super Admin access required",
      };
    }

    const [
      totalUsersResult,
      totalAdminsResult,
      superAdminsResult,
      activeAdminsResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(profilesTable),
      db.select({ count: sql<number>`count(*)` }).from(admins),
      db
        .select({ count: sql<number>`count(*)` })
        .from(admins)
        .where(eq(admins.role, "super_admin")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(admins)
        .where(eq(admins.status, "active")),
    ]);

    return {
      success: true,
      data: {
        totalUsers: totalUsersResult[0].count,
        totalAdmins: totalAdminsResult[0].count,
        superAdmins: superAdminsResult[0].count,
        activeAdmins: activeAdminsResult[0].count,
        inactiveAdmins:
          totalAdminsResult[0].count - activeAdminsResult[0].count,
      },
    };
  } catch (error) {
    console.error("Error getting system stats:", error);
    return { success: false, error: "Failed to get system statistics" };
  }
}

// Get audit logs (super admin only)
export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0,
  adminId?: string,
  action?: string,
  startDate?: string,
  endDate?: string,
) {
  try {
    const supabase = await createClient();

    // Check if current user is super admin
    const { data: isSuperAdminUser, error: superAdminError } =
      await isSuperAdmin(supabase);
    if (superAdminError || !isSuperAdminUser) {
      return {
        success: false,
        error: "Unauthorized: Super Admin access required",
      };
    }

    // Build conditions array
    const conditions = [];

    if (adminId) {
      conditions.push(eq(adminAuditLog.admin_id, adminId));
    }

    if (action) {
      conditions.push(eq(adminAuditLog.action, action));
    }

    if (startDate) {
      conditions.push(gte(adminAuditLog.created_at, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(adminAuditLog.created_at, new Date(endDate)));
    }

    const baseQuery = db
      .select({
        id: adminAuditLog.id,
        admin_id: adminAuditLog.admin_id,
        action: adminAuditLog.action,
        target_user_id: adminAuditLog.target_user_id,
        target_email: adminAuditLog.target_email,
        details: adminAuditLog.details,
        ip_address: adminAuditLog.ip_address,
        user_agent: adminAuditLog.user_agent,
        created_at: adminAuditLog.created_at,
        admin_email: admins.email,
        admin_firstName: admins.firstName,
        admin_lastName: admins.lastName,
      })
      .from(adminAuditLog)
      .leftJoin(admins, eq(adminAuditLog.admin_id, admins.id));

    // Execute query with conditions if any exist
    const auditLogs =
      conditions.length > 0
        ? await baseQuery
            .where(and(...conditions))
            .orderBy(desc(adminAuditLog.created_at))
            .limit(limit)
            .offset(offset)
        : await baseQuery
            .orderBy(desc(adminAuditLog.created_at))
            .limit(limit)
            .offset(offset);

    return { success: true, data: auditLogs };
  } catch (error) {
    console.error("Error getting audit logs:", error);
    return { success: false, error: "Failed to get audit logs" };
  }
}

// Log admin action (internal function)
export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  targetEmail?: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    await db.insert(adminAuditLog).values({
      admin_id: adminId,
      action: action,
      target_user_id: targetUserId,
      target_email: targetEmail,
      details: details ? JSON.stringify(details) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error("Error logging admin action:", error);
    // Don't throw error - logging failure shouldn't break main operation
  }
}

// List regular users
export async function listUsers() {
  return await db
    .select()
    .from(profilesTable)
    .innerJoin(users, eq(users.id, profilesTable.id));
}

// Create admin-only account
export async function createAdminOnlyAccount(
  email: string,
  password: string,
  role: string = "admin",
) {
  // Redirect to new createAdminAccount function
  return await createAdminAccount(
    email,
    password,
    role as "admin" | "super_admin",
  );
}

// List only admin accounts
export async function listAdminOnlyAccounts() {
  try {
    const adminAccounts = await db
      .select({
        id: admins.id,
        email: admins.email,
        role: admins.role,
        created_at: admins.created_at,
      })
      .from(admins)
      .where(eq(admins.is_admin_only, true));

    return { success: true, data: adminAccounts };
  } catch (error) {
    console.error("Error listing admin accounts:", error);
    return { success: false, error: "Failed to list admin accounts" };
  }
}

// Delete admin-only account
export async function deleteAdminOnlyAccount(userId: string) {
  return await deleteAdminAccount(userId, "Admin account deletion");
}

// Count regular users only
export async function getRegularUserCount() {
  try {
    const userCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(profilesTable);

    return { success: true, data: userCount[0].count };
  } catch (error) {
    console.error("Error counting users:", error);
    return { success: false, error: "Failed to count users" };
  }
}

// Check if a specific user ID is an admin-only account
export async function isAdminOnlyAccount(userId: string) {
  try {
    const adminUser = await db
      .select()
      .from(admins)
      .where(and(eq(admins.id, userId), eq(admins.is_admin_only, true)))
      .limit(1);

    return { success: true, data: adminUser.length > 0 };
  } catch (error) {
    console.error("Error checking admin-only status:", error);
    return { success: false, error: "Failed to check admin-only status" };
  }
}
