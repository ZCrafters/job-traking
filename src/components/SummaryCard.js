import React from 'react';

/**
 * SummaryCard Component
 * Displays a summary metric card with icon and description
 */
const SummaryCard = ({ title, count, colorClass, icon, description }) => {
    return (
        <div className={`p-5 rounded-xl shadow-lg transition-all-smooth hover-lift ${colorClass} animate-scaleIn`}>
            <div className="flex justify-between items-start text-gray-800">
                <div className="text-3xl font-bold">{count}</div>
                <div className="p-2 rounded-full bg-white bg-opacity-30">
                    {icon}
                </div>
            </div>
            <p className="mt-3 text-sm font-semibold uppercase opacity-90 text-gray-700">
                {title}
            </p>
            {description && (
                <p className="text-xs text-gray-500 mt-1">
                    {description}
                </p>
            )}
        </div>
    );
};

export default SummaryCard;
