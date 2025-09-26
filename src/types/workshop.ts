export type Workshop = {
  id: string;
  title: string;
  description?: string | null;
  eventName: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  location?: string | null;
  maxCapacity: number | null;
  currentRegistrations: number;
  isRegistered: boolean;
  isFull: boolean;
  imageUrl?: string | null;
};

/**
 * Type definitions for workshop database operations
 */

/**
 * Data structure for inserting a new workshop into the database
 */
export type WorkshopInsertData = {
  title: string;
  description?: string | null;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  maxCapacity?: number | null;
  isActive?: boolean;
};

/**
 * Data structure for updating an existing workshop in the database
 */
export type WorkshopUpdateData = Partial<{
  title: string;
  description: string | null;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  maxCapacity: number | null;
  updatedAt: string;
}>;

/**
 * Data structure for workshop registration records
 */
export type WorkshopRegistrationData = {
  userId: string;
  workshopId: string;
  registeredAt: string;
};
