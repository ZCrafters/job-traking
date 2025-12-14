import React, { useState } from 'react';
import StatusBadge from './StatusBadge.js';
import { timeAgo } from '../utils/timeUtils.js';

/**
 * ApplicationCard Component
 * Displays a single application with all details and actions
 */
const ApplicationCard = ({ 
    app, 
    onEdit, 
    onDelete, 
    onGenerateEmail, 
    isEmailLoading, 
    onGenerateStrategy, 
    isStrategyLoading, 
    onCVCheck, 
    isCVCheckLoading 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const nextStepSummary = app.notes?.split('\n')[0] || 'No immediate next step.';

    // Determine visibility based on relevance
    const showStrategy = app.status === 'INTERVIEW' || app.status === 'ACTION';
    const showCVCheck = app.status === 'TO_APPLY' || app.status === 'IN_REVIEW';

    return (
        <div className="bg-white p-5 rounded-2xl shadow-md border-t-4 border-indigo-500 transition-all-smooth hover-lift stagger-item">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                
                {/* Status & Title (Hierarchy) */}
                <div className="col-span-12 lg:col-span-5">
                    <StatusBadge status={app.status} />
                    <div className="mt-2 text-xl font-extrabold text-gray-800 animate-slideInLeft">
                        {app.role}
                    </div>
                    <div className="text-sm text-gray-500 font-medium animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                        at {app.company}
                    </div>
                </div>

                {/* Details */}
                <div className="col-span-12 md:col-span-7 lg:col-span-5 text-sm space-y-1">
                    <div className="flex items-center text-gray-600 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {app.location || 'N/A'}
                    </div>
                    <div className="flex items-center text-gray-600 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Applied: {app.appliedDate}
                    </div>
                    <div className="flex items-center text-gray-600 text-xs font-medium italic animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Updated: {timeAgo(app.timestamp)}
                    </div>
                    
                    {/* Expandable Notes Section */}
                    <div className="pt-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center text-gray-800 font-semibold hover:text-indigo-600 transition-all-smooth"
                        >
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            Next Step: <span className="ml-1 text-indigo-700">{nextStepSummary}</span>
                            <svg 
                                className={`w-4 h-4 ml-2 transition-transform-smooth ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        
                        {isExpanded && app.notes && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap animate-fadeIn">
                                {app.notes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="col-span-12 lg:col-span-2 flex lg:flex-col justify-end lg:items-end space-x-3 lg:space-x-0 lg:space-y-3 pt-2">
                    {/* CV Quality Check (AI) */}
                    {showCVCheck && (
                        <div className="tooltip">
                            <button 
                                onClick={() => onCVCheck(app)} 
                                disabled={isCVCheckLoading === app.id}
                                className="text-gray-500 hover:text-blue-600 transition-all-smooth disabled:opacity-50 ripple"
                                aria-label="CV Quality Check (AI)"
                            >
                                {isCVCheckLoading === app.id ? (
                                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                )}
                            </button>
                            <span className="tooltip-text">CV Quality Check</span>
                        </div>
                    )}
                    
                    {/* Interview Strategy (AI) */}
                    {showStrategy && (
                        <div className="tooltip">
                            <button 
                                onClick={() => onGenerateStrategy(app)} 
                                disabled={isStrategyLoading === app.id}
                                className="text-gray-500 hover:text-green-600 transition-all-smooth disabled:opacity-50 ripple"
                                aria-label="Generate Interview Strategy (AI)"
                            >
                                {isStrategyLoading === app.id ? (
                                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l-2 2M15 19h2M9 19h6m-6 0a3 3 0 00-3-3H5a2 2 0 01-2-2V8a2 2 0 012-2h4l2-2 2 2h4a2 2 0 012 2v10a2 2 0 01-2 2h-2a3 3 0 00-3 3z"></path>
                                    </svg>
                                )}
                            </button>
                            <span className="tooltip-text">Interview Strategy</span>
                        </div>
                    )}
                    
                    {/* Draft Follow-up Email */}
                    <div className="tooltip">
                        <button 
                            onClick={() => onGenerateEmail(app)} 
                            disabled={isEmailLoading === app.id}
                            className="text-gray-500 hover:text-pink-600 transition-all-smooth disabled:opacity-50 ripple"
                            aria-label="Draft Follow-up Email (AI)"
                        >
                            {isEmailLoading === app.id ? (
                                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.88 5.25a2 2 0 002.24 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            )}
                        </button>
                        <span className="tooltip-text">Draft Email</span>
                    </div>
                    
                    {app.link && (
                        <div className="tooltip">
                            <a 
                                href={app.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-500 hover:text-indigo-600 transition-all-smooth" 
                                aria-label={`Go to application link for ${app.role}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                            </a>
                            <span className="tooltip-text">Open Link</span>
                        </div>
                    )}
                    
                    <div className="tooltip">
                        <button 
                            onClick={() => onEdit(app)} 
                            className="text-gray-500 hover:text-green-600 transition-all-smooth ripple" 
                            aria-label={`Edit application ${app.role}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                        </button>
                        <span className="tooltip-text">Edit</span>
                    </div>
                    
                    <div className="tooltip">
                        <button 
                            onClick={() => onDelete(app.id)} 
                            className="text-gray-500 hover:text-red-600 transition-all-smooth ripple" 
                            aria-label={`Delete application ${app.role}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                        <span className="tooltip-text">Delete</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationCard;
