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

// Fallback placeholders for missing images — inline SVG data URIs to avoid extra requests
const IMAGE_PLACEHOLDERS = {
  menu: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23f5eedf%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%234e4a43%22%3EImage Loading...%3C/text%3E%3C/svg%3E',
  gallery: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23f5eedf%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%234e4a43%22%3ELoading...%3C/text%3E%3C/svg%3E',
};

// Get image URL with automatic fallback for missing or broken images
export const getImageUrl = (
  url: string | undefined | null,
  type: 'menu' | 'gallery' = 'menu'
): string => {
  // Return placeholder immediately if no URL
  if (!url || url.trim() === '') {
    return IMAGE_PLACEHOLDERS[type];
  }
  // Return URL as-is; LazyImage component handles errors
  return url;
};

// Preload critical images to check if they're accessible before rendering
export const preloadImage = (url: string): Promise<boolean> => {
  if (!url || url.trim() === '') return Promise.resolve(false);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    // Timeout after 6 seconds
    setTimeout(() => resolve(false), 6000);
  });
};
