/**
 * Debug Time Utility
 * 
 * This utility allows you to hardcode a specific time for testing/debugging.
 * Set DEBUG_MODE to true and set DEBUG_TIME to your desired time (HH:MM format).
 * 
 * Usage in components:
 * import { getCurrentDebugTime } from '../utils/debugTime';
 * const now = getCurrentDebugTime();
 */

// ========== CONFIGURATION ==========
// Set to true to enable debug mode, false to use real time
export const DEBUG_MODE = false;

// Your hardcoded debug time (HH:MM format, 24-hour)
// Example values:
// "08:00" - 8 AM
// "12:30" - 12:30 PM
// "18:45" - 6:45 PM
export const DEBUG_TIME = "6:00";

// Optional: Set a specific debug date (YYYY-MM-DD format)
// Leave as null to use today's date
export const DEBUG_DATE = null; // Example: "2026-04-01"

// ========== DO NOT MODIFY BELOW ==========

/**
 * Parse debug time and return a Date object
 */
function parseDebugTime(): Date {
  let date: Date;

  if (DEBUG_DATE) {
    // Use the specified debug date
    date = new Date(DEBUG_DATE);
  } else {
    // Use today's date
    date = new Date();
    date.setHours(0, 0, 0, 0); // Reset to start of day
  }

  // Parse HH:MM format
  const [hours, minutes] = DEBUG_TIME.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);

  return date;
}

/**
 * Get current time for debugging
 * Returns the debug time if DEBUG_MODE is true, otherwise returns real current time
 */
export function getCurrentDebugTime(): Date {
  if (DEBUG_MODE) {
    return parseDebugTime();
  }
  return new Date();
}

/**
 * Get current time as HH:MM format string
 */
export function getCurrentTimeString(): string {
  const now = getCurrentDebugTime();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Get current date as YYYY-MM-DD format string
 */
export function getCurrentDateString(): string {
  const now = getCurrentDebugTime();
  return now.toISOString().slice(0, 10);
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return DEBUG_MODE;
}
