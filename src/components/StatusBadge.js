import React from 'react';
import { STATUS_MAP } from '../utils/config.js';

/**
 * StatusBadge Component
 * Displays a styled badge for application status
 */
const StatusBadge = React.memo(({ status }) => {
    const { label, class: className } = STATUS_MAP[status] || STATUS_MAP['IN_REVIEW'];
    
    return (
        <span 
            className={`px-3 py-1 text-xs font-semibold rounded-full ${className} shadow-sm status-badge animate-fadeIn`}
        >
            {label}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
