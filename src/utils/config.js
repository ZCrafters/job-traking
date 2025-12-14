/**
 * Application Configuration
 */

// Status Mapping and Colors
export const STATUS_MAP = {
    'TO_APPLY': { label: 'To Apply', class: 'bg-red-100 text-red-600', color: '#ef4444' }, 
    'SUBMITTED': { label: 'Submitted', class: 'bg-blue-100 text-blue-600', color: '#3b82f6' }, 
    'IN_REVIEW': { label: 'In Review', class: 'bg-purple-100 text-purple-600', color: '#a855f7' },
    'INTERVIEW': { label: 'Interview', class: 'bg-orange-100 text-orange-600', color: '#f97316' },
    'OFFER': { label: 'Offer', class: 'bg-green-100 text-green-600', color: '#10b981' },
    'REJECTED': { label: 'Rejected', class: 'bg-gray-200 text-gray-600', color: '#6b7280' },
    'DONE_PROJECT': { label: 'Done/Project', class: 'bg-indigo-100 text-indigo-600', color: '#6366f1' },
    'ACTION': { label: 'Next Action', class: 'bg-yellow-100 text-yellow-600', color: '#f59e0b' },
};

// Pagination Configuration
export const ITEMS_PER_PAGE = 6;

// User Information
export const APPLICANT_NAME = 'Zefanya Williams';

// Email Actions Mapping (for AI prompt generation)
export const EMAIL_ACTIONS = {
    INTERVIEW: 'a polite thank-you and results follow-up after an interview',
    IN_REVIEW: 'a polite general application status check (after waiting 10–14 days)',
    SUBMITTED: 'a polite general application status check (after waiting 10–14 days)',
    OFFER: 'a request for offer clarification and confirmation of the decision deadline',
    default: 'a polite general follow-up'
};

// Base Skills Context (default before user uploads files)
export const BASE_SKILLS_CONTEXT = `Zefanya's key skills include: Digital Business, Data Science (Python, Tableau, Green Academy certification), Certified Content Creator, Certified Digital Marketing Practitioner, strong project coordination, and experience in video editing/reels content creation.`;

// API Configuration
export const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`;

// OCR System Instruction
export const OCR_SYSTEM_INSTRUCTION = { 
    parts: [{ 
        text: "You are an expert OCR and data extraction tool for job applications. Your task is to extract three pieces of information from the provided image: the Company Name, the Job Role, and the Date (Applied Date or Deadline). Respond only with a JSON array that strictly follows the provided schema. If a value is not found, use 'N/A'. The 'date' must be in YYYY-MM-DD format if possible, otherwise 'N/A'. If the date in the source is DD/MM/YYYY, convert it to YYYY-MM-DD." 
    }] 
};

// OCR Response Schema
export const OCR_RESPONSE_SCHEMA = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: { 
            "companyName": { "type": "STRING" }, 
            "jobRole": { "type": "STRING" }, 
            "date": { "type": "STRING" } 
        },
        propertyOrdering: ["companyName", "jobRole", "date"]
    }
};

// Initial Applications Data
export const initialApplications = [
    {
        role: "Amgen Scholars Asia Program",
        company: "National University of Singapore (NUS)",
        location: "Singapore",
        appliedDate: "2025-12-14",
        status: "IN_REVIEW",
        notes: "Deadline: 1 Feb 2026. Important: Referees receive separate email.",
        link: "https://nus.edu.sg/amgenscholars",
        timestamp: new Date(2025, 11, 14, 10, 0).getTime()
    },
    {
        role: "Marketing & Brand Communication Internship",
        company: "FIFGROUP (AIF - FIF)",
        location: "Jakarta",
        appliedDate: "2025-12-08",
        status: "IN_REVIEW",
        notes: "Status: Dalam Proses. Tahap: Seleksi Administratif.",
        link: "https://id.jobstreet.com/profiles/zefanya-williams-nVDCMgJGMl",
        timestamp: new Date(2025, 11, 8, 12, 0).getTime()
    },
    {
        role: "Creative Digital Content & Corporate Branding Internship",
        company: "FIFGROUP (AIF - FIF)",
        location: "Jakarta",
        appliedDate: "2025-12-08",
        status: "IN_REVIEW",
        notes: "Status: Dalam Proses. Tahap: Seleksi Administratif.",
        link: "https://id.jobstreet.com/profiles/zefanya-williams-nVDCMgJGMl",
        timestamp: new Date(2025, 11, 8, 12, 0).getTime()
    },
    {
        role: "Business Analyst Internship",
        company: "FIFGROUP (AIF - FIF)",
        location: "Jakarta",
        appliedDate: "2025-12-05",
        status: "IN_REVIEW",
        notes: "Status: Dalam Proses. Tahap: Seleksi Administratif.",
        link: "https://id.jobstreet.com/profiles/zefanya-williams-nVDCMgJGMl",
        timestamp: new Date(2025, 11, 5, 12, 0).getTime()
    },
    {
        role: "User Experience Design Summer Intern, 2026",
        company: "Google",
        location: "Singapore",
        appliedDate: "2025-12-14",
        status: "INTERVIEW",
        notes: "Submitted. Action: Check dashboard daily for status updates.",
        link: "https://careers.google.com/",
        timestamp: new Date(2025, 11, 14, 15, 30).getTime()
    },
    {
        role: "Associate Product Marketing Manager Intern, Summer 2026",
        company: "Google",
        location: "Singapore",
        appliedDate: "2025-12-14",
        status: "INTERVIEW",
        notes: "Submitted. Action: Check dashboard daily for status updates.",
        link: "https://careers.google.com/",
        timestamp: new Date(2025, 11, 14, 15, 30).getTime()
    },
    {
        role: "Product Analyst, Strategy and Operations",
        company: "Google",
        location: "Singapore or Sydney",
        appliedDate: "2025-12-14",
        status: "IN_REVIEW",
        notes: "Submitted. Waiting for HR screening confirmation.",
        link: "https://careers.google.com/",
        timestamp: new Date(2025, 11, 14, 15, 30).getTime()
    },
];

// Animation Delays (in milliseconds)
export const ANIMATION_DELAYS = {
    SHORT: 150,
    MEDIUM: 300,
    LONG: 500,
};

// Toast/Message Duration (in milliseconds)
export const MESSAGE_DURATION = 5000;
