import React from 'react';

/**
 * StatCard Component
 * Displays a KPI metric with icon, number, label, and helper text
 */
const StatCard = ({ icon, label, value, helperText, colorClass = 'text-indigo-600' }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3">
                        <div className={`${colorClass}`}>
                            {icon}
                        </div>
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                    </div>
                    <div className="mt-3">
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        {helperText && (
                            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
