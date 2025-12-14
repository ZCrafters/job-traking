/**
 * Time and Date Utility Functions
 */

/**
 * Convert timestamp to readable 'X time ago' format
 * @param {Date} date - The date to convert
 * @returns {string} Human-readable time ago string
 */
export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
    return "just now";
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
};

/**
 * Check if a date is within a certain number of days
 * @param {Date} date - The date to check
 * @param {number} days - Number of days
 * @returns {boolean} True if within days
 */
export const isWithinDays = (date, days) => {
    const diff = new Date() - new Date(date);
    return diff <= days * 24 * 60 * 60 * 1000;
};
