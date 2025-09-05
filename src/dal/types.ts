import {
  WorkshopDTO,
  CreateWorkshopDTO,
  UpdateWorkshopDTO,
} from "@/dto/workshop.dto";
import { UserDTO, UserBasicDTO, UserProfileDTO } from "@/dto/user.dto";
import {
  WorkshopRegistrationDTO,
  RegisterWorkshopDTO,
  RegistrationStatusDTO,
} from "@/dto/workshopRegistration.dto";
import {
  ParkingPreferencesDTO,
  MarketingPreferencesDTO,
  UserSettingsDTO,
} from "@/dto/settings.dto";

/**
 * Workshop Repository Interface
 * Defines contract for workshop data access operations
 */
export interface WorkshopRepository {
  /**
   * List all active workshops for a specific event
   * @param eventName - Name of the event (e.g., "mruhacks2025")
   * @param userId - Optional user ID to include registration status
   * @returns Promise resolving to array of workshop DTOs
   */
  listActiveByEvent(eventName: string, userId?: string): Promise<WorkshopDTO[]>;

  /**
   * Get workshop by ID with optional registration status
   * @param id - Workshop unique identifier
   * @param userId - Optional user ID to include registration status
   * @returns Promise resolving to workshop DTO or null if not found
   */
  getById(id: string, userId?: string): Promise<WorkshopDTO | null>;

  /**
   * Create a new workshop
   * @param input - Workshop creation data
   * @returns Promise resolving to created workshop DTO
   */
  create(input: CreateWorkshopDTO): Promise<WorkshopDTO>;

  /**
   * Update an existing workshop
   * @param id - Workshop unique identifier
   * @param input - Workshop update data
   * @returns Promise resolving to updated workshop DTO or null if not found
   */
  update(id: string, input: UpdateWorkshopDTO): Promise<WorkshopDTO | null>;

  /**
   * Delete a workshop
   * @param id - Workshop unique identifier
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get registration count for a workshop
   * @param workshopId - Workshop unique identifier
   * @returns Promise resolving to number of registrations
   */
  getRegistrationCount(workshopId: string): Promise<number>;
}

/**
 * Workshop Registration Repository Interface
 * Defines contract for workshop registration data access operations
 */
export interface WorkshopRegistrationRepository {
  /**
   * Register a user for a workshop
   * @param userId - User unique identifier
   * @param workshopId - Workshop unique identifier
   * @returns Promise resolving to registration DTO
   */
  register(
    userId: string,
    workshopId: string,
  ): Promise<WorkshopRegistrationDTO>;

  /**
   * Unregister a user from a workshop
   * @param userId - User unique identifier
   * @param workshopId - Workshop unique identifier
   * @returns Promise resolving to true if unregistered, false if not registered
   */
  unregister(userId: string, workshopId: string): Promise<boolean>;

  /**
   * Get all workshop registrations for a user
   * @param userId - User unique identifier
   * @returns Promise resolving to array of registration DTOs
   */
  getUserRegistrations(userId: string): Promise<WorkshopRegistrationDTO[]>;

  /**
   * Get all registrations for a workshop
   * @param workshopId - Workshop unique identifier
   * @returns Promise resolving to array of registration DTOs
   */
  getWorkshopRegistrations(
    workshopId: string,
  ): Promise<WorkshopRegistrationDTO[]>;

  /**
   * Check if a user is registered for a workshop
   * @param userId - User unique identifier
   * @param workshopId - Workshop unique identifier
   * @returns Promise resolving to true if registered, false otherwise
   */
  isUserRegistered(userId: string, workshopId: string): Promise<boolean>;

  /**
   * Get registration status for a user and workshop
   * @param userId - User unique identifier
   * @param workshopId - Workshop unique identifier
   * @returns Promise resolving to registration status DTO
   */
  getRegistrationStatus(
    userId: string,
    workshopId: string,
  ): Promise<RegistrationStatusDTO>;
}

/**
 * User Repository Interface
 * Defines contract for user data access operations
 */
