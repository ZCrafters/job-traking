/**
 * CSV Import/Export Utility Functions
 */

export const CSV_HEADERS = ["role", "company", "location", "appliedDate", "status", "notes", "link", "source"];

/**
 * Convert data array to CSV format
 * @param {Array} data - Array of application objects
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data) => {
    const csv = [
        CSV_HEADERS.join(','),
        ...data.map(row => CSV_HEADERS.map(header => {
            let value = row[header] !== undefined && row[header] !== null ? row[header].toString() : '';
            value = value.replace(/"/g, '""');
            if (value.includes(',') || value.includes('\n') || value.includes('\r')) {
                value = `"${value}"`;
            }
            return value;
        }).join(','))
    ].join('\n');
    return csv;
};

/**
 * Parse CSV text to data array
 * @param {string} csvText - CSV formatted string
 * @param {object} STATUS_MAP - Status mapping object
 * @returns {Array} Array of parsed application objects
 */
export const parseCSV = (csvText, STATUS_MAP) => {
    const [headerLine, ...dataLines] = csvText.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());

    if (headers.length < 5 || !headers.includes('role')) {
        throw new Error("Invalid CSV format. Required headers (role, company, status, etc.) missing.");
    }

    return dataLines.map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const obj = {};
        headers.forEach((header, index) => {
            let value = (values[index] || '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');
            obj[header] = value;
        });
        if (!STATUS_MAP[obj.status]) obj.status = 'TO_APPLY';
        if (obj.appliedDate && !/^\d{4}-\d{2}-\d{2}$/.test(obj.appliedDate)) {
             obj.appliedDate = new Date().toISOString().split('T')[0];
        }
        return obj;
    });
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename for download
 */
export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
};
