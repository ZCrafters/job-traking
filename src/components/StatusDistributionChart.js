import React, { useMemo } from 'react';
import { STATUS_MAP } from '../utils/config.js';
import { describeArc } from '../utils/chartUtils.js';

/**
 * StatusDistributionChart Component
 * Displays a pie chart visualization of application status distribution
 */
const StatusDistributionChart = React.memo(({ applications }) => {
    // Memoize expensive chart calculations
    const chartData = useMemo(() => {
        const counts = applications.reduce((acc, app) => {
            const statusKey = app.status;
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {});
        
        const data = Object.keys(counts).map(status => ({
            label: STATUS_MAP[status].label,
            value: counts[status],
            color: STATUS_MAP[status].color,
        })).filter(item => item.value > 0);

        const total = applications.length;

        let startAngle = 0;
        const slices = data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const endAngle = startAngle + angle;

            const pathData = describeArc(100, 100, 100, startAngle, endAngle);
            startAngle = endAngle;
            
            return (
                <path 
                    key={item.label}
                    d={pathData}
                    fill={item.color}
                    className="transition-all-smooth hover:opacity-80 cursor-pointer"
                    style={{
                        animation: `scaleIn 0.5s ease-out ${index * 0.1}s both`
                    }}
                />
            );
        });
        
        return { data, total, slices };
    }, [applications]);
    
    const { data, total, slices } = chartData;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full animate-fadeIn">
            <h3 className="font-garamond text-xl font-bold text-gray-800 mb-4">
                Status Distribution
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-around space-y-4 md:space-y-0">
                <div className="relative">
                    <svg width="150" height="150" viewBox="0 0 200 200" className="transform transition-transform-smooth hover:scale-105">
                        {slices}
                        <circle cx="100" cy="100" r="40" fill="white" />
                        <text 
                            x="100" 
                            y="100" 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            className="text-2xl font-bold fill-gray-700"
                        >
                            {total}
                        </text>
                    </svg>
                </div>
                <div className="space-y-1">
                    {data.map((item, index) => (
                        <div 
                            key={item.label} 
                            className="flex items-center text-sm animate-slideInRight"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <span 
                                className="w-3 h-3 rounded-full mr-2 transition-transform-smooth hover:scale-125" 
                                style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="font-medium">
                                {item.label}: {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

StatusDistributionChart.displayName = 'StatusDistributionChart';

export default StatusDistributionChart;
