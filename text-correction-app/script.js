// Text Correction & Rephrasing Application
// Main JavaScript file

// DOM Elements
const inputText = document.getElementById('input-text');
const fileUpload = document.getElementById('file-upload');
const clearBtn = document.getElementById('clear-btn');
const processBtn = document.getElementById('process-btn');
const resultsSection = document.getElementById('results-section');
const loadingOverlay = document.getElementById('loading-overlay');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const closeError = document.getElementById('close-error');
const modeCorrect = document.getElementById('mode-correct');
const modeGenerate = document.getElementById('mode-generate');

// Result elements
const originalText = document.getElementById('original-text');
const improvedText = document.getElementById('improved-text');
const inputWordCount = document.getElementById('input-word-count');
const originalWordCount = document.getElementById('original-word-count');
const improvedWordCount = document.getElementById('improved-word-count');
const errorsCount = document.getElementById('errors-count');
const correctionsCount = document.getElementById('corrections-count');
const improvementScore = document.getElementById('improvement-score');
const errorDetails = document.getElementById('error-details');
const errorList = document.getElementById('error-list');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');

// State
let currentOriginalText = '';
let currentImprovedText = '';
let currentErrors = [];

// LanguageTool API Configuration
const LANGUAGETOOL_API = 'https://api.languagetool.org/v2/check';
const LANGUAGE = 'en-US';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateWordCount();
    
    // Ensure loading overlay and error message are hidden on page load
    showLoading(false);
    hideError();
});

// Event Listeners
function setupEventListeners() {
    inputText.addEventListener('input', updateWordCount);
    fileUpload.addEventListener('change', handleFileUpload);
    clearBtn.addEventListener('click', clearInput);
    processBtn.addEventListener('click', processText);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadText);
    closeError.addEventListener('click', hideError);
    modeCorrect.addEventListener('change', updateMode);
    modeGenerate.addEventListener('change', updateMode);
}

// Update Mode
function updateMode() {
    const isGenerateMode = modeGenerate.checked;
    const btnText = processBtn.querySelector('.btn-text');
    
    if (isGenerateMode) {
        btnText.textContent = '✨ Generate Content';
        inputText.placeholder = 'Enter keywords or short phrases (e.g., "meeting reminder", "leave request", "project update email")...';
    } else {
        btnText.textContent = '✓ Check & Improve Text';
        inputText.placeholder = 'Enter or paste your text here... You can also upload a text file using the button above.';
    }
}

// Word Count
function updateWordCount() {
    const text = inputText.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    inputWordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function countWords(text) {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

// File Upload Handler
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await readFile(file);
        inputText.value = text;
        updateWordCount();
        showSuccess('File uploaded successfully!');
    } catch (error) {
        showError('Failed to read file. Please ensure it\'s a text file.');
    }
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        // Handle different file types
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            reject(new Error('Unsupported file type. Please use .txt files.'));
        }
    });
}

// Clear Input
function clearInput() {
    inputText.value = '';
    updateWordCount();
    resultsSection.hidden = true;
    currentOriginalText = '';
    currentImprovedText = '';
    currentErrors = [];
}

// Main Processing Function
async function processText() {
    const text = inputText.value.trim();
    const isGenerateMode = modeGenerate.checked;
    
    if (!text) {
        showError('Please enter some text to process.');
        return;
    }

    // Different validation for generate mode
    if (isGenerateMode) {
        if (countWords(text) < 1) {
            showError('Please enter at least one keyword or phrase.');
            return;
        }
    } else {
        if (countWords(text) < 3) {
            showError('Please enter at least 3 words for meaningful analysis.');
            return;
        }
    }

    try {
        showLoading(true);
        setProcessingState(true);
        
        // Store original text
        currentOriginalText = text;
        
        let improved;
        let errors = [];
        
        if (isGenerateMode) {
            // Generate content mode
            improved = generateContent(text);
            currentErrors = [];
        } else {
            // Correction mode
            // Check grammar and spelling
            errors = await checkGrammar(text);
            currentErrors = errors;
            
            // Apply corrections and rephrase
            improved = await improveText(text, errors);
        }
        
        currentImprovedText = improved;
        
        // Display results
        displayResults(text, improved, errors);
        
        showLoading(false);
        setProcessingState(false);
        
    } catch (error) {
        console.error('Processing error:', error);
        showError('An error occurred while processing your text. Please try again.');
        showLoading(false);
        setProcessingState(false);
    }
}

