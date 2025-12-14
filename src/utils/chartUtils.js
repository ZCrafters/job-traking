/**
 * Chart and Visualization Utility Functions
 */

/**
 * Convert polar coordinates to cartesian for pie chart drawing
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} radius - Radius of the circle
 * @param {number} angleInDegrees - Angle in degrees
 * @returns {object} Object with x and y coordinates
 */
export const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

/**
 * Describe an arc path for SVG drawing
 * @param {number} x - Center X coordinate
 * @param {number} y - Center Y coordinate
 * @param {number} radius - Radius of the arc
 * @param {number} startAngle - Start angle in degrees
 * @param {number} endAngle - End angle in degrees
 * @returns {string} SVG path string
 */
export const describeArc = (x, y, radius, startAngle, endAngle) => {
    if (endAngle >= 360) endAngle = 359.999;
    
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", x, y,
        "Z"
    ].join(" ");
    return d;
};

/**
 * Calculate percentages for data visualization
 * @param {Array} data - Array of values
 * @returns {Array} Array of percentages
 */
export const calculatePercentages = (data) => {
    const total = data.reduce((sum, val) => sum + val, 0);
    return data.map(val => total > 0 ? (val / total * 100).toFixed(1) : 0);
};
