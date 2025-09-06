/**
 * AdminService - encapsulates admin authorization checks and admin operations
 */
import { adminRepository } from "@/dal/adminRepository";
import { AuthUserDTO } from "@/dto/user.dto";
import { AuthorizationError } from "@/errors";

/**
 * Ensure the user is an admin
 * @param user - The user to check
 * @returns True if the user is an admin
 * @throws AuthorizationError if the user is not an admin
 */
export async function isAdmin(user: AuthUserDTO) {
  if (!user || !user.id) {
    throw new AuthorizationError("User not authenticated");
  }

  const isAdmin = await adminRepository.isAdmin(user.id);
  if (!isAdmin) {
    throw new AuthorizationError("User is not an admin");
  }

  return true;
}