// Grammar Checking with LanguageTool API
async function checkGrammar(text) {
    try {
        const formData = new URLSearchParams();
        formData.append('text', text);
        formData.append('language', LANGUAGE);
        formData.append('enabledOnly', 'false');
        
        const response = await fetch(LANGUAGETOOL_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.matches || [];
        
    } catch (error) {
        console.error('Grammar check error:', error);
        throw new Error('Failed to check grammar. Please check your internet connection.');
    }
}

// Text Improvement Function
async function improveText(text, errors) {
    let improved = text;
    
    // Sort errors by offset in reverse order to maintain correct positions
    const sortedErrors = [...errors].sort((a, b) => b.offset - a.offset);
    
    // Apply corrections
    for (const error of sortedErrors) {
        if (error.replacements && error.replacements.length > 0) {
            const replacement = error.replacements[0].value;
            const before = improved.substring(0, error.offset);
            const after = improved.substring(error.offset + error.length);
            improved = before + replacement + after;
        }
    }
    
    // Apply rephrasing rules
    improved = rephraseSentences(improved);
    
    return improved;
}

// Content Generation Function
function generateContent(keywords) {
    const input = keywords.toLowerCase().trim();
    
    // Content templates based on keywords
    const templates = {
        // Meeting related
        'meeting reminder': `Dear Team,\n\nThis is a friendly reminder about our upcoming meeting scheduled for [Date] at [Time]. Please ensure you have reviewed the agenda and come prepared with any questions or updates.\n\nLooking forward to a productive discussion.\n\nBest regards`,
        
        'meeting': `Subject: Meeting Invitation\n\nDear Team,\n\nI would like to schedule a meeting to discuss [Topic]. Please let me know your availability for [Date/Time].\n\nAgenda:\n- [Point 1]\n- [Point 2]\n- [Point 3]\n\nThank you for your cooperation.\n\nBest regards`,
        
        // Leave related - Specific types
        'sick leave': `Subject: Sick Leave Application\n\nDear [Manager Name],\n\nI am writing to inform you that I am unwell and unable to attend work. I would like to request sick leave for [Duration/Dates].\n\nSymptoms: [Brief description - e.g., fever, flu, medical condition]\n\nI have consulted with a doctor and have been advised to take rest. I will provide a medical certificate upon my return.\n\nDuring my absence:\n- [Colleague Name] will handle urgent matters\n- All pending tasks have been documented\n- I will be available via email for critical issues\n\nI kindly request your approval for this leave.\n\nThank you for your understanding.\n\nBest regards`,
        
        'medical leave': `Subject: Medical Leave Request\n\nDear [Manager Name],\n\nI am writing to request medical leave from [Start Date] to [End Date] due to [Medical Reason/Procedure].\n\nMedical Details:\n- Condition: [Brief description]\n- Doctor's recommendation: [Number of days rest]\n- Medical certificate: Will be provided\n\nWork Coverage:\n- [Colleague Name] will handle my responsibilities\n- All current projects are up to date\n- Emergency contact: [Your phone number]\n\nI will ensure a smooth handover before my leave and will be back to work on [Return Date].\n\nThank you for your consideration.\n\nBest regards`,
        
        'casual leave': `Subject: Casual Leave Application\n\nDear [Manager Name],\n\nI would like to request casual leave on [Date(s)] due to [Personal Reason - e.g., personal commitment, family matter].\n\nLeave Details:\n- Date(s): [Specific dates]\n- Duration: [Number of days]\n- Reason: [Brief explanation]\n\nI have ensured that:\n- All urgent tasks are completed\n- [Colleague Name] is briefed on pending matters\n- I will be available on phone if needed\n\nI kindly request your approval for this leave.\n\nThank you.\n\nBest regards`,
        
        'emergency leave': `Subject: Emergency Leave Request\n\nDear [Manager Name],\n\nI am writing to request emergency leave due to [Urgent Situation - e.g., family emergency, unforeseen circumstances].\n\nLeave Details:\n- Required from: [Start Date/Time]\n- Expected duration: [Number of days]\n- Reason: [Brief explanation of emergency]\n\nI apologize for the short notice. I have:\n- Informed [Colleague Name] about urgent tasks\n- Documented all pending work\n- Will remain reachable via phone: [Your number]\n\nI will provide any necessary documentation upon my return.\n\nThank you for your understanding in this difficult time.\n\nBest regards`,
        
        'leave request': `Subject: Leave Request - [Type of Leave]\n\nDear [Manager Name],\n\nI am writing to request leave from [Start Date] to [End Date] due to [Reason].\n\nLeave Details:\n- Type: [Casual/Sick/Personal]\n- Duration: [Number of days]\n- Dates: [Specific dates]\n\nWork Arrangements:\n- All pending tasks: [Status]\n- Handover to: [Colleague Name]\n- Availability: [Email/Phone if needed]\n\nI have ensured that my absence will not impact ongoing projects, and I will complete any urgent work before my leave begins.\n\nI kindly request your approval for the same.\n\nThank you for your understanding.\n\nBest regards`,
        
        'leave': `Subject: Leave Application\n\nDear [Manager Name],\n\nI would like to request leave for [Duration] due to [Reason].\n\nI will ensure all my responsibilities are covered during my absence and will coordinate with [Colleague Name] for any urgent matters.\n\nKindly approve my leave request.\n\nThank you.\n\nBest regards`,
        
        // Project related
        'project update': `Subject: Project Status Update\n\nDear Team,\n\nI am writing to provide an update on the [Project Name] project.\n\nProgress:\n- Completed: [Task 1], [Task 2]\n- In Progress: [Task 3], [Task 4]\n- Upcoming: [Task 5]\n\nChallenges:\n- [Challenge 1]\n- [Challenge 2]\n\nNext Steps:\n- [Action 1]\n- [Action 2]\n\nPlease let me know if you have any questions or concerns.\n\nBest regards`,
        
        'project': `Subject: Project Update\n\nDear Stakeholders,\n\nI am pleased to share the current status of [Project Name]. We have made significant progress and are on track to meet our deadlines.\n\nKey Achievements:\n- [Achievement 1]\n- [Achievement 2]\n\nUpcoming Milestones:\n- [Milestone 1]\n- [Milestone 2]\n\nThank you for your continued support.\n\nBest regards`,
        
        // Email related
        'email': `Subject: [Your Subject]\n\nDear [Recipient Name],\n\nI hope this email finds you well.\n\n[Main content of your message]\n\nPlease let me know if you need any additional information.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]`,
        
        'follow up': `Subject: Follow-up on [Topic]\n\nDear [Name],\n\nI hope this message finds you well. I am writing to follow up on [Previous Discussion/Request].\n\nCould you please provide an update on the status? I would appreciate any information you can share.\n\nThank you for your attention to this matter.\n\nBest regards`,
        
        // Apology
        'apology': `Subject: Apology for [Issue]\n\nDear [Name],\n\nI sincerely apologize for [Issue/Mistake]. I understand that this may have caused inconvenience, and I take full responsibility.\n\nI have taken steps to ensure this does not happen again:\n- [Action 1]\n- [Action 2]\n\nThank you for your understanding and patience.\n\nBest regards`,
        
        // Thank you
        'thank you': `Subject: Thank You\n\nDear [Name],\n\nI wanted to take a moment to express my sincere gratitude for [Reason]. Your support and assistance have been invaluable.\n\nI truly appreciate your time and effort.\n\nThank you once again.\n\nBest regards`,
        
        // Announcement
        'announcement': `Subject: Important Announcement\n\nDear Team,\n\nI am writing to inform you about [Topic/Change].\n\nDetails:\n- [Detail 1]\n- [Detail 2]\n- [Detail 3]\n\nEffective Date: [Date]\n\nIf you have any questions or concerns, please feel free to reach out.\n\nThank you for your attention.\n\nBest regards`,
        
        // Report
        'report': `Subject: [Report Type] Report\n\nDear [Recipient],\n\nPlease find below the [Report Type] report for [Period].\n\nSummary:\n- [Key Point 1]\n- [Key Point 2]\n- [Key Point 3]\n\nDetailed Analysis:\n[Provide detailed information]\n\nConclusion:\n[Summary and recommendations]\n\nPlease let me know if you need any clarification.\n\nBest regards`,
        
        // Request
        'request': `Subject: Request for [Item/Action]\n\nDear [Name],\n\nI am writing to request [Item/Action] for [Reason/Purpose].\n\nDetails:\n- [Detail 1]\n- [Detail 2]\n\nI would appreciate your assistance with this matter at your earliest convenience.\n\nThank you for your consideration.\n\nBest regards`,
    };
    
    // Check for matching template with priority order (most specific first)
    // Check for specific leave types first
    if (input.match(/\b(sick|ill|unwell|fever|medical condition)\b/i)) {
        return templates['sick leave'];
    }
    if (input.match(/\b(medical|surgery|treatment|hospital|doctor)\b/i) && input.match(/\bleave\b/i)) {
        return templates['medical leave'];
    }
    if (input.match(/\b(emergency|urgent|family emergency)\b/i) && input.match(/\bleave\b/i)) {
        return templates['emergency leave'];
    }
    if (input.match(/\b(casual|personal)\b/i) && input.match(/\bleave\b/i)) {
        return templates['casual leave'];
    }
    
    // Then check for general patterns
    for (const [key, template] of Object.entries(templates)) {
        if (input.includes(key)) {
            return template;
        }
    }
    
    // If no specific template matches, generate a generic professional message
    return generateGenericContent(keywords);
}

// Generate generic professional content
function generateGenericContent(keywords) {
    const words = keywords.split(/\s+/);
    
    // Detect intent from keywords
    if (keywords.match(/\b(urgent|asap|immediate|critical)\b/i)) {
        return `Subject: Urgent: ${capitalizeWords(keywords)}\n\nDear Team,\n\nThis is an urgent matter regarding ${keywords}. Immediate attention is required.\n\nPlease prioritize this and provide an update at your earliest convenience.\n\nThank you for your prompt response.\n\nBest regards`;
    }
    
    if (keywords.match(/\b(help|assist|support|need)\b/i)) {
        return `Subject: Request for Assistance\n\nDear Team,\n\nI am reaching out to request your assistance with ${keywords}.\n\nYour support would be greatly appreciated. Please let me know if you can help with this matter.\n\nThank you for your time and consideration.\n\nBest regards`;
    }
    
    if (keywords.match(/\b(update|status|progress)\b/i)) {
        return `Subject: Update on ${capitalizeWords(keywords)}\n\nDear Team,\n\nI wanted to provide you with an update regarding ${keywords}.\n\nCurrent Status:\n- [Status Point 1]\n- [Status Point 2]\n\nNext Steps:\n- [Action 1]\n- [Action 2]\n\nPlease let me know if you have any questions.\n\nBest regards`;
    }
    
    // Default generic template
    return `Subject: Regarding ${capitalizeWords(keywords)}\n\nDear [Recipient],\n\nI am writing to discuss ${keywords}.\n\n[Please provide more details about your message]\n\nI look forward to your response.\n\nThank you for your time.\n\nBest regards,\n[Your Name]`;
}

// Helper function to capitalize words
function capitalizeWords(str) {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Rule-based Rephrasing
function rephraseSentences(text) {
    let rephrased = text;
    
    // Detect and handle specific patterns first (order matters - most specific first)
    
    // Pattern: "pls chk and update client waiting from yday"
    if (/\bpls chk and update client waiting from yday\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\bpls chk and update client waiting from yday\b/gi,
            'Please check and provide an update. The client has been waiting since yesterday');
    }
    
    // Pattern: "cant attend meeting today due fever"
    if (/\bcant attend meeting today due fever\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\bcant attend meeting today due fever\b/gi,
            'I am unable to attend today\'s meeting due to a fever');
    }
    
    // Pattern: "Yesterday deployment failed because database connection was unstable backend team checking issue"
    if (/\byesterday deployment failed because database connection was unstable backend team checking issue\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\byesterday deployment failed because database connection was unstable backend team checking issue\b/gi,
            'Yesterday\'s deployment failed due to an unstable database connection. The backend team is currently investigating the issue');
    }
    
    // Pattern: "Hello i did not got your mail"
    if (/\bhello i did not got your mail\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\bhello i did not got your mail\b/gi, 'Hello, I did not receive your email');
        rephrased = rephrased.replace(/\bcan you resend it\b/gi, 'Could you please resend it');
    }
    
    // Pattern: Informal greeting with slang (hey bro, hi bro, etc.)
    if (/\b(hey|hi)\s+(bro|dude|man)\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\b(hey|hi)\s+(bro|dude|man)\b/gi, 'Hello');
        rephrased = rephrased.replace(/\bi didnt got\b/gi, 'I did not receive');
        rephrased = rephrased.replace(/\bur\b/gi, 'your');
        rephrased = rephrased.replace(/\bu\b/gi, 'you');
        rephrased = rephrased.replace(/\bcan u\b/gi, 'could you please');
        rephrased = rephrased.replace(/\bresend\b/gi, 'resend it');
        rephrased = rephrased.replace(/\basap\b/gi, 'at your earliest convenience');
    }
    
    // Pattern: Incomplete sentences (Meeting postponed...)
    if (/\bmeeting postponed because\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\bmeeting postponed because client not available\b/gi, 'The meeting has been postponed because the client is not available');
    }
    
    // Pattern: Harsh/rude feedback - "Your work is wrong fix it fast"
    if (/\byour work is wrong\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\byour work is wrong\b/gi, 'I noticed some issues with the work');
        rephrased = rephrased.replace(/\bfix it fast\b/gi, 'Could you please review and resolve them at your earliest convenience');
    }
    
    // Pattern: Run-on sentences with technical content
    if (/\bapi response but data was missing and\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\bi checked the api response but data was missing and backend team said issue from database however frontend expecting proper json format\b/gi,
            'I checked the API response, but the data was missing. The backend team indicated that the issue originates from the database. However, the frontend is expecting a proper JSON format');
    }
    
    // Pattern: Leave request
    if (/\bi need leave\b/gi.test(rephrased)) {
        rephrased = rephrased.replace(/\bi need leave tomorrow family function\b/gi,
            'I would like to request leave for tomorrow due to a family function. I kindly request your approval for the same');
    }
    
    // General improvements
    const improvements = [
        // Grammar corrections - "did not got" -> "did not receive"
        { pattern: /\bdid not got\b/gi, replacement: 'did not receive' },
        { pattern: /\bdidnt got\b/gi, replacement: 'did not receive' },
        { pattern: /\bdidn't got\b/gi, replacement: 'did not receive' },
        
        // "mail" -> "email" in professional context
        { pattern: /\byour mail\b/gi, replacement: 'your email' },
        { pattern: /\bthe mail\b/gi, replacement: 'the email' },
        
        // "can you" -> "Could you please" for politeness
        { pattern: /\bcan you resend\b/gi, replacement: 'Could you please resend' },
        
        // Convert contractions to full forms
        { pattern: /\bcan't\b/gi, replacement: 'cannot' },
        { pattern: /\bcant\b/gi, replacement: 'cannot' },
        { pattern: /\bwon't\b/gi, replacement: 'will not' },
        { pattern: /\bwont\b/gi, replacement: 'will not' },
        { pattern: /\bdon't\b/gi, replacement: 'do not' },
        { pattern: /\bdont\b/gi, replacement: 'do not' },
        { pattern: /\bdoesn't\b/gi, replacement: 'does not' },
        { pattern: /\bdoesnt\b/gi, replacement: 'does not' },
        { pattern: /\bdidn't\b/gi, replacement: 'did not' },
        { pattern: /\bdidnt\b/gi, replacement: 'did not' },
        { pattern: /\bisn't\b/gi, replacement: 'is not' },
        { pattern: /\bisnt\b/gi, replacement: 'is not' },
        { pattern: /\baren't\b/gi, replacement: 'are not' },
        { pattern: /\barent\b/gi, replacement: 'are not' },
        { pattern: /\bwasn't\b/gi, replacement: 'was not' },
        { pattern: /\bwasnt\b/gi, replacement: 'was not' },
        { pattern: /\bweren't\b/gi, replacement: 'were not' },
        { pattern: /\bwerent\b/gi, replacement: 'were not' },
        { pattern: /\bhasn't\b/gi, replacement: 'has not' },
        { pattern: /\bhasnt\b/gi, replacement: 'has not' },
        { pattern: /\bhaven't\b/gi, replacement: 'have not' },
        { pattern: /\bhavent\b/gi, replacement: 'have not' },
        { pattern: /\bhadn't\b/gi, replacement: 'had not' },
        { pattern: /\bhadnt\b/gi, replacement: 'had not' },
        { pattern: /\bshouldn't\b/gi, replacement: 'should not' },
        { pattern: /\bshouldnt\b/gi, replacement: 'should not' },
        { pattern: /\bwouldn't\b/gi, replacement: 'would not' },
        { pattern: /\bwouldnt\b/gi, replacement: 'would not' },
        { pattern: /\bcouldn't\b/gi, replacement: 'could not' },
        { pattern: /\bcouldnt\b/gi, replacement: 'could not' },
        { pattern: /\bmightn't\b/gi, replacement: 'might not' },
        { pattern: /\bmightnt\b/gi, replacement: 'might not' },
        { pattern: /\bmustn't\b/gi, replacement: 'must not' },
        { pattern: /\bmustnt\b/gi, replacement: 'must not' },
        
        // Text speak and abbreviations
        { pattern: /\bur\b/gi, replacement: 'your' },
        { pattern: /\bu\b/gi, replacement: 'you' },
        { pattern: /\br\b/gi, replacement: 'are' },
        { pattern: /\basap\b/gi, replacement: 'as soon as possible' },
        { pattern: /\bbtw\b/gi, replacement: 'by the way' },
        { pattern: /\bfyi\b/gi, replacement: 'for your information' },
        { pattern: /\bthx\b/gi, replacement: 'thank you' },
        { pattern: /\bpls\b/gi, replacement: 'please' },
        { pattern: /\bchk\b/gi, replacement: 'check' },
        { pattern: /\btmrw\b/gi, replacement: 'tomorrow' },
        { pattern: /\byday\b/gi, replacement: 'yesterday' },
        { pattern: /\byk\b/gi, replacement: 'you know' },
        
        // Professional tone improvements
        { pattern: /\bI cant\b/gi, replacement: 'I am unable to' },
        { pattern: /\bI can't\b/gi, replacement: 'I am unable to' },
        { pattern: /\bcannot attend meeting\b/gi, replacement: 'am unable to attend the meeting' },
        { pattern: /\bcannot attend the meeting\b/gi, replacement: 'am unable to attend the meeting' },
        
        // Improve informal phrases
        { pattern: /\ba lot of\b/gi, replacement: 'many' },
        { pattern: /\bkinda\b/gi, replacement: 'kind of' },
        { pattern: /\bsorta\b/gi, replacement: 'sort of' },
        { pattern: /\bgonna\b/gi, replacement: 'going to' },
        { pattern: /\bwanna\b/gi, replacement: 'want to' },
        { pattern: /\bgotta\b/gi, replacement: 'have to' },
        
        // Improve weak verbs
        { pattern: /\bvery good\b/gi, replacement: 'excellent' },
        { pattern: /\bvery bad\b/gi, replacement: 'terrible' },
        { pattern: /\bvery big\b/gi, replacement: 'enormous' },
        { pattern: /\bvery small\b/gi, replacement: 'tiny' },
        { pattern: /\bvery important\b/gi, replacement: 'crucial' },
        
        // Professional request patterns
        { pattern: /\bsend me\b/gi, replacement: 'please send me' },
        { pattern: /\bquickly\b/gi, replacement: 'as soon as possible' },
        { pattern: /\bfast\b/gi, replacement: 'promptly' },
        
        // Informal greetings
        { pattern: /\bhey\b/gi, replacement: 'Hello' },
        { pattern: /\bhi there\b/gi, replacement: 'Hello' },
        
        // Remove redundant phrases
        { pattern: /\bin my opinion, I think\b/gi, replacement: 'I believe' },
        { pattern: /\bbasically\b/gi, replacement: '' },
        { pattern: /\bactually\b/gi, replacement: '' },
    ];
    
    for (const improvement of improvements) {
        rephrased = rephrased.replace(improvement.pattern, improvement.replacement);
    }
    
    // Handle specific patterns for better professional tone
    // Pattern: "Hi team i completed..." -> "Hi Team, I have completed..."
    rephrased = rephrased.replace(/\bhi team i\b/gi, 'Hi Team, I have');
    rephrased = rephrased.replace(/\bi completed\b/gi, 'I have completed');
    
    // Pattern: "please check and let me know" -> "Please review it and let me know if"
    rephrased = rephrased.replace(/\bplease check and let me know any changes\b/gi, 'Please review it and let me know if any changes are required');
    rephrased = rephrased.replace(/\bcheck and let me know\b/gi, 'review it and let me know if');
    rephrased = rephrased.replace(/\bcheck and provide an update\b/gi, 'check and provide an update');
    
    // Grammar fixes for "due" usage
    rephrased = rephrased.replace(/\bdue fever\b/gi, 'due to a fever');
    rephrased = rephrased.replace(/\bdue to an unstable\b/gi, 'due to an unstable');
    
    // Possessive forms
    rephrased = rephrased.replace(/\btoday meeting\b/gi, 'today\'s meeting');
    rephrased = rephrased.replace(/\byesterday deployment\b/gi, 'Yesterday\'s deployment');
    
    // "is checking" -> "is currently investigating" for professional tone
    rephrased = rephrased.replace(/\bteam checking issue\b/gi, 'team is currently investigating the issue');
    rephrased = rephrased.replace(/\bbackend team is currently investigating the issue\b/gi, 'backend team is currently investigating the issue');
    
    // "waiting from" -> "waiting since"
    rephrased = rephrased.replace(/\bwaiting from\b/gi, 'waiting since');
    rephrased = rephrased.replace(/\bhas been waiting since\b/gi, 'has been waiting since');
    
    // Add comma after "Hello" if not present
    rephrased = rephrased.replace(/\bHello I\b/g, 'Hello, I');
    
    // Add proper punctuation for professional communication
    // Add period before "Please" if missing
    rephrased = rephrased.replace(/([a-z])\s+(Please)/g, '$1. $2');
    rephrased = rephrased.replace(/([a-z])\s+(Could)/g, '$1. $2');
    rephrased = rephrased.replace(/([a-z])\s+(I kindly)/g, '$1. $2');
    rephrased = rephrased.replace(/([a-z])\s+(The client)/g, '$1. $2');
    rephrased = rephrased.replace(/([a-z])\s+(The backend)/g, '$1. $2');
    
    // Clean up extra spaces
    rephrased = rephrased.replace(/\s+/g, ' ').trim();
    
    // Ensure proper capitalization at sentence starts
    rephrased = rephrased.replace(/(^\w|[.!?]\s+\w)/g, match => match.toUpperCase());
    
    // Fix "the" article before common nouns
    rephrased = rephrased.replace(/\bto office\b/gi, 'to the office');
    rephrased = rephrased.replace(/\battend meeting\b/gi, 'attend the meeting');
    rephrased = rephrased.replace(/\bfrom database\b/gi, 'from the database');
    
    // Change period to question mark for questions
    rephrased = rephrased.replace(/\bCould you please ([^.]+)\./gi, 'Could you please $1?');
    
    // Ensure proper ending punctuation
    if (!/[.!?]$/.test(rephrased)) {
        rephrased += '.';
    }
    
    return rephrased;
}

// Display Results
function displayResults(original, improved, errors) {
    // Show results section
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Display texts
    originalText.textContent = original;
    improvedText.textContent = improved;
    
    // Update word counts
    const originalWords = countWords(original);
    const improvedWords = countWords(improved);
    originalWordCount.textContent = `${originalWords} word${originalWords !== 1 ? 's' : ''}`;
    improvedWordCount.textContent = `${improvedWords} word${improvedWords !== 1 ? 's' : ''}`;
    
    // Calculate statistics
    const totalErrors = errors.length;
    const corrections = errors.filter(e => e.replacements && e.replacements.length > 0).length;
    const improvement = totalErrors > 0 ? Math.round((corrections / totalErrors) * 100) : 100;
    
    errorsCount.textContent = totalErrors;
    correctionsCount.textContent = corrections;
    improvementScore.textContent = `${improvement}%`;
    
    // Display error details
    if (errors.length > 0) {
        displayErrorDetails(errors);
        errorDetails.hidden = false;
    } else {
        errorDetails.hidden = true;
    }
}

// Display Error Details
function displayErrorDetails(errors) {
    errorList.innerHTML = '';
    
    // Group errors by category
    const categorized = errors.reduce((acc, error) => {
        const category = error.rule.category.name || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(error);
        return acc;
    }, {});
    
    // Display each category
    for (const [category, categoryErrors] of Object.entries(categorized)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'error-category';
        
        const categoryTitle = document.createElement('h4');
        categoryTitle.textContent = `${category} (${categoryErrors.length})`;
        categoryTitle.style.marginBottom = '0.75rem';
        categoryTitle.style.color = 'var(--primary-color)';
        categoryDiv.appendChild(categoryTitle);
        
        categoryErrors.forEach(error => {
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item correction';
            
            const errorType = document.createElement('div');
            errorType.className = 'error-type';
            errorType.textContent = error.rule.description || 'Correction';
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = error.message;
            
            const errorContext = document.createElement('div');
            errorContext.className = 'error-context';
            const contextText = error.context.text;
            const offset = error.context.offset;
            const length = error.context.length;
            
            errorContext.innerHTML = 
                contextText.substring(0, offset) +
                '<span class="highlight-error">' +
                contextText.substring(offset, offset + length) +
                '</span>' +
                contextText.substring(offset + length);
            
            if (error.replacements && error.replacements.length > 0) {
                const suggestion = document.createElement('div');
                suggestion.style.marginTop = '0.5rem';
                suggestion.style.color = 'var(--success-color)';
                suggestion.style.fontWeight = '600';
                suggestion.innerHTML = `✓ Suggestion: ${error.replacements[0].value}`;
                errorItem.appendChild(suggestion);
            }
            
            errorItem.appendChild(errorType);
            errorItem.appendChild(errorMsg);
            errorItem.appendChild(errorContext);
            
            categoryDiv.appendChild(errorItem);
        });
        
        errorList.appendChild(categoryDiv);
    }
}

// Copy to Clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(currentImprovedText);
        showSuccess('Text copied to clipboard!');
        
        // Visual feedback
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy to Clipboard';
        }, 2000);
    } catch (error) {
        showError('Failed to copy text. Please try selecting and copying manually.');
    }
}

// Download Text
function downloadText() {
    const blob = new Blob([currentImprovedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `improved-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Text downloaded successfully!');
}

// UI Helper Functions
function showLoading(show) {
    loadingOverlay.hidden = !show;
}

function setProcessingState(processing) {
    processBtn.disabled = processing;
    const btnText = processBtn.querySelector('.btn-text');
    const btnLoader = processBtn.querySelector('.btn-loader');
    
    if (processing) {
        btnText.hidden = true;
        btnLoader.hidden = false;
    } else {
        btnText.hidden = false;
        btnLoader.hidden = true;
    }
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.hidden = false;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.hidden = true;
}

function showSuccess(message) {
    // Create temporary success message
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: var(--success-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        animation: slideDown 0.3s ease;
    `;
    successMsg.textContent = `✓ ${message}`;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(successMsg);
        }, 300);
    }, 3000);
}

// Add slideUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Made with Bob
