import React, { useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import StatusBadge from './StatusBadge.js';
import ZdogIcon from './ZdogIcon.js';
import { timeAgo } from '../utils/timeUtils.js';

/**
 * ApplicationCardEnhanced Component
 * Enhanced application card with DaisyUI, HeadlessUI, and 3D icons
 */
const ApplicationCardEnhanced = ({ 
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
    const nextStepSummary = app.notes?.split('\n')[0] || 'No immediate next step.';
    const showStrategy = app.status === 'INTERVIEW' || app.status === 'ACTION';
    const showCVCheck = app.status === 'TO_APPLY' || app.status === 'IN_REVIEW';

    return (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-primary animate-fade-in">
            <div className="card-body">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    
                    {/* Left Section - Status & Title */}
                    <div className="lg:col-span-5 space-y-3">
                        <StatusBadge status={app.status} />
                        
                        <h2 className="card-title text-2xl font-bold text-base-content animate-slide-in-left">
                            {app.role}
                        </h2>
                        
                        <div className="flex items-center gap-2 text-base-content/70">
                            <ZdogIcon type="briefcase" size={24} rotating={false} color="#667eea" />
                            <span className="font-medium">{app.company}</span>
                        </div>
                    </div>

                    {/* Middle Section - Details */}
                    <div className="lg:col-span-5 space-y-2">
                        <div className="badge badge-outline gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            {app.location || 'N/A'}
                        </div>
                        
                        <div className="badge badge-outline gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {app.appliedDate}
                        </div>

                        <div className="text-sm text-base-content/60 italic flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Updated: {timeAgo(app.timestamp)}
                        </div>

                        {/* Expandable Notes */}
                        <Disclosure>
                            {({ open }) => (
                                <>
                                    <Disclosure.Button className="btn btn-ghost btn-sm gap-2 w-full justify-start">
                                        <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                        </svg>
                                        <span className="text-sm font-semibold">Next Step: {nextStepSummary}</span>
                                        <svg 
                                            className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </Disclosure.Button>
                                    
                                    <Transition
                                        enter="transition duration-200 ease-out"
                                        enterFrom="transform scale-95 opacity-0"
                                        enterTo="transform scale-100 opacity-100"
                                        leave="transition duration-150 ease-out"
                                        leaveFrom="transform scale-100 opacity-100"
                                        leaveTo="transform scale-95 opacity-0"
                                    >
                                        <Disclosure.Panel className="mt-2">
                                            <div className="alert alert-info shadow-lg">
                                                <div>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                    <div className="text-sm whitespace-pre-wrap">{app.notes}</div>
                                                </div>
                                            </div>
                                        </Disclosure.Panel>
                                    </Transition>
                                </>
                            )}
                        </Disclosure>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="lg:col-span-2 flex lg:flex-col gap-2 justify-end">
                        {showCVCheck && (
                            <div className="tooltip tooltip-left" data-tip="CV Quality Check">
                                <button 
                                    onClick={() => onCVCheck(app)} 
                                    disabled={isCVCheckLoading === app.id}
                                    className="btn btn-circle btn-ghost btn-sm"
                                >
                                    {isCVCheckLoading === app.id ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                        
                        {showStrategy && (
                            <div className="tooltip tooltip-left" data-tip="Interview Strategy">
                                <button 
                                    onClick={() => onGenerateStrategy(app)} 
                                    disabled={isStrategyLoading === app.id}
                                    className="btn btn-circle btn-ghost btn-sm"
                                >
                                    {isStrategyLoading === app.id ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l-2 2M15 19h2M9 19h6m-6 0a3 3 0 00-3-3H5a2 2 0 01-2-2V8a2 2 0 012-2h4l2-2 2 2h4a2 2 0 012 2v10a2 2 0 01-2 2h-2a3 3 0 00-3 3z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                        
                        <div className="tooltip tooltip-left" data-tip="Draft Email">
                            <button 
                                onClick={() => onGenerateEmail(app)} 
                                disabled={isEmailLoading === app.id}
                                className="btn btn-circle btn-ghost btn-sm"
                            >
                                {isEmailLoading === app.id ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.88 5.25a2 2 0 002.24 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        {app.link && (
                            <div className="tooltip tooltip-left" data-tip="Open Link">
                                <a 
                                    href={app.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-circle btn-ghost btn-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                </a>
                            </div>
                        )}
                        
                        <div className="divider lg:divider-horizontal"></div>
                        
                        <div className="tooltip tooltip-left" data-tip="Edit">
                            <button 
                                onClick={() => onEdit(app)} 
                                className="btn btn-circle btn-ghost btn-sm hover:btn-success"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="tooltip tooltip-left" data-tip="Delete">
                            <button 
                                onClick={() => onDelete(app.id)} 
                                className="btn btn-circle btn-ghost btn-sm hover:btn-error"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationCardEnhanced;
