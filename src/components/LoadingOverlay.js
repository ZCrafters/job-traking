import React from 'react';

/**
 * LoadingOverlay Component
 * Full-screen loading overlay with animated spinner
 */
const LoadingOverlay = ({ message = 'Loading...', show = false }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[9998] flex items-center justify-center modal-backdrop">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 modal-content">
                <div className="flex flex-col items-center space-y-4">
                    {/* Spinner */}
                    <div className="relative">
                        {/* Outer ring */}
                        <svg className="animate-spin h-16 w-16 text-indigo-600" viewBox="0 0 24 24">
                            <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                            ></circle>
                            <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        
                        {/* Inner pulsing circle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse-slow"></div>
                        </div>
                    </div>
                    
                    {/* Message */}
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-800 animate-pulse-slow">
                            {message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Please wait...
                        </p>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-shimmer"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
