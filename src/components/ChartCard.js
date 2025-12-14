import React from 'react';

/**
 * ChartCard Component
 * Container for charts with title and subtitle
 */
const ChartCard = ({ title, subtitle, children, actions }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center space-x-2">
                        {actions}
                    </div>
                )}
            </div>
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
};

export default ChartCard;
