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
    ProfileAnalysisModal
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

    // --- UTILITY HANDLERS ---
    
    const showMessage = (message, type = 'success') => {
        console.log(`[Message: ${type.toUpperCase()}] ${message}`);
        setScanStatus(message);
        setTimeout(() => setScanStatus(''), MESSAGE_DURATION);
    };

    // --- EXPORT/IMPORT HANDLERS ---

    const handleExport = () => {
        const csv = convertToCSV(applications);
        downloadCSV(csv, `zefanya_applications_${new Date().toISOString().split('T')[0]}.csv`);
        showMessage('Data exported successfully!', 'success');
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
            
            const userQuery = `Analyze these ${files.length} documents (CVs, certificates, project docs, images) and synthesize a comprehensive professional profile summary (2-3 paragraphs) of Zefanya Williams's core professional skills, technical expertise, and career focus for job applications. Emphasize the intersection of Digital Marketing, Data Science, and Content Creation/Leadership. Output only the summarized context paragraph(s).`;
            
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

        try {
            const userQuery = `Act as a career coach. Given the job role "${role}" at "${company}", and considering the user's current profile context: "${userProfileContext}", generate a concise, numbered list (3 to 5 points) of highly relevant action items or next steps. Focus on preparation, research, or tailoring skills specific to this job type. Do NOT use introductory or concluding sentences. Only output the numbered list items separated by newlines.`;
            
            const payload = { contents: [{ parts: [{ text: userQuery }] }] };

            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '1. Failed to generate steps. 2. Manual input required.';
            
            setFormData(prev => ({ ...prev, notes: generatedText.trim() }));
            showMessage('Action plan generated successfully!', 'success');

        } catch (error) {
            console.error("Gemini Generation Error:", error);
            showMessage('Failed to generate action plan.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- GEMINI: FOLLOW-UP EMAIL DRAFTER ---
    const handleGenerateEmail = async (app) => {
        setIsEmailLoading(app.id);
        
        let actionType;
        if (app.status === 'INTERVIEW') {
            actionType = 'a polite thank-you and results follow-up after an interview';
        } else if (app.status === 'IN_REVIEW' || app.status === 'SUBMITTED') {
             actionType = 'a polite general application status check (after waiting 10-14 days)';
        } else if (app.status === 'OFFER') {
             actionType = 'a request for offer clarification and confirmation of the decision deadline';
        } else {
             actionType = 'a polite general follow-up';
        }

        const userQuery = `Act as a professional applicant. Draft a formal, concise follow-up email in ENGLISH for the job application: "${app.role}" at "${app.company}", applied on ${app.appliedDate}. The email should be a ${actionType}. Use a professional, respectful tone. The body must include the name Zefanya Williams and gently remind the recruiter of one key skill relevant to the role, based on this profile: ${userProfileContext}.
        
        Output format:
        Subject: [Your Subject Line]
        
        Dear [Recruiter/Hiring Team],
        
        [Email Body]
        
        Sincerely,
        Zefanya Williams`;

        try {
            const payload = { contents: [{ parts: [{ text: userQuery }] }] };
            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            const generatedEmail = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Subject: AI Draft Failed\n\nDear Recruiter,\n\nI was unable to generate the draft. Please copy the details manually.\n\nSincerely,\nZefanya Williams';
            
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
            
            setEmailDraft({ isOpen: true, subject: subject || 'Follow-up Application Status', body: bodyLines.join('\n\n') });
            showMessage(`Email draft generated for ${app.role}!`, 'success');

        } catch (error) {
            console.error("Gemini Email Generation Error:", error);
            showMessage('Failed to generate email.', 'error');
        } finally {
            setIsEmailLoading(null);
        }
    };

    // GEMINI: INTERVIEW STRATEGY GENERATOR
    const handleGenerateStrategy = async (app) => {
        setIsStrategyLoading(app.id);

        const prompt = `Based on the job role "${app.role}" at "${app.company}", and considering the user's current profile context: "${userProfileContext}", generate two lists:
        1. Top 3-4 Potential Interview Questions: List the most likely technical or behavioral questions for this specific role.
        2. Top 3-4 Key Highlights to Mention: List the key selling points from the user's background that are most relevant to answering those questions and securing this specific job.

        Format the output clearly separating the two sections with '---'. Use numbered lists for questions and bullet points for highlights.`;

        try {
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate strategy.';

            const [questionsSection, highlightsSection] = generatedText.split('---').map(s => s.trim());

            const extractList = (section) => {
                if (!section) return [];
                return section.split('\n').map(line => line.replace(/^\s*[\d\.\*-]+\s*/, '').trim()).filter(line => line.length > 0);
            };

            setStrategyDraft({
                isOpen: true,
                questions: extractList(questionsSection.includes('Questions') ? questionsSection : '1. Analysis of a past project'),
                highlights: extractList(highlightsSection || '• Highlight Digital Marketing certification'),
            });

            showMessage('Interview strategy generated!', 'success');

        } catch (error) {
            console.error("Strategy Generation Error:", error);
            showMessage('Failed to generate strategy.', 'error');
        } finally {
            setIsStrategyLoading(null);
        }
    };
    
    // GEMINI: CV CHECK/OPTIMIZATION GENERATOR
    const handleCVCheck = async (app) => {
        setIsCVCheckLoading(app.id);

        const prompt = `Act as an ATS/HR Analyst. Analyze the Job Role "${app.role}" at "${app.company}" against the user's current profile context: "${userProfileContext}". Provide feedback in two clear sections:
        1. Strongest Matches: Identify 3 key skills, experiences, or certifications from the profile that are highly relevant to this specific role.
        2. Areas for CV Improvement: Identify 3 areas where the existing CV/profile summary should be adjusted, emphasized, or quantified (e.g., specific metrics needed, skills to move up) to better align with the job description.

        Format the output clearly separating the two sections with '---'. Use bullet points for both lists.`;

        try {
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate CV check.';

            const [matchesSection, improvementsSection] = generatedText.split('---').map(s => s.trim());

            const extractList = (section) => {
                if (!section) return [];
                return section.split('\n').map(line => line.replace(/^\s*[\d\.\*-]+\s*/, '').trim()).filter(line => line.length > 0);
            };

            setCvCheck({
                isOpen: true,
                matches: extractList(matchesSection.includes('Matches') ? matchesSection : '• Data Science background is a strong match.'),
                improvements: extractList(improvementsSection || '1. Quantify achievements in Content Creation.'),
            });

            showMessage('CV check results generated!', 'success');

        } catch (error) {
            console.error("CV Check Generation Error:", error);
            showMessage('Failed to generate CV check.', 'error');
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

    const { successRate, totalActive, timeSinceLastAction } = calculateKPIs(applications);

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
                    <div className="text-xl text-indigo-600 font-semibold">Memuat Dasbor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
                
                {/* HEADER */}
                <header className="mb-8 bg-white p-6 rounded-2xl shadow-lg animate-fadeIn">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="font-helvetica text-4xl font-extrabold text-gray-800 animate-slideInLeft">
                                Application Flow Tracker
                            </h1>
                            <p className="text-lg text-gray-500 mt-1 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                                Mengelola *pipeline* Anda, dari To-Do hingga Offer.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setIsProfileModalOpen(true)} 
                                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-purple-700 transition-all-smooth btn-primary animate-slideInRight"
                            >
                                About Me
                            </button>
                            <button 
                                onClick={handleAddClick} 
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-all-smooth btn-primary animate-slideInRight" 
                                style={{ animationDelay: '0.1s' }}
                            >
                                + Add Application
                            </button>
                            <input type="file" id="imageFile" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <button 
                                onClick={handleImageScanClick} 
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-blue-700 transition-all-smooth btn-primary flex items-center animate-slideInRight" 
                                style={{ animationDelay: '0.2s' }}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                Scan Image (AI)
                            </button>
                        </div>
                    </div>
                </header>

                {/* VISUALIZATION AND KPI GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <SummaryCard 
                        title="Success Rate" 
                        count={successRate} 
                        colorClass="bg-white border-l-4 border-green-500"
                        icon={
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.066 12.066 0 001 14c0 3.785 2.766 6.945 6.467 8.165A11.986 11.986 0 0012 21.65c3.248 0 6.136-1.393 8.165-3.693C20.669 16.945 22 14.542 22 12c0-2.458-1.331-4.86-3.382-6.96"></path>
                            </svg>
                        }
                        description="Offers / Total Finalized Applications"
                    />
                    <SummaryCard 
                        title="Active Pipeline" 
                        count={totalActive} 
                        colorClass="bg-white border-l-4 border-indigo-500"
                        icon={
                            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a4 4 0 014-4h10a4 4 0 014 4v1m-4-4h2m-4 0h-2"></path>
                            </svg>
                        }
                        description="In Review, Submitted, Interview"
                    />
                    <SummaryCard 
                        title="Last Update" 
                        count={timeSinceLastAction} 
                        colorClass="bg-white border-l-4 border-yellow-500"
                        icon={
                            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        }
                        description="Sejak status aplikasi terakhir diperbarui"
                    />
                    <div className="lg:col-span-3">
                        <StatusDistributionChart applications={applications} />
                    </div>
                </div>

                {/* FILTER AND ACTION BAR */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0 sm:space-x-4 animate-fadeIn">
                    <div className="w-full sm:w-1/2">
                        <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Search Applications
                        </label>
                        <input
                            id="searchInput"
                            type="text"
                            placeholder="Search by job role or company name..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            aria-describedby="searchHelp"
                        />
                        <p id="searchHelp" className="text-xs text-gray-500 mt-1">
                            Filter by job role or company name
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            onClick={handleExport} 
                            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-green-700 transition-all-smooth flex items-center text-sm"
                        >
                            Export CSV
                        </button>
                        <input type="file" id="importFile" accept=".csv" className="hidden" onChange={handleImport} />
                        <button 
                            onClick={() => document.getElementById('importFile').click()} 
                            className="bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-yellow-700 transition-all-smooth flex items-center text-sm"
                        >
                            Import CSV
                        </button>
                    </div>
                </div>

                {/* APPLICATION LIST */}
                <h2 className="font-georgia text-2xl font-bold text-gray-700 mb-5 animate-slideInLeft">
                    Application Pipeline ({filteredApps.length} Results)
                </h2>

                <div className="space-y-4">
                    {appsToRender.length > 0 ? (
                        appsToRender.map((app, index) => (
                            <ApplicationCard 
                                key={app.id} 
                                app={app} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete} 
                                onGenerateEmail={handleGenerateEmail} 
                                isEmailLoading={isEmailLoading} 
                                onGenerateStrategy={handleGenerateStrategy} 
                                isStrategyLoading={isStrategyLoading} 
                                onCVCheck={handleCVCheck} 
                                isCVCheckLoading={isCVCheckLoading} 
                            />
                        ))
                    ) : (
                        <div className="p-10 text-center bg-white rounded-xl shadow-md text-gray-500 animate-fadeIn">
                            Tidak ada lamaran yang cocok dengan kriteria pencarian Anda.
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg animate-fadeIn">
                        <div className="text-sm text-gray-600">
                            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredApps.length)} dari {filteredApps.length} hasil (Halaman {currentPage} dari {totalPages})
                        </div>
                        <div className="space-x-3">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all-smooth"
                            >
                                Sebelumnya
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all-smooth"
                            >
                                Selanjutnya
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
        </div>
    );
};

export default App;
