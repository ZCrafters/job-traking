import React from 'react';

/**
 * StrategyModal Component
 * Displays AI-generated interview strategy
 */
const StrategyModal = ({ isOpen, onClose, strategy }) => {
    if (!isOpen || !strategy.questions || !strategy.highlights) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4 modal-backdrop">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg modal-content">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="font-georgia text-2xl font-bold text-green-600 flex items-center">
                        <svg className="w-6 h-6 mr-2 animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l-2 2M15 19h2M9 19h6m-6 0a3 3 0 00-3-3H5a2 2 0 01-2-2V8a2 2 0 012-2h4l2-2 2 2h4a2 2 0 012 2v10a2 2 0 01-2 2h-2a3 3 0 00-3 3z"></path>
                        </svg>
                        Interview Strategy (AI)
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-700 transition-all-smooth hover:rotate-90" 
                        aria-label="Close interview strategy modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="animate-fadeIn">
                        <h3 className="font-garamond text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Top 3-4 Potential Interview Questions
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm pl-2 whitespace-pre-wrap">
                            {strategy.questions.map((q, index) => (
                                <li key={index} className="animate-slideInLeft" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {q}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <h3 className="font-garamond text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Key Highlights to Mention (Tailored to Role)
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm pl-2 whitespace-pre-wrap">
                            {strategy.highlights.map((h, index) => (
                                <li key={index} className="animate-slideInLeft" style={{ animationDelay: `${(index + strategy.questions.length) * 0.1}s` }}>
                                    {h}
                                </li>
                            ))}
                        </ul>
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

export default StrategyModal;
