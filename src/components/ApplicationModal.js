import React, { useState, useEffect } from 'react';
import { STATUS_MAP } from '../utils/config.js';

/**
 * ApplicationModal Component
 * Modal for adding/editing application entries
 */
const ApplicationModal = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    isScanning, 
    scanStatus, 
    handleImageUpload, 
    onGenerateNotes, 
    isGenerating 
}) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleGenerateClick = () => {
        if (formData.role && formData.company) {
            onGenerateNotes(formData.role, formData.company, setFormData);
        } else {
            alert('Please fill in Job Role and Company first.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 modal-backdrop`}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl m-4 transform modal-content overflow-y-auto max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="font-georgia text-2xl font-bold text-gray-800" id="modal-title">
                        {formData.id ? 'Edit Application' : 'Add New Entry'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-700 transition-all-smooth hover:rotate-90" 
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Scan Area */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="font-garamond text-lg font-semibold mb-3 text-indigo-600 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Scan Job Post Screenshot (AI)
                    </h3>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all" 
                        onChange={handleImageUpload} 
                        disabled={isScanning} 
                        aria-label="Upload image for AI scan"
                    />
                    {scanStatus && (
                        <p className={`mt-2 text-sm animate-fadeIn ${isScanning ? 'text-orange-500' : scanStatus.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                            {isScanning ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : scanStatus}
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="hidden" name="id" value={formData.id || ''} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Job Role</label>
                            <input 
                                type="text" 
                                id="role" 
                                name="role" 
                                value={formData.role || ''} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                            />
                        </div>
                        <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                            <input 
                                type="text" 
                                id="company" 
                                name="company" 
                                value={formData.company || ''} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input 
                                type="text" 
                                id="location" 
                                name="location" 
                                value={formData.location || ''} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                            />
                        </div>
                        <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                            <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700">Applied/Planned Date</label>
                            <input 
                                type="date" 
                                id="appliedDate" 
                                name="appliedDate" 
                                value={formData.appliedDate || new Date().toISOString().split('T')[0]} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                            />
                        </div>
                    </div>

                    <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={formData.status || 'IN_REVIEW'} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                            {Object.keys(STATUS_MAP).map(key => (
                                <option key={key} value={key}>{STATUS_MAP[key].label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700">Job Post Link</label>
                        <input 
                            type="url" 
                            id="link" 
                            name="link" 
                            value={formData.link || ''} 
                            onChange={handleChange} 
                            placeholder="e.g., https://linkedin.com/jobs/..." 
                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                        />
                    </div>

                    <div className="animate-fadeIn" style={{ animationDelay: '0.7s' }}>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Next Steps (Notes)</label>
                        <div className="flex space-x-2 mt-1">
                            <textarea 
                                id="notes" 
                                name="notes" 
                                value={formData.notes || ''} 
                                onChange={handleChange} 
                                rows="3" 
                                placeholder="1. Prepare portfolio. 2. Follow up email." 
                                className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            ></textarea>
                            <button 
                                type="button" 
                                onClick={handleGenerateClick}
                                disabled={isGenerating}
                                className="px-3 py-2 bg-pink-500 text-white rounded-lg shadow-md hover:bg-pink-600 text-sm font-semibold flex items-center justify-center transition-all-smooth hover-lift disabled:opacity-50"
                                title="Generate tailored to-do list based on role and your CV."
                                aria-label="Generate next steps using AI"
                            >
                                {isGenerating ? (
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    '✨ AI'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="form-actions flex justify-end pt-2 space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all-smooth"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-all-smooth btn-primary"
                        >
                            Simpan Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationModal;
