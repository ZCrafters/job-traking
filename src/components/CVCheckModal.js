import React from 'react';

/**
 * CVCheckModal Component
 * Displays AI-generated CV quality check results
 */
const CVCheckModal = ({ isOpen, onClose, checks }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4 modal-backdrop">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl modal-content">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="font-georgia text-2xl font-bold text-blue-600 flex items-center">
                        <svg className="w-6 h-6 mr-2 animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        CV Quality Check (AI)
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-700 transition-all-smooth hover:rotate-90" 
                        aria-label="Close CV check modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div className="animate-fadeIn">
                        <h3 className="font-garamond text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Strongest Matches (Kecocokan Terkuat)
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 whitespace-pre-wrap">
                            {checks.matches.map((m, index) => (
                                <li key={index} className="animate-slideInLeft" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {m}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                        <h3 className="font-garamond text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            Areas for Improvement (Area Peningkatan)
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm pl-2 whitespace-pre-wrap">
                            {checks.improvements.map((i, index) => (
                                <li key={index} className="animate-slideInLeft" style={{ animationDelay: `${(index + checks.matches.length) * 0.1}s` }}>
                                    {i}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all-smooth"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CVCheckModal;