export interface UserRepository {
  /**
   * Get full user data by ID
   * @param id - User unique identifier
   * @returns Promise resolving to user DTO or null if not found
   */
  getById(id: string): Promise<UserDTO | null>;

  /**
   * Get basic user data by ID (limited fields for volunteers)
   * @param id - User unique identifier
   * @returns Promise resolving to basic user DTO or null if not found
   */
  getBasicById(id: string): Promise<UserBasicDTO | null>;

  /**
   * Get user profile data by ID (public information)
   * @param id - User unique identifier
   * @returns Promise resolving to user profile DTO or null if not found
   */
  getProfileById(id: string): Promise<UserProfileDTO | null>;

  /**
   * List users with pagination (full data)
   * @param limit - Maximum number of users to return (default: 50)
   * @param offset - Number of users to skip (default: 0)
   * @returns Promise resolving to array of user DTOs
   */
  list(limit?: number, offset?: number): Promise<UserDTO[]>;

  /**
   * List users with pagination (basic data)
   * @param limit - Maximum number of users to return (default: 50)
   * @param offset - Number of users to skip (default: 0)
   * @returns Promise resolving to array of basic user DTOs
   */
  listBasic(limit?: number, offset?: number): Promise<UserBasicDTO[]>;

  /**
   * Update user data
   * @param id - User unique identifier
   * @param updates - Partial user data to update
   * @returns Promise resolving to updated user DTO or null if not found
   */
  update(id: string, updates: Partial<UserDTO>): Promise<UserDTO | null>;

  /**
   * Delete a user
   * @param id - User unique identifier
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}

/**
 * Settings Repository Interface
 * Defines contract for user settings and preferences data access operations
 */
export interface SettingsRepository {
  /**
   * Get parking preferences for a user
   * @param userId - User unique identifier
   * @returns Promise resolving to parking preferences DTO
   */
  getParkingPreferences(userId: string): Promise<ParkingPreferencesDTO>;

  /**
   * Update parking preferences for a user
   * @param userId - User unique identifier
   * @param preferences - Parking preferences data
   * @returns Promise resolving when update is complete
   */
  updateParkingPreferences(
    userId: string,
    preferences: ParkingPreferencesDTO,
  ): Promise<void>;

  /**
   * Get marketing preferences for a user
   * @param userId - User unique identifier
   * @returns Promise resolving to marketing preferences DTO
   */
  getMarketingPreferences(userId: string): Promise<MarketingPreferencesDTO>;

  /**
   * Update marketing preferences for a user
   * @param userId - User unique identifier
   * @param preferences - Marketing preferences data
   * @returns Promise resolving when update is complete
   */
  updateMarketingPreferences(
    userId: string,
    preferences: MarketingPreferencesDTO,
  ): Promise<void>;

  /**
   * Get all user settings (parking + marketing)
   * @param userId - User unique identifier
   * @returns Promise resolving to combined user settings DTO
   */
  getUserSettings(userId: string): Promise<UserSettingsDTO>;
}

/**
 * Admin Repository Interface
 * Defines contract for admin-related data access operations
 */
export interface AdminRepository {
  /**
   * Check if a user has admin privileges
   * @param userId - User unique identifier
   * @returns Promise resolving to true if user is admin, false otherwise
   */
  isAdmin(userId: string): Promise<boolean>;

  /**
   * List all users (admin view)
   * @returns Promise resolving to array of user DTOs
   */
  listUsers(): Promise<UserDTO[]>;

  /**
   * Grant admin privileges to a user
   * @param userId - User unique identifier
   * @param role - Admin role to assign
   * @returns Promise resolving when admin privileges are granted
   */
  grantAdmin(userId: string, role: string): Promise<void>;

  /**
   * Revoke admin privileges from a user
   * @param userId - User unique identifier
   * @returns Promise resolving when admin privileges are revoked
   */
  revokeAdmin(userId: string): Promise<void>;
}
export { ParkingPreferencesDTO, MarketingPreferencesDTO };
