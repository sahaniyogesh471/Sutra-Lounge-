/**
 * Converts a 24-hour time string (e.g. "18:30") to 12-hour format (e.g. "6:30 PM").
 * Returns the original string if it cannot be parsed.
 */
export const formatTimeTo12Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  try {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutesStr || '00'} ${ampm}`;
  } catch {
    return timeStr;
  }
};
