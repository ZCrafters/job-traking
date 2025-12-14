/**
 * KPI Calculation Utility Functions
 */

/**
 * Calculate various KPIs from applications data
 * @param {Array} apps - Array of application objects
 * @returns {object} Object containing calculated KPIs
 */
export const calculateKPIs = (apps) => {
    const totalFinalized = apps.filter(a => 
        a.status === 'OFFER' || a.status === 'REJECTED' || a.status === 'DONE_PROJECT'
    ).length;
    
    const totalOffers = apps.filter(a => a.status === 'OFFER').length;
    
    const totalActive = apps.filter(a => 
        a.status === 'IN_REVIEW' || 
        a.status === 'SUBMITTED' || 
        a.status === 'INTERVIEW' || 
        a.status === 'ACTION'
    ).length;
    
    // Success Rate
    const successRate = totalFinalized > 0 
        ? ((totalOffers / totalFinalized) * 100).toFixed(0) + '%' 
        : '0%';

    // Time Since Last Action
    let timeSinceLastAction = 'N/A';
    if (apps.length > 0) {
        const latestTimestamp = apps.reduce((max, app) => 
            Math.max(max, app.timestamp.getTime()), 0
        );
        const diff = Date.now() - latestTimestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
             timeSinceLastAction = `${days} hari lalu`;
        } else if (hours > 0) {
             timeSinceLastAction = `${hours} jam lalu`;
        } else {
             timeSinceLastAction = 'Baru saja';
        }
    }
    
    return { 
        successRate, 
        totalActive, 
        timeSinceLastAction,
        totalFinalized,
        totalOffers
    };
};

/**
 * Calculate conversion rate between statuses
 * @param {Array} apps - Array of application objects
 * @param {string} fromStatus - Starting status
 * @param {string} toStatus - Ending status
 * @returns {number} Conversion rate as percentage
 */
export const calculateConversionRate = (apps, fromStatus, toStatus) => {
    const fromCount = apps.filter(a => a.status === fromStatus).length;
    const toCount = apps.filter(a => a.status === toStatus).length;
    
    if (fromCount === 0) return 0;
    return ((toCount / fromCount) * 100).toFixed(1);
};

/**
 * Get applications by status
 * @param {Array} apps - Array of application objects
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered applications
 */
export const getApplicationsByStatus = (apps, status) => {
    return apps.filter(a => a.status === status);
};

/**
 * Get count of applications by status
 * @param {Array} apps - Array of application objects
 * @returns {object} Object with status counts
 */
export const getStatusCounts = (apps) => {
    return apps.reduce((acc, app) => {
        const status = app.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
};
