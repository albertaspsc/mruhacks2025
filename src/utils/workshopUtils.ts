/**
 * Formats a date into a human-readable string with weekday, month, and day.
 *
 * @param date - The date to format, either as a string or Date object
 * @returns A formatted date string (e.g., "Mon, Jan 15")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a time string from 24-hour format to 12-hour format with AM/PM.
 *
 * @param time - The time string to format (e.g., "14:30" or "14:30:00")
 * @returns A formatted time string in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime(time: string): string {
  if (!time) return "";
  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return time;

  // Create a date object with today's date and the parsed time
  const [hours, minutes] = match.slice(1, 3).map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Generates a capacity label for a workshop showing current registrations vs max capacity.
 *
 * @param workshop - Object containing capacity information
 * @param workshop.maxCapacity - Maximum number of participants allowed (null if unlimited)
 * @param workshop.currentRegistrations - Current number of registered participants
 * @returns A formatted capacity string (e.g., "15/20" or "15" if unlimited)
 */
export function getCapacityLabel(workshop: {
  maxCapacity: number | null;
  currentRegistrations: number;
}): string {
  return workshop.maxCapacity && workshop.maxCapacity > 0
    ? `${workshop.currentRegistrations}/${workshop.maxCapacity}`
    : `${workshop.currentRegistrations}`;
}

/**
 * Checks if a workshop is at full capacity.
 *
 * @param workshop - Object containing capacity information
 * @param workshop.maxCapacity - Maximum number of participants allowed (null if unlimited)
 * @param workshop.currentRegistrations - Current number of registered participants
 * @returns True if the workshop is at full capacity, false otherwise
 */
export function isWorkshopFull(workshop: {
  maxCapacity: number | null;
  currentRegistrations: number;
}): boolean {
  return (
    workshop.maxCapacity !== null &&
    workshop.maxCapacity > 0 &&
    workshop.currentRegistrations >= workshop.maxCapacity
  );
}

/**
 * Calculates the remaining capacity for a workshop.
 *
 * @param workshop - Object containing capacity information
 * @param workshop.maxCapacity - Maximum number of participants allowed (null if unlimited)
 * @param workshop.currentRegistrations - Current number of registered participants
 * @returns The number of remaining spots, or null if unlimited capacity
 */
export function getRemainingCapacity(workshop: {
  maxCapacity: number | null;
  currentRegistrations: number;
}): number | null {
  if (workshop.maxCapacity === null || workshop.maxCapacity <= 0) {
    return null;
  }
  return Math.max(0, workshop.maxCapacity - workshop.currentRegistrations);
}

/**
 * Formats a workshop duration from start and end times.
 *
 * @param startTime - The start time string (e.g., "09:00")
 * @param endTime - The end time string (e.g., "17:00")
 * @returns A formatted duration string (e.g., "9:00 AM - 5:00 PM")
 */
export function formatWorkshopDuration(
  startTime: string,
  endTime: string,
): string {
  const formattedStart = formatTime(startTime);
  const formattedEnd = formatTime(endTime);
  return `${formattedStart} - ${formattedEnd}`;
}
