import React, { useState } from 'react';

/**
 * EmailDraftModal Component
 * Displays AI-generated email draft
 */
const EmailDraftModal = ({ isOpen, onClose, draft }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = draft.subject + "\n\n" + draft.body;
        
        const tempElement = document.createElement('textarea');
        tempElement.value = textToCopy;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4 modal-backdrop">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg modal-content">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="font-georgia text-2xl font-bold text-pink-600 flex items-center" id="email-modal-title">
                        <svg className="w-6 h-6 mr-2 animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.88 5.25a2 2 0 002.24 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        Follow-up Email Draft (AI)
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-700 transition-all-smooth hover:rotate-90" 
                        aria-label="Close email draft modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg animate-fadeIn" role="alert">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Subject:</p>
                        <p className="font-medium text-gray-800">{draft.subject}</p>
                    </div>

                    <div className="p-4 bg-white border border-gray-300 rounded-lg whitespace-pre-wrap font-mono text-sm shadow-inner overflow-auto max-h-60 animate-slideInLeft" aria-describedby="email-modal-title">
                        {draft.body}
                    </div>

                    <div className="text-sm text-gray-500 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                        <span className="font-bold text-red-500">*Note:</span> Pastikan Anda mengganti `[Recruiter/Hiring Team]` dengan nama kontak yang benar sebelum mengirim.
                    </div>
                </div>
                
                <div className="p-6 border-t flex justify-end">
                    <button 
                        onClick={handleCopy} 
                        className="px-5 py-2.5 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-all-smooth btn-primary flex items-center"
                    >
                        {copied ? (
                            <>
                                <svg className="w-5 h-5 mr-2 animate-scaleIn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Berhasil Disalin!
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2m-3-11l3 3m-3-3l-3 3m3-3v8M11 19h10a2 2 0 002-2V7a2 2 0 00-2-2h-3"></path>
                                </svg>
                                Copy Draft
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailDraftModal;
