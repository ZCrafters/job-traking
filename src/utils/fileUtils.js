/**
 * File Handling Utility Functions
 */

/**
 * Convert file to base64 string
 * @param {File} file - File object to convert
 * @returns {Promise<string>} Base64 encoded file data
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            // Extract base64 data (remove data:image/png;base64, prefix)
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

/**
 * Read file as text
 * @param {File} file - File object to read
 * @returns {Promise<string>} File content as text
 */
export const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
};

/**
 * Process multiple files for upload
 * @param {FileList} files - Files to process
 * @returns {Promise<Array>} Array of processed file parts
 */
export const processFilesForUpload = async (files) => {
    const partPromises = Array.from(files).map(file => {
        const readerPromise = new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            
            if (file.type.startsWith('image/') || file.type.includes('pdf')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });

        return readerPromise.then(result => {
            const mimeType = file.type;
            const isImageOrPDF = mimeType.startsWith('image/') || mimeType.includes('pdf');
            
            if (isImageOrPDF) {
                const base64Data = result.split(',')[1];
                return { inlineData: { mimeType, data: base64Data } };
            } else {
                return { text: `--- Start Document: ${file.name} ---\n${result}\n--- End Document ---` };
            }
        });
    });
    
    return await Promise.all(partPromises);
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if file type is valid
 */
export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.some(type => file.type.includes(type));
};

/**
 * Format file size to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
