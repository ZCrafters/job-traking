import React, { useState, useEffect } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, setDoc, onSnapshot, collection, updateDoc, deleteDoc, getDoc, addDoc, setLogLevel, writeBatch, getDocs, Timestamp
} from 'firebase/firestore';

// Component Imports
import {
    StatusBadge,
    SummaryCard,
    StatusDistributionChart,
    ApplicationCard,
    ApplicationModal,
    EmailDraftModal,
    StrategyModal,
    CVCheckModal,
    ProfileAnalysisModal,
    AppShell,
    Sidebar,
    Topbar,
    StatCard,
    ChartCard,
    ApplicationsTable
} from './components/index.js';

// Utility Imports
import {
    timeAgo,
    calculateKPIs,
    convertToCSV,
    parseCSV,
    downloadCSV,
    processFilesForUpload,
    fileToBase64,
    STATUS_MAP,
    ITEMS_PER_PAGE,
    APPLICANT_NAME,
    BASE_SKILLS_CONTEXT,
    API_URL,
    OCR_SYSTEM_INSTRUCTION,
    OCR_RESPONSE_SCHEMA,
    initialApplications,
    MESSAGE_DURATION
} from './utils/index.js';

// Global Environment Variables
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

/**
 * Main App Component
 * Job Application Tracker Application
 */
