/**
 * Input Utility Functions
 * Functions for sanitizing and validating user inputs
 */

/**
 * Sanitize input to prevent prompt injection
 * Removes potential prompt injection patterns while preserving normal text
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
    if (!input) return '';
    // Remove potential prompt injection patterns while preserving normal text
    return String(input)
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/\n\s*\n/g, '\n') // Collapse multiple newlines
        .trim()
        .slice(0, 500); // Limit length to prevent overly long inputs
};

/**
 * Validate required fields are present
 * @param {object} fields - Object with field names as keys and values
 * @returns {object} { isValid: boolean, missingFields: string[] }
 */
export const validateRequiredFields = (fields) => {
    const missingFields = Object.entries(fields)
        .filter(([_, value]) => !value || value.trim().length === 0)
        .map(([key, _]) => key);
    
    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};
