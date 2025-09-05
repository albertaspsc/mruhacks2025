import { adminRepository } from "@/dal/adminRepository";
import { AdminRepository } from "@/dal/types";
import { AuthUserDTO } from "@/dto/user.dto";
import { AuthorizationError } from "@/errors";

/**
 * AdminService - encapsulates admin authorization checks and admin operations
 */
export class AdminService {
  private repo: AdminRepository;

  constructor(repo: AdminRepository = adminRepository) {
    this.repo = repo;
  }

  /**
   * Check whether the provided user has admin privileges
   */
  async ensureIsAdmin(user: AuthUserDTO) {
    if (!user || !user.id) {
      throw new AuthorizationError("User not authenticated");
    }

    const isAdmin = await this.repo.isAdmin(user.id);
    if (!isAdmin) {
      throw new AuthorizationError("User is not an admin");
    }
    return true;
  }

  /**
   * Ensure user has one of the allowed roles
   */
  async ensureHasRole(user: AuthUserDTO, allowedRoles: string[]) {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      throw new Error("allowedRoles must be a non-empty array");
    }

    // If user.role is 'user', check DB for admin record to derive role
    const isAdmin = await this.repo.isAdmin(user.id);
    if (!isAdmin) {
      throw new AuthorizationError("Insufficient permissions");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AuthorizationError("Insufficient permissions");
    }

    return true;
  }
}

export const adminService = new AdminService();
