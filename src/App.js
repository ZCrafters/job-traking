import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, doc, setDoc, onSnapshot, collection, updateDoc, deleteDoc, getDoc, addDoc, setLogLevel, writeBatch, getDocs, Timestamp
} from 'firebase/firestore';

// Core Component Imports (needed immediately)
import {
    StatusBadge,
    StatusDistributionChart,
    AppShell,
    Sidebar,
    Topbar,
    StatCard,
    ChartCard,
    ApplicationsTable
} from './components/index.js';

// Lazy load modal components (not needed on initial render)
const ApplicationModal = lazy(() => import('./components/ApplicationModal.js'));
const EmailDraftModal = lazy(() => import('./components/EmailDraftModal.js'));
const StrategyModal = lazy(() => import('./components/StrategyModal.js'));
const CVCheckModal = lazy(() => import('./components/CVCheckModal.js'));
const ProfileAnalysisModal = lazy(() => import('./components/ProfileAnalysisModal.js'));

// Utility Imports
import {
    timeAgo,
    calculateKPIs,
    convertToCSV,
    parseCSV,
    downloadCSV,
    processFilesForUpload,
    fileToBase64,
    sanitizeInput,
    STATUS_MAP,
    ITEMS_PER_PAGE,
    APPLICANT_NAME,
    EMAIL_ACTIONS,
    BASE_SKILLS_CONTEXT,
    API_URL,
    DEEPSEEK_API_URL,
    DEEPSEEK_API_KEY_VALUE,
    DEEPSEEK_MODEL,
    OCR_SYSTEM_INSTRUCTION,
    OCR_RESPONSE_SCHEMA,
    initialApplications,
    MESSAGE_DURATION
} from './utils/index.js';