const App = () => {
    // --- State Management ---
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [applications, setApplications] = useState([]);
    const [dbInstance, setDbInstance] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userProfileContext, setUserProfileContext] = useState(BASE_SKILLS_CONTEXT);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [isScanning, setIsScanning] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(null);
    const [isStrategyLoading, setIsStrategyLoading] = useState(null);
    const [isCVCheckLoading, setIsCVCheckLoading] = useState(null);
    const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    
    // Draft State
    const [emailDraft, setEmailDraft] = useState({ isOpen: false, subject: '', body: '' });
    const [strategyDraft, setStrategyDraft] = useState({ isOpen: false, questions: [], highlights: [] });
    const [cvCheck, setCvCheck] = useState({ isOpen: false, matches: [], improvements: [] });

    // Pagination and Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Dashboard UI State
    const [activeTab, setActiveTab] = useState('dashboard');

    // --- UTILITY HANDLERS ---
    
    const showMessage = (message, type = 'success') => {
        console.log(`[Message: ${type.toUpperCase()}] ${message}`);
        setScanStatus(message);
        setTimeout(() => setScanStatus(''), MESSAGE_DURATION);
    };

    // Sanitize input to prevent prompt injection
    const sanitizeInput = (input) => {
        if (!input) return '';
        // Remove potential prompt injection patterns while preserving normal text
        return String(input)
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/\n\s*\n/g, '\n') // Collapse multiple newlines
            .trim()
            .slice(0, 500); // Limit length to prevent overly long inputs
    };

    // --- EXPORT/IMPORT HANDLERS ---

    const handleExport = () => {
        const csv = convertToCSV(applications);
        downloadCSV(csv, `zefanya_applications_${new Date().toISOString().split('T')[0]}.csv`);
        showMessage('Data exported successfully!', 'success');
    };

    const handleImportClick = () => {
        document.getElementById('importFile').click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csvText = event.target.result;
                const importedData = parseCSV(csvText, STATUS_MAP);

                if (importedData.length === 0) {
                    showMessage('File CSV kosong atau tidak valid.', 'error');
                    return;
                }

                if (!userId || !dbInstance) {
                    showMessage('Authentication failed, cannot import.', 'error');
                    return;
                }

                const path = `artifacts/${appId}/users/${userId}/saas_application_tracker`;
                const batch = writeBatch(dbInstance);
                const q = collection(dbInstance, path);

                importedData.forEach(item => {
                    const newDocRef = doc(q);
                    batch.set(newDocRef, { ...item, timestamp: Timestamp.now(), source: item.source || 'CSV Import' });
                });

                await batch.commit();
                showMessage(`Successfully imported ${importedData.length} entries!`, 'success');
                e.target.value = null;
            } catch (error) {
                console.error("Import Error:", error);
                showMessage(`Import failed: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    };

    // --- FIREBASE INITIALIZATION & AUTH ---
    useEffect(() => {
        setLogLevel('error');

        try {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const auth = getAuth(app);
            
            setDbInstance(db);

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(auth, initialAuthToken);
                        } else {
                            await signInAnonymously(auth);
                        }
                    } catch (error) {
                        console.error("Initial Authentication Error:", error);
                    }
                }
            });
        } catch (e) {
            console.error("Firebase Initialization Failed:", e);
        }
    }, []);

    // --- FIRESTORE LISTENER (Data Fetching) ---
    useEffect(() => {
        if (!isAuthReady || !dbInstance || !userId) return;

        const COLLECTION_NAME = "saas_application_tracker";
        const path = `artifacts/${appId}/users/${userId}/${COLLECTION_NAME}`;
        const q = collection(dbInstance, path);
        const profileDocRef = doc(dbInstance, `artifacts/${appId}/users/${userId}/profile`, 'context');

        const checkAndPopulateInitialData = async () => {
            const snapshotCheck = await getDocs(q);
            if (snapshotCheck.empty) {
                const batch = writeBatch(dbInstance);
                initialApplications.forEach(app => {
                    const timestamp = app.timestamp ? new Date(app.timestamp) : Timestamp.now();
                    batch.set(doc(q), { ...app, timestamp });
                });
                await batch.commit();
            }

            const profileSnap = await getDoc(profileDocRef);
            if (profileSnap.exists()) {
                setUserProfileContext(profileSnap.data().context);
            } else {
                await setDoc(profileDocRef, { context: BASE_SKILLS_CONTEXT });
                setUserProfileContext(BASE_SKILLS_CONTEXT);
            }
        };

        checkAndPopulateInitialData().then(() => {
            const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserProfileContext(docSnap.data().context);
                }
            });

            const unsubscribeApps = onSnapshot(q, (snapshot) => {
                const fetchedApps = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp ? (doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)) : new Date(),
                }));

                fetchedApps.sort((a, b) => {
                    const statusOrder = { 'TO_APPLY': 1, 'INTERVIEW': 2, 'IN_REVIEW': 3, 'SUBMITTED': 4, 'OFFER': 5, 'REJECTED': 6, 'DONE_PROJECT': 7, 'ACTION': 8 };
                    if (statusOrder[a.status] !== statusOrder[b.status]) {
                        return statusOrder[a.status] - statusOrder[b.status];
                    }
                    return b.timestamp.getTime() - a.timestamp.getTime();
                });
                setApplications(fetchedApps);
            }, (error) => {
                console.error("Firestore Listener Error:", error);
            });
            
            return () => {
                unsubscribeApps();
                unsubscribeProfile();
            };
        });

    }, [isAuthReady, dbInstance, userId]);

    // --- GEMINI: PROFILE ANALYZER ---
    const handleAnalyzeProfile = async (files) => {
        setIsAnalyzingProfile(true);
        showMessage(`Analyzing ${files.length} documents... This may take a moment.`, 'warning');

        try {
            const documentParts = await processFilesForUpload(files);
            
            const userQuery = `Analyze these ${files.length} documents (CVs, certificates, project docs, images) and synthesize a comprehensive professional profile summary (2-3 paragraphs) of ${APPLICANT_NAME}'s core professional skills, technical expertise, and career focus for job applications. Emphasize the intersection of Digital Marketing, Data Science, and Content Creation/Leadership. Output only the summarized context paragraph(s).`;
            
            const payload = { contents: [{ role: "user", parts: [...documentParts, { text: userQuery }] }] };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            const generatedContext = result.candidates?.[0]?.content?.parts?.[0]?.text || BASE_SKILLS_CONTEXT;

            const profileDocRef = doc(dbInstance, `artifacts/${appId}/users/${userId}/profile`, 'context');
            await setDoc(profileDocRef, { context: generatedContext.trim(), lastUpdated: Timestamp.now() });

            showMessage('Profile context successfully updated from documents!', 'success');

        } catch (error) {
            console.error("Profile Analysis Error:", error);
            showMessage('Failed to analyze documents. Check console for details.', 'error');
        } finally {
            setIsAnalyzingProfile(false);
            setIsProfileModalOpen(false);
        }
    };

    // --- GEMINI: NEXT STEPS GENERATOR ---
    const handleGenerateNotes = async (role, company, setFormData) => {
        setIsGenerating(true);
        showMessage('Generating tailored action plan...', 'warning');

        // Input validation
        if (!role || !company) {
            showMessage('Missing required fields: role and company are required to generate next steps.', 'error');
            setIsGenerating(false);
            return;
        }

        // Sanitize inputs
        const sanitizedRole = sanitizeInput(role);
        const sanitizedCompany = sanitizeInput(company);
        const sanitizedContext = sanitizeInput(userProfileContext);

        try {
            const userQuery = `Act as a career coach. Given the job role "${sanitizedRole}" at "${sanitizedCompany}" and the user's profile context, generate a concise numbered list (3 to 5 points) of highly relevant action items or next steps. Focus on preparation, research, or tailoring skills specific to this job type. Do NOT use introductory or concluding sentences. Output only the numbered list items separated by newlines.

User profile context: ${sanitizedContext}`;
            
            const payload = { contents: [{ parts: [{ text: userQuery }] }] };

            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!generatedText || generatedText.trim().length === 0) {
                throw new Error('API returned empty response');
            }
            
            setFormData(prev => ({ ...prev, notes: generatedText.trim() }));
            showMessage('Action plan generated successfully!', 'success');

        } catch (error) {
            console.error("Gemini Generation Error:", error);
            showMessage('Failed to generate action plan. Using fallback steps.', 'error');
            
            // Fallback action items
            const fallbackNotes = `1. Research ${sanitizedCompany}'s recent projects, products, and company culture
2. Review the job description for ${sanitizedRole} and identify key required skills
3. Prepare specific examples demonstrating relevant experience
4. Tailor your CV to highlight skills matching this ${sanitizedRole} position
5. Connect with current employees at ${sanitizedCompany} on LinkedIn for insights`;
            
            setFormData(prev => ({ ...prev, notes: fallbackNotes }));
        } finally {
            setIsGenerating(false);
        }
    };

    // --- GEMINI: FOLLOW-UP EMAIL DRAFTER ---
    const EMAIL_ACTIONS = {
        INTERVIEW: 'a polite thank-you and results follow-up after an interview',
        IN_REVIEW: 'a polite general application status check (after waiting 10–14 days)',
        SUBMITTED: 'a polite general application status check (after waiting 10–14 days)',
        OFFER: 'a request for offer clarification and confirmation of the decision deadline',
        default: 'a polite general follow-up'
    };

    const handleGenerateEmail = async (app) => {
        setIsEmailLoading(app.id);
        
        // Input validation
        if (!app.role || !app.company) {
            showMessage('Missing required fields: role and company are required to generate an email.', 'error');
            setIsEmailLoading(null);
            return;
        }
        
        if (!app.appliedDate) {
            showMessage('Missing applied date. Please add the application date before generating an email.', 'error');
            setIsEmailLoading(null);
            return;
        }

        // Sanitize inputs
        const sanitizedRole = sanitizeInput(app.role);
        const sanitizedCompany = sanitizeInput(app.company);
        const sanitizedDate = sanitizeInput(app.appliedDate);
        const sanitizedContext = sanitizeInput(userProfileContext);

        const actionType = EMAIL_ACTIONS[app.status] || EMAIL_ACTIONS.default;

        const userQuery = `Act as a professional applicant. Draft a formal, concise follow-up email in ENGLISH for the job application: "${sanitizedRole}" at "${sanitizedCompany}", applied on ${sanitizedDate}. The email should be ${actionType}. Use a professional, respectful tone. The body must include the name ${APPLICANT_NAME} and gently remind the recruiter of one key skill relevant to the role, based on the user profile. Format the response as: Subject: [your subject line] \\n\\nDear [Recruiter/Hiring Team], \\n\\n[Email Body] \\n\\nSincerely, \\n${APPLICANT_NAME}.

User profile context: ${sanitizedContext}`;

        try {
            const payload = { contents: [{ parts: [{ text: userQuery }] }] };
            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            const generatedEmail = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!generatedEmail || generatedEmail.trim().length === 0) {
                throw new Error('API returned empty response');
            }
            
            const lines = generatedEmail.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            let subject = '';
            let bodyLines = [];
            let inBody = false;

            for (const line of lines) {
                if (line.startsWith('Subject:')) {
                    subject = line.replace('Subject:', '').trim();
                } else if (line.startsWith('Dear')) {
                    bodyLines.push(line);
                    inBody = true;
                } else if (inBody) {
                    bodyLines.push(line);
                }
            }
            
            // Use parsed structure if available, otherwise use a cleaner fallback message
            if (bodyLines.length > 0) {
                setEmailDraft({ 
                    isOpen: true, 
                    subject: subject || 'Follow-up Application Status', 
                    body: bodyLines.join('\n\n')
                });
            } else {
                throw new Error('Unable to parse email structure from AI response');
            }
            showMessage(`Email draft generated for ${sanitizedRole}!`, 'success');

        } catch (error) {
            console.error("Gemini Email Generation Error:", error);
            showMessage('Failed to generate email. Using fallback template.', 'error');
            
            // Fallback email template
            const fallbackSubject = `Follow-up on ${sanitizedRole} Application`;
            const fallbackBody = `Dear Hiring Team,

I hope this message finds you well. I am writing to follow up on my application for the ${sanitizedRole} position at ${sanitizedCompany}, which I submitted on ${sanitizedDate}.

I remain very interested in this opportunity and would appreciate any updates you might have regarding my application status. I believe my background and skills align well with the requirements of this role.

Thank you for considering my application. I look forward to hearing from you.

Sincerely,
${APPLICANT_NAME}`;
            
            setEmailDraft({ 
                isOpen: true, 
                subject: fallbackSubject, 
                body: fallbackBody 
            });
        } finally {
            setIsEmailLoading(null);
        }
    };

    // GEMINI: INTERVIEW STRATEGY GENERATOR
    const handleGenerateStrategy = async (app) => {
        setIsStrategyLoading(app.id);

        // Input validation
        if (!app.role || !app.company) {
            showMessage('Missing required fields: role and company are required to generate interview strategy.', 'error');
            setIsStrategyLoading(null);
            return;
        }

        // Sanitize inputs
        const sanitizedRole = sanitizeInput(app.role);
        const sanitizedCompany = sanitizeInput(app.company);
        const sanitizedContext = sanitizeInput(userProfileContext);

        const prompt = `Based on the job role "${sanitizedRole}" at "${sanitizedCompany}" and the user's profile context, generate two lists separated by '---': (1) Top 3–4 potential interview questions (numbered), (2) Top 3–4 key highlights to mention (bullet points). Respond only with the two lists; no extra commentary.

User profile context: ${sanitizedContext}`;

        try {
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!generatedText || generatedText.trim().length === 0) {
                throw new Error('API returned empty response');
            }

            const [questionsSection, highlightsSection] = generatedText.split('---').map(s => s.trim());

            const extractList = (section) => {
                if (!section) return [];
                return section.split('\n').map(line => line.replace(/^\s*[\d\.\*-]+\s*/, '').trim()).filter(line => line.length > 0);
            };

            const questions = extractList(questionsSection);
            const highlights = extractList(highlightsSection);

            if (questions.length === 0 || highlights.length === 0) {
                throw new Error('Unable to parse AI response properly');
            }

            setStrategyDraft({
                isOpen: true,
                questions: questions,
                highlights: highlights,
            });

            showMessage('Interview strategy generated!', 'success');

        } catch (error) {
            console.error("Strategy Generation Error:", error);
            showMessage('Failed to generate strategy. Using fallback content.', 'error');
            
            // Fallback strategy content
            const fallbackQuestions = [
                `Can you describe your experience relevant to the ${sanitizedRole} position?`,
                `What interests you most about working at ${sanitizedCompany}?`,
                `Tell me about a challenging project you worked on and how you handled it.`,
                `Where do you see yourself in 3-5 years in this field?`
            ];
            
            const fallbackHighlights = [
                `Emphasize technical skills and hands-on experience relevant to ${sanitizedRole}`,
                `Demonstrate knowledge of ${sanitizedCompany}'s products/services and industry position`,
                `Highlight problem-solving abilities and specific project outcomes`,
                `Show enthusiasm for continuous learning and professional development`
            ];
            
            setStrategyDraft({
                isOpen: true,
                questions: fallbackQuestions,
                highlights: fallbackHighlights,
            });
        } finally {
            setIsStrategyLoading(null);
        }
    };
    
    // GEMINI: CV CHECK/OPTIMIZATION GENERATOR
    const handleCVCheck = async (app) => {
        setIsCVCheckLoading(app.id);

        // Input validation
        if (!app.role || !app.company) {
            showMessage('Missing required fields: role and company are required to generate CV check.', 'error');
            setIsCVCheckLoading(null);
            return;
        }

        // Sanitize inputs
        const sanitizedRole = sanitizeInput(app.role);
        const sanitizedCompany = sanitizeInput(app.company);
        const sanitizedContext = sanitizeInput(userProfileContext);

        const prompt = `Act as an ATS/HR analyst. Analyze the job role "${sanitizedRole}" at "${sanitizedCompany}" against the user's profile context. Provide two sections separated by '---': (1) Strongest Matches – a bullet list of 3 key skills or experiences that match the role, and (2) Areas for CV Improvement – a bullet list of 3 things to adjust or emphasize in the CV. Respond only with the two lists.

User profile context: ${sanitizedContext}`;

        try {
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const result = await response.json();
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!generatedText || generatedText.trim().length === 0) {
                throw new Error('API returned empty response');
            }

            const [matchesSection, improvementsSection] = generatedText.split('---').map(s => s.trim());

            const extractList = (section) => {
                if (!section) return [];
                return section.split('\n').map(line => line.replace(/^\s*[\d\.\*-]+\s*/, '').trim()).filter(line => line.length > 0);
            };

            const matches = extractList(matchesSection);
            const improvements = extractList(improvementsSection);

            if (matches.length === 0 || improvements.length === 0) {
                throw new Error('Unable to parse AI response properly');
            }

            setCvCheck({
                isOpen: true,
                matches: matches,
                improvements: improvements,
            });

            showMessage('CV check results generated!', 'success');

        } catch (error) {
            console.error("CV Check Generation Error:", error);
            showMessage('Failed to generate CV check. Using fallback analysis.', 'error');
            
            // Fallback CV check content
            const fallbackMatches = [
                `Relevant technical skills applicable to ${sanitizedRole} position`,
                `Professional experience that aligns with ${sanitizedCompany}'s industry`,
                `Educational background and certifications supporting this role`
            ];
            
            const fallbackImprovements = [
                `Quantify specific achievements with measurable results (e.g., percentages, revenue impact)`,
                `Emphasize keywords from the ${sanitizedRole} job description more prominently`,
                `Add specific examples of projects or initiatives relevant to ${sanitizedCompany}'s focus area`
            ];
            
            setCvCheck({
                isOpen: true,
                matches: fallbackMatches,
                improvements: fallbackImprovements,
            });
        } finally {
            setIsCVCheckLoading(null);
        }
    };

    // --- CRUD HANDLERS ---
    
    const handleSave = async (data) => {
        if (!userId || !dbInstance) return;
        const path = `artifacts/${appId}/users/${userId}/saas_application_tracker`;
        
        try {
            if (data.id) {
                await updateDoc(doc(dbInstance, path, data.id), { ...data, timestamp: Timestamp.now() });
                showMessage('Application successfully updated!', 'success');
            } else {
                await addDoc(collection(dbInstance, path), { ...data, timestamp: Timestamp.now() });
                showMessage('Application successfully added!', 'success');
            }
            setIsModalOpen(false);
            setModalData({});
            setCurrentPage(1);
        } catch (e) {
            console.error("Error saving document: ", e);
            showMessage('Failed to save application.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!userId || !dbInstance) return;
        if (window.confirm("Are you sure you want to delete this application?")) {
            const path = `artifacts/${appId}/users/${userId}/saas_application_tracker`;
            try {
                await deleteDoc(doc(dbInstance, path, id));
                showMessage('Application successfully deleted!', 'success');
                setCurrentPage(prev => Math.min(prev, Math.ceil((applications.length - 1) / ITEMS_PER_PAGE) || 1));
            } catch (e) {
                console.error("Error deleting document: ", e);
                showMessage('Failed to delete application.', 'error');
            }
        }
    };
    
    // --- MODAL CONTROL ---

    const handleAddClick = () => {
        setModalData({
            role: '', company: '', location: '', appliedDate: new Date().toISOString().split('T')[0], status: 'TO_APPLY', link: '', notes: '', source: 'Manual Input'
        });
        setScanStatus('');
        setIsScanning(false);
        setIsModalOpen(true);
    };

    const handleEdit = (app) => {
        setModalData({ ...app, appliedDate: app.appliedDate || new Date().toISOString().split('T')[0] });
        setScanStatus('');
        setIsScanning(false);
        setIsModalOpen(true);
    };

    // --- AI SCAN LOGIC ---
    
    const handleImageScanClick = () => {
        document.getElementById('imageFile').click();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        handleAddClick();
        
        setIsScanning(true);
        setScanStatus('Scanning image and extracting data...');
        
        try {
            const base64ImageData = await fileToBase64(file);
            const userPrompt = "Extract the Company Name, the Job Role/Position, and the Date (Applied Date or Deadline).";

            const payload = {
                contents: [{
                    role: "user",
                    parts: [{ text: userPrompt }, { inlineData: { mimeType: file.type, data: base64ImageData } }]
                }],
                systemInstruction: OCR_SYSTEM_INSTRUCTION,
                generationConfig: { responseMimeType: "application/json", responseSchema: OCR_RESPONSE_SCHEMA }
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!jsonText) throw new Error("AI response was empty.");
            
            const extractedData = JSON.parse(jsonText)?.[0] || {};
            
            const newRole = extractedData.jobRole !== 'N/A' ? extractedData.jobRole : '';
            const newCompany = extractedData.companyName !== 'N/A' ? extractedData.companyName : '';
            const newDate = extractedData.date?.match(/^\d{4}-\d{2}-\d{2}$/) ? extractedData.date : new Date().toISOString().split('T')[0];
            
            setModalData(prev => ({
                ...prev,
                role: newRole,
                company: newCompany,
                appliedDate: newDate,
                notes: newDate !== extractedData.date ? `Extracted Date was invalid ('${extractedData.date}'). Set to today's date.` : (prev.notes || ''),
                status: 'IN_REVIEW', 
                source: 'Image Scan',
            }));
            
            setScanStatus('Data extracted and populated successfully! Review details before saving.');

        } catch (error) {
            console.error("Image Scan Error:", error);
            setScanStatus('An error occurred during scanning. Check console.');
        } finally {
            setIsScanning(false);
            e.target.value = null;
        }
    };

    // --- UI Calculations ---

    // Calculate KPIs and status counts
    const { successRate, totalActive, timeSinceLastAction, totalOffers } = calculateKPIs(applications);
    const interviewCount = applications.filter(a => a.status === 'INTERVIEW').length;

    // --- Pagination Logic ---
    const filteredApps = applications.filter(app => 
        app.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const appsToRender = filteredApps.slice(startIndex, endIndex);

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="text-xl text-indigo-600 font-semibold">Loading Dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <AppShell
            sidebar={<Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
            topbar={
                <Topbar
                    searchTerm={searchTerm}
                    onSearchChange={(value) => {
                        setSearchTerm(value);
                        setCurrentPage(1);
                    }}
                    onAddClick={handleAddClick}
                    onScanClick={handleImageScanClick}
                    onProfileClick={() => setIsProfileModalOpen(true)}
                    onExport={handleExport}
                    onImport={handleImportClick}
                />
            }
        >
            {/* Hidden file inputs */}
            <input type="file" id="imageFile" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <input type="file" id="importFile" accept=".csv" className="hidden" onChange={handleImport} />

            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Track and manage your job applications</p>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    label="Total Applications"
                    value={applications.length}
                    helperText="All tracked applications"
                    colorClass="text-indigo-600"
                />
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    label="Active Pipeline"
                    value={totalActive}
                    helperText="In Review, Submitted, Interview"
                    colorClass="text-blue-600"
                />
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    label="Interviews"
                    value={interviewCount}
                    helperText="Scheduled or completed"
                    colorClass="text-purple-600"
                />
                <StatCard
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    label="Offers"
                    value={totalOffers}
                    helperText={`Success rate: ${successRate}`}
                    colorClass="text-green-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard 
                    title="Status Distribution" 
                    subtitle="Overview of application statuses"
                >
                    <StatusDistributionChart applications={applications} />
                </ChartCard>
                
                <ChartCard 
                    title="Recent Activity" 
                    subtitle="Last updated applications"
                >
                    <div className="space-y-3">
                        {applications.slice(0, 5).map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{app.role}</p>
                                    <p className="text-xs text-gray-500">{app.company}</p>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>
                        ))}
                        {applications.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No recent applications</p>
                        )}
                    </div>
                </ChartCard>
            </div>

            {/* Applications Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {filteredApps.length} {filteredApps.length === 1 ? 'result' : 'results'}
                            {searchTerm && ` for "${searchTerm}"`}
                        </p>
                    </div>
                </div>

                {/* Applications Table */}
                <ApplicationsTable
                    applications={appsToRender}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onGenerateEmail={handleGenerateEmail}
                    onGenerateStrategy={handleGenerateStrategy}
                    onCVCheck={handleCVCheck}
                    isEmailLoading={isEmailLoading}
                    isStrategyLoading={isStrategyLoading}
                    isCVCheckLoading={isCVCheckLoading}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredApps.length)} of {filteredApps.length} results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ApplicationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={modalData}
                isScanning={isScanning}
                scanStatus={scanStatus}
                handleImageUpload={handleImageUpload}
                onGenerateNotes={handleGenerateNotes}
                isGenerating={isGenerating}
            />
            
            <EmailDraftModal 
                isOpen={emailDraft.isOpen}
                onClose={() => setEmailDraft({ isOpen: false, subject: '', body: '' })}
                draft={emailDraft}
            />

            <StrategyModal
                isOpen={strategyDraft.isOpen}
                onClose={() => setStrategyDraft({ isOpen: false, questions: [], highlights: [] })}
                strategy={strategyDraft}
            />
            
            <CVCheckModal
                isOpen={cvCheck.isOpen}
                onClose={() => setCvCheck({ isOpen: false, matches: [], improvements: [] })}
                checks={cvCheck}
            />

            <ProfileAnalysisModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onAnalyze={handleAnalyzeProfile}
                isAnalyzing={isAnalyzingProfile}
                currentContext={userProfileContext}
            />
        </AppShell>
    );
};

export default App;
