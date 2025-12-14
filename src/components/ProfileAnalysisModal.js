import React, { useState } from 'react';

/**
 * ProfileAnalysisModal Component
 * Modal for uploading and analyzing profile documents
 */
const ProfileAnalysisModal = ({ isOpen, onClose, onAnalyze, isAnalyzing, currentContext }) => {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleAnalyzeClick = () => {
        if (files.length === 0) {
            alert("Please upload at least one document (CV, image, or PDF).");
            return;
        }
        onAnalyze(files);
        setFiles([]);
        const fileInput = document.getElementById('profileFile');
        if (fileInput) fileInput.value = '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4 modal-backdrop">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl modal-content">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="font-georgia text-2xl font-bold text-indigo-600 flex items-center">
                        <svg className="w-6 h-6 mr-2 animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        About Me: Analisis Profil Komprehensif
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-700 transition-all-smooth hover:rotate-90" 
                        aria-label="Close profile analysis modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-gray-600 animate-fadeIn">
                        Unggah CV, sertifikat, atau *screenshot* proyek Anda. Gemini akan menganalisis konten gabungan tersebut untuk memperbarui konteks keahlian Anda, menghasilkan saran LLM yang lebih personal dan relevan.
                    </p>

                    <div className="border border-dashed border-indigo-400 p-5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 animate-scaleIn">
                        <label htmlFor="profileFile" className="block text-lg font-medium text-indigo-700 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            Unggah Dokumen (PNG, JPG, PDF, TXT) - Dapat menggabungkan banyak berkas
                        </label>
                        <input 
                            type="file" 
                            id="profileFile" 
                            multiple 
                            accept=".png,.jpg,.jpeg,.pdf,.txt" 
                            onChange={handleFileChange} 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-all" 
                            disabled={isAnalyzing}
                        />
                        {files.length > 0 && (
                            <p className="mt-2 text-sm text-indigo-600 animate-fadeIn flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {files.length} berkas siap dianalisis.
                            </p>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleAnalyzeClick}
                        disabled={files.length === 0 || isAnalyzing}
                        className="w-full px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition-all-smooth btn-primary disabled:opacity-50 flex items-center justify-center"
                        aria-label="Analyze and update profile context"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menganalisis...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                Analisis & Perbarui Profil (AI)
                            </>
                        )}
                    </button>

                    <div className="pt-4 border-t animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                        <h3 className="font-garamond text-lg font-bold text-gray-800 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Konteks Profil Saat Ini (Digunakan AI)
                        </h3>
                        <div className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {currentContext}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all-smooth"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileAnalysisModal;