// Global Environment Variables
const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};
const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN || null;

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
    
    const showMessage = useCallback((message, type = 'success') => {
        console.log(`[Message: ${type.toUpperCase()}] ${message}`);
        setScanStatus(message);
        setTimeout(() => setScanStatus(''), MESSAGE_DURATION);
    }, []);

    // --- EXPORT/IMPORT HANDLERS ---

    const handleExport = useCallback(() => {
        const csv = convertToCSV(applications);
        downloadCSV(csv, `zefanya_applications_${new Date().toISOString().split('T')[0]}.csv`);
        showMessage('Data exported successfully!', 'success');
    }, [applications, showMessage]);

    const handleImportClick = useCallback(() => {
        document.getElementById('importFile').click();
    }, []);

    const handleImport = useCallback((e) => {
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
    }, [userId, dbInstance, showMessage]);

    // --- FIREBASE INITIALIZATION & AUTH ---
    useEffect(() => {
        setLogLevel('error');

        // Check if Firebase configuration is provided (validate required fields)
        const requiredFields = ['apiKey', 'authDomain', 'projectId'];
        const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
        
        if (missingFields.length > 0) {
            console.warn(
                `Firebase configuration is incomplete. Missing: ${missingFields.join(', ')}\n` +
                "Please set up your environment variables.\n" +
                "Copy .env.example to .env and add your Firebase credentials.\n" +
                "See DEPLOYMENT.md for more information."
            );
            // Set auth ready to allow app to function without Firebase
            setIsAuthReady(true);
            return;
        }

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
                        setIsAuthReady(true);
                    }
                }
            });
        } catch (e) {
            console.error("Firebase Initialization Failed:", e);
            console.error("Please check your Firebase configuration in .env file");
            setIsAuthReady(true);
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
    
    const handleSave = useCallback(async (data) => {
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
    }, [userId, dbInstance, showMessage]);

    const handleDelete = useCallback(async (id) => {
        if (!userId || !dbInstance) return;
        if (window.confirm("Are you sure you want to delete this application?")) {
            const path = `artifacts/${appId}/users/${userId}/saas_application_tracker`;
            try {
                await deleteDoc(doc(dbInstance, path, id));
                showMessage('Application successfully deleted!', 'success');
                // Reset to page 1 after delete to avoid potential empty pages
                setCurrentPage(1);
            } catch (e) {
                console.error("Error deleting document: ", e);
                showMessage('Failed to delete application.', 'error');
            }
        }
    }, [userId, dbInstance, showMessage]);
    
    // --- MODAL CONTROL ---

    const handleAddClick = useCallback(() => {
        setModalData({
            role: '', company: '', location: '', appliedDate: new Date().toISOString().split('T')[0], status: 'TO_APPLY', link: '', notes: '', source: 'Manual Input'
        });
        setScanStatus('');
        setIsScanning(false);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((app) => {
        setModalData({ ...app, appliedDate: app.appliedDate || new Date().toISOString().split('T')[0] });
        setScanStatus('');
        setIsScanning(false);
        setIsModalOpen(true);
    }, []);

    // --- AI SCAN LOGIC ---
    
    const handleImageScanClick = useCallback(() => {
        document.getElementById('imageFile').click();
    }, []);
    
    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);
    
    const handleProfileClick = useCallback(() => {
        setIsProfileModalOpen(true);
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        handleAddClick();
        
        setIsScanning(true);
        setScanStatus('Scanning image and extracting data...');
        
        try {
            const base64ImageData = await fileToBase64(file);
            let extractedData = null;
            let aiProvider = 'Gemini';
            
            // Try Gemini first
            try {
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
                
                if (!response.ok) throw new Error(`Gemini API failed: ${response.status}`);
                
                const result = await response.json();
                const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (!jsonText) throw new Error("Gemini response was empty.");
                
                extractedData = JSON.parse(jsonText)?.[0] || {};
                
            } catch (geminiError) {
                console.warn("Gemini API failed, trying DeepSeek fallback:", geminiError);
                setScanStatus('Primary AI failed, trying fallback AI...');
                
                // Fallback to DeepSeek
                try {
                    if (!DEEPSEEK_API_KEY_VALUE) {
                        throw new Error("DeepSeek API key not configured");
                    }
                    
                    // Use consistent prompt structure with Gemini
                    const deepseekPrompt = "Extract the Company Name, the Job Role/Position, and the Date (Applied Date or Deadline). Return ONLY a valid JSON object with this exact structure: {\"companyName\": \"company name or N/A\", \"jobRole\": \"job role or N/A\", \"date\": \"date in YYYY-MM-DD format or N/A\"}. If the date is in DD/MM/YYYY format, convert it to YYYY-MM-DD. Do not include any other text, explanations, or formatting.";
                    
                    const deepseekPayload = {
                        model: DEEPSEEK_MODEL,
                        messages: [
                            {
                                role: "system",
                                content: "You are an expert OCR and data extraction tool for job applications. Always respond with valid JSON only, no additional text."
                            },
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: deepseekPrompt },
                                    { type: "image_url", image_url: { url: `data:${file.type};base64,${base64ImageData}` } }
                                ]
                            }
                        ],
                        temperature: 0.1,
                        max_tokens: 500
                    };
                    
                    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${DEEPSEEK_API_KEY_VALUE}`
                        },
                        body: JSON.stringify(deepseekPayload)
                    });
                    
                    if (!deepseekResponse.ok) {
                        const errorText = await deepseekResponse.text();
                        throw new Error(`DeepSeek API failed: ${deepseekResponse.status} - ${errorText}`);
                    }
                    
                    const deepseekResult = await deepseekResponse.json();
                    const deepseekContent = deepseekResult.choices?.[0]?.message?.content;
                    
                    if (!deepseekContent) throw new Error("DeepSeek response was empty.");
                    
                    // Parse the JSON from DeepSeek response more safely
                    try {
                        // Try direct parsing first
                        extractedData = JSON.parse(deepseekContent);
                    } catch (parseError) {
                        // If direct parsing fails, try to extract JSON object using a more specific pattern
                        const jsonMatch = deepseekContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
                        if (jsonMatch) {
                            extractedData = JSON.parse(jsonMatch[0]);
                        } else {
                            throw new Error("Could not extract valid JSON from DeepSeek response");
                        }
                    }
                    
                    // Validate the extracted data has expected fields
                    if (!extractedData || typeof extractedData !== 'object' || !('companyName' in extractedData || 'jobRole' in extractedData)) {
                        throw new Error("DeepSeek response missing required fields");
                    }
                    
                    aiProvider = 'DeepSeek';
                    
                } catch (deepseekError) {
                    console.error("DeepSeek API also failed:", deepseekError);
                    const geminiMsg = geminiError.message || 'Unknown error';
                    const deepseekMsg = deepseekError.message || 'Unknown error';
                    throw new Error(`Both AI providers failed. Gemini: ${geminiMsg}. DeepSeek: ${deepseekMsg}`);
                }
            }
            
            // Process extracted data
            if (!extractedData) throw new Error("No data could be extracted from the image.");
            
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
                source: `Image Scan (${aiProvider})`,
            }));
            
            setScanStatus(`Data extracted successfully using ${aiProvider}! Review details before saving.`);

        } catch (error) {
            console.error("Image Scan Error:", error);
            setScanStatus(`Error: ${error.message || 'An error occurred during scanning. Check console.'}`);
        } finally {
            setIsScanning(false);
            e.target.value = null;
        }
    };

    // --- UI Calculations (Memoized for Performance) ---

    // Tab configuration
    const tabConfig = useMemo(() => ({
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Track and manage your job applications'
        },
        applications: {
            title: 'Applications',
            subtitle: 'View and manage all your job applications'
        },
        analytics: {
            title: 'Analytics',
            subtitle: 'Analyze your application performance'
        },
        settings: {
            title: 'Settings',
            subtitle: 'Configure your preferences'
        }
    }), []);

    // Calculate KPIs and status counts - only recalculate when applications change
    const kpis = useMemo(() => {
        const kpiData = calculateKPIs(applications);
        const interviewCount = applications.filter(a => a.status === 'INTERVIEW').length;
        return { ...kpiData, interviewCount };
    }, [applications]);
    
    const { successRate, totalActive, timeSinceLastAction, totalOffers, interviewCount } = kpis;

    // Reusable KPI Cards component
    const KPICards = useCallback(() => (
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
    ), [applications.length, totalActive, interviewCount, totalOffers, successRate]);

    // --- Pagination Logic (Memoized) ---
    const filteredApps = useMemo(() => {
        if (!searchTerm) return applications;
        const lowerSearch = searchTerm.toLowerCase();
        return applications.filter(app => 
            app.role.toLowerCase().includes(lowerSearch) || 
            app.company.toLowerCase().includes(lowerSearch)
        );
    }, [applications, searchTerm]);
    
    const paginationData = useMemo(() => {
        const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const appsToRender = filteredApps.slice(startIndex, endIndex);
        return { totalPages, startIndex, endIndex, appsToRender };
    }, [filteredApps, currentPage]);
    
    const { totalPages, startIndex, endIndex, appsToRender } = paginationData;

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
                    onSearchChange={handleSearchChange}
                    onAddClick={handleAddClick}
                    onScanClick={handleImageScanClick}
                    onProfileClick={handleProfileClick}
                    onExport={handleExport}
                    onImport={handleImportClick}
                />
            }
        >
            {/* Hidden file inputs */}
            <input type="file" id="imageFile" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <input type="file" id="importFile" accept=".csv" className="hidden" onChange={handleImport} />

            {/* Page Title - Dynamic based on active tab */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {tabConfig[activeTab]?.title || 'Dashboard'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {tabConfig[activeTab]?.subtitle || 'Track and manage your job applications'}
                </p>
            </div>

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
                <>
                    {/* KPI Cards Row */}
                    <KPICards />

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
                </>
            )}

            {/* Applications View */}
            {activeTab === 'applications' && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
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
            )}

            {/* Analytics View */}
            {activeTab === 'analytics' && (
                <>
                    {/* KPI Cards Row */}
                    <KPICards />

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <ChartCard 
                            title="Status Distribution" 
                            subtitle="Overview of application statuses"
                        >
                            <StatusDistributionChart applications={applications} />
                        </ChartCard>
                        
                        <ChartCard 
                            title="Application Timeline" 
                            subtitle="Applications over time"
                        >
                            <div className="space-y-3">
                                {applications.slice(0, 8).map((app) => (
                                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{app.role}</p>
                                            <p className="text-xs text-gray-500">{app.company}</p>
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                ))}
                                {applications.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No applications yet</p>
                                )}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Additional Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ChartCard 
                            title="Response Rate" 
                            subtitle="Applications with responses"
                        >
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-indigo-600">{successRate}</p>
                                    <p className="text-sm text-gray-600 mt-2">Success Rate</p>
                                </div>
                            </div>
                        </ChartCard>

                        <ChartCard 
                            title="Average Response Time" 
                            subtitle="Time to hear back"
                        >
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-blue-600">{timeSinceLastAction}</p>
                                    <p className="text-sm text-gray-600 mt-2">Last Update</p>
                                </div>
                            </div>
                        </ChartCard>

                        <ChartCard 
                            title="Active Applications" 
                            subtitle="Currently in progress"
                        >
                            <div className="flex items-center justify-center h-32">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-green-600">{totalActive}</p>
                                    <p className="text-sm text-gray-600 mt-2">Active</p>
                                </div>
                            </div>
                        </ChartCard>
                    </div>
                </>
            )}

            {/* Settings View */}
            {activeTab === 'settings' && (
                <div className="max-w-4xl">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Applicant Name
                                </label>
                                <input
                                    type="text"
                                    value={APPLICANT_NAME}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This is configured in your environment settings
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Context
                                </label>
                                <textarea
                                    value={userProfileContext}
                                    disabled
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Click "Analyze Profile" in the top bar to update your context
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Export Data</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Export all your application data as a CSV file
                                </p>
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    Export to CSV
                                </button>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Import Data</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Import application data from a CSV file
                                </p>
                                <button
                                    onClick={handleImportClick}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                                >
                                    Import from CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Application:</strong> Job Application Tracker</p>
                            <p><strong>Version:</strong> 2.0</p>
                            <p><strong>Total Applications:</strong> {applications.length}</p>
                            <p className="pt-4 border-t border-gray-200 mt-4">
                                This application helps you track and manage your job applications with AI-powered features.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals - Lazy loaded with Suspense */}
            <Suspense fallback={null}>
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
            </Suspense>
        </AppShell>
    );
};

export default App;
