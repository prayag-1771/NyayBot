// ============================================
// NyayBot — FIR Generator Logic (fir.js)
// Handles AI auto-fill from chat conversation
// and PDF generation using jsPDF
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initFIRPage();
});

function initFIRPage() {
    // Try auto-fill on page load if conversation exists
    const conversation = getConversation();
    if (conversation && conversation.length > 0) {
        autoFillFromChat();
    }
}

// ── Get conversation from sessionStorage ──
function getConversation() {
    try {
        const saved = sessionStorage.getItem('nyaybot_conversation');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.warn('Could not load conversation:', e);
        return null;
    }
}

// ── AI Auto-Fill: Extract FIR data from chat conversation ──
async function autoFillFromChat() {
    const conversation = getConversation();

    if (!conversation || conversation.length === 0) {
        alert('No conversation found. Please chat with NyayBot first to describe your legal issue, then come back here to generate the FIR.');
        return;
    }

    // Show loading overlay
    showLoading(true, 'AI is analyzing your conversation and filling the FIR form...');

    try {
        // Build conversation summary for the AI
        const conversationText = conversation
            .map(msg => `${msg.role === 'user' ? 'User' : 'NyayBot'}: ${msg.content}`)
            .join('\n\n');

        const messages = [
            {
                role: 'system',
                content: NYAYBOT_CONFIG.FIR_EXTRACT_PROMPT
            },
            {
                role: 'user',
                content: `Here is the conversation between the user and NyayBot:\n\n${conversationText}\n\nPlease extract the FIR details from this conversation and return a JSON object.`
            }
        ];

        const response = await fetch(NYAYBOT_CONFIG.EXTRACT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: NYAYBOT_CONFIG.MODEL,
                messages: messages,
                temperature: 0.3,
                max_tokens: 1500,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const firData = JSON.parse(jsonMatch[0]);
            fillForm(firData);
        } else {
            throw new Error('Could not parse FIR data from AI response');
        }

    } catch (error) {
        console.error('Auto-fill error:', error);
        alert('Could not auto-fill the form. You can fill in the details manually. Error: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ── Fill the form with extracted data ──
function fillForm(data) {
    const fields = {
        'complainantName': data.complainantName,
        'complainantAddress': data.complainantAddress,
        'complainantPhone': data.complainantPhone,
        'incidentPlace': data.incidentPlace,
        'incidentDescription': data.incidentDescription,
        'accusedName': data.accusedName,
        'accusedDescription': data.accusedDescription,
        'sections': data.sections,
        'witnesses': data.witnesses,
        'evidenceDetails': data.evidenceDetails,
        'propertyLoss': data.propertyLoss
    };

    // Fill text fields
    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el && value) {
            el.value = value;
            // Trigger animation
            el.style.borderColor = 'var(--accent-teal)';
            setTimeout(() => {
                el.style.borderColor = '';
            }, 2000);
        }
    }

    // Handle date and time separately
    if (data.incidentDate) {
        const dateEl = document.getElementById('incidentDate');
        // Try to parse various date formats
        try {
            const parsed = new Date(data.incidentDate);
            if (!isNaN(parsed.getTime())) {
                dateEl.value = parsed.toISOString().split('T')[0];
            }
        } catch (e) {
            // Leave empty if can't parse
        }
    }

    if (data.incidentTime) {
        const timeEl = document.getElementById('incidentTime');
        if (timeEl) timeEl.value = data.incidentTime;
    }
}

// ── Download FIR as PDF using jsPDF ──
function downloadFIRasPDF() {
    // Gather form data
    const formData = {
        complainantName: document.getElementById('complainantName').value || 'Not Provided',
        complainantAddress: document.getElementById('complainantAddress').value || 'Not Provided',
        complainantPhone: document.getElementById('complainantPhone').value || 'Not Provided',
        incidentDate: document.getElementById('incidentDate').value || 'Not Provided',
        incidentTime: document.getElementById('incidentTime').value || 'Not Provided',
        incidentPlace: document.getElementById('incidentPlace').value || 'Not Provided',
        incidentDescription: document.getElementById('incidentDescription').value || 'Not Provided',
        accusedName: document.getElementById('accusedName').value || 'Not Known',
        accusedDescription: document.getElementById('accusedDescription').value || 'Not Provided',
        sections: document.getElementById('sections').value || 'To be determined',
        witnesses: document.getElementById('witnesses').value || 'None mentioned',
        evidenceDetails: document.getElementById('evidenceDetails').value || 'None mentioned',
        propertyLoss: document.getElementById('propertyLoss').value || 'Not applicable'
    };

    // Validate at least description is provided
    if (formData.incidentDescription === 'Not Provided' || formData.incidentDescription.trim().length < 20) {
        alert('Please provide a detailed description of the incident (at least 20 characters) before generating the PDF.');
        document.getElementById('incidentDescription').focus();
        return;
    }

    generatePDF(formData);
}

// ── Generate the PDF document ──
function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let y = 20;

    // ── Helper functions ──
    function addLine(yPos) {
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        return yPos + 5;
    }

    function checkPageBreak(neededSpace) {
        if (y + neededSpace > 270) {
            doc.addPage();
            y = 20;
        }
    }

    function addSectionTitle(title) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text(title, margin, y);
        y += 7;
    }

    function addField(label, value) {
        checkPageBreak(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(label, margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);

        const lines = doc.splitTextToSize(value, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 4;
    }

    // ── Header ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('GOVERNMENT OF INDIA', pageWidth / 2, y, { align: 'center' });
    y += 7;

    doc.setFontSize(16);
    doc.text('FIRST INFORMATION REPORT (FIR)', pageWidth / 2, y, { align: 'center' });
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('(Under Section 154 Cr.P.C. / Section 173 BNSS)', pageWidth / 2, y, { align: 'center' });
    y += 5;

    y = addLine(y);

    // ── FIR Reference ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    const firRef = `DRAFT/NYAYBOT/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    doc.text(`Draft Reference: ${firRef}`, margin, y);
    doc.text(`Generated: ${now.toLocaleDateString('en-IN')} at ${now.toLocaleTimeString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
    y += 8;

    // ── Section 1: Complainant Details ──
    addSectionTitle('1. COMPLAINANT DETAILS');
    addField('Name:', data.complainantName);
    addField('Address:', data.complainantAddress);
    addField('Phone:', data.complainantPhone);

    y = addLine(y);

    // ── Section 2: Incident Details ──
    addSectionTitle('2. INCIDENT DETAILS');

    // Date and Time on same line
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Date of Incident:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(data.incidentDate, margin + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Time:', pageWidth / 2, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(data.incidentTime, pageWidth / 2 + 15, y);
    y += 8;

    addField('Place of Incident:', data.incidentPlace);
    addField('Detailed Description:', data.incidentDescription);

    y = addLine(y);

    // ── Section 3: Accused Details ──
    addSectionTitle('3. ACCUSED DETAILS');
    addField('Name of Accused:', data.accusedName);
    addField('Description:', data.accusedDescription);

    y = addLine(y);

    // ── Section 4: Legal Sections ──
    addSectionTitle('4. APPLICABLE LEGAL SECTIONS');
    addField('IPC / BNS Sections:', data.sections);

    y = addLine(y);

    // ── Section 5: Supporting Information ──
    addSectionTitle('5. SUPPORTING INFORMATION');
    addField('Witnesses:', data.witnesses);
    addField('Evidence:', data.evidenceDetails);
    addField('Property Loss / Stolen Items:', data.propertyLoss);

    y = addLine(y);

    // ── Signature Block ──
    checkPageBreak(40);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    // Left signature
    doc.text('_________________________', margin, y);
    doc.text('Signature of Complainant', margin, y + 6);
    doc.text(`(${data.complainantName})`, margin, y + 11);

    // Right signature
    doc.text('_________________________', pageWidth - margin - 50, y);
    doc.text('Signature of Officer', pageWidth - margin - 50, y + 6);
    doc.text('(Station House Officer)', pageWidth - margin - 50, y + 11);

    y += 25;

    // ── Footer ──
    checkPageBreak(20);
    y = addLine(y);
    y += 3;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    const disclaimer1 = 'DISCLAIMER: This is an AI-generated FIR draft created by NyayBot for reference purposes only.';
    const disclaimer2 = 'The actual FIR must be filed at a police station under the supervision of an authorized police officer.';
    const disclaimer3 = 'NyayBot is not a substitute for professional legal counsel. Generated under SDG 16 — Peace, Justice & Strong Institutions.';
    doc.text(disclaimer1, pageWidth / 2, y, { align: 'center' });
    doc.text(disclaimer2, pageWidth / 2, y + 4, { align: 'center' });
    doc.text(disclaimer3, pageWidth / 2, y + 8, { align: 'center' });

    // ── Save the PDF ──
    doc.save('FIR_Draft_NyayBot.pdf');
}

// ── Show/hide loading overlay ──
function showLoading(show, text) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    if (overlay) {
        overlay.classList.toggle('active', show);
    }
    if (loadingText && text) {
        loadingText.textContent = text;
    }
}
