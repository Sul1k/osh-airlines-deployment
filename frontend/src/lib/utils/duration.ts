/**
 * Formats flight duration from minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 * 
 * Examples:
 * - 45 minutes → "45 min"
 * - 60 minutes → "1 h"
 * - 90 minutes → "1 h 30 min"
 * - 1440 minutes (24 hours) → "1 d"
 * - 1500 minutes (25 hours) → "1 d 1 h"
 * - 1725 minutes (28h 45min) → "1 d 4 h 45 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} d`);
  }

  if (hours > 0) {
    parts.push(`${hours} h`);
  }

  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} min`);
  }

  return parts.join(' ');
}
