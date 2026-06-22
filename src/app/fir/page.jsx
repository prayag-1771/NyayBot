"use client";

import { useState } from "react";
import Link from "next/link";

const MODEL = "llama-3.3-70b-versatile";

const FIR_EXTRACT_PROMPT = `You are NyayBot's FIR drafting assistant. Based on the conversation provided, extract the following information and return it as a valid JSON object. If any field is not mentioned in the conversation, use an empty string "".

Return ONLY a valid JSON object with these exact keys:
{
    "complainantName": "",
    "complainantAddress": "",
    "complainantPhone": "",
    "incidentDate": "",
    "incidentTime": "",
    "incidentPlace": "",
    "incidentDescription": "",
    "accusedName": "",
    "accusedDescription": "",
    "sections": "",
    "witnesses": "",
    "evidenceDetails": "",
    "propertyLoss": ""
}

Fill in whatever details you can extract from the conversation. For "sections", list the applicable IPC/BNS sections. For "incidentDescription", write a clear, factual narrative suitable for an FIR. Do NOT include any text outside the JSON object.`;

export default function FIRPage() {
    const [formData, setFormData] = useState({
        complainantName: "",
        complainantAddress: "",
        complainantPhone: "",
        incidentDate: "",
        incidentTime: "",
        incidentPlace: "",
        incidentDescription: "",
        accusedName: "",
        accusedDescription: "",
        sections: "",
        witnesses: "",
        evidenceDetails: "",
        propertyLoss: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    function updateField(key, value) {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }

    // ── AI Auto-Fill from chat conversation ──
    async function autoFillFromChat() {
        let conversation;
        try {
            const saved = sessionStorage.getItem("nyaybot_conversation");
            conversation = saved ? JSON.parse(saved) : null;
        } catch (e) {
            conversation = null;
        }

        if (!conversation || conversation.length === 0) {
            alert("No conversation found. Please chat with NyayBot first to describe your legal issue, then come back here to generate the FIR.");
            return;
        }

        setLoading(true);
        setLoadingText("AI is analyzing your conversation and filling the FIR form...");

        try {
            const conversationText = conversation.map((msg) => `${msg.role === "user" ? "User" : "NyayBot"}: ${msg.content}`).join("\n\n");

            const response = await fetch("/api/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: "system", content: FIR_EXTRACT_PROMPT },
                        { role: "user", content: `Here is the conversation between the user and NyayBot:\n\n${conversationText}\n\nPlease extract the FIR details from this conversation and return a JSON object.` },
                    ],
                    temperature: 0.3,
                    max_tokens: 1500,
                    stream: false,
                }),
            });

            if (!response.ok) throw new Error(`API returned status ${response.status}`);

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "";

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const firData = JSON.parse(jsonMatch[0]);
                setFormData((prev) => {
                    const updated = { ...prev };
                    for (const key of Object.keys(updated)) {
                        if (firData[key]) updated[key] = firData[key];
                    }
                    return updated;
                });
            } else {
                throw new Error("Could not parse FIR data from AI response");
            }
        } catch (error) {
            console.error("Auto-fill error:", error);
            alert("Could not auto-fill the form. You can fill in the details manually. Error: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    // ── Download FIR as PDF ──
    async function downloadPDF() {
        if ((formData.incidentDescription || "").trim().length < 20) {
            alert("Please provide a detailed description of the incident (at least 20 characters) before generating the PDF.");
            return;
        }

        setLoading(true);
        setLoadingText("Generating your FIR PDF...");

        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF("p", "mm", "a4");
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - 2 * margin;
            let y = 20;

            function addLine(yPos) {
                doc.setDrawColor(180, 180, 180);
                doc.setLineWidth(0.3);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                return yPos + 5;
            }

            function checkPageBreak(neededSpace) {
                if (y + neededSpace > 270) { doc.addPage(); y = 20; }
            }

            function addSectionTitle(title) {
                checkPageBreak(15);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(30, 30, 30);
                doc.text(title, margin, y);
                y += 7;
            }

            function addField(label, value) {
                checkPageBreak(20);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(label, margin, y);
                y += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(30, 30, 30);
                const lines = doc.splitTextToSize(value || "Not Provided", contentWidth);
                doc.text(lines, margin, y);
                y += lines.length * 5 + 4;
            }

            // Header
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(20, 20, 20);
            doc.text("GOVERNMENT OF INDIA", pageWidth / 2, y, { align: "center" });
            y += 7;
            doc.setFontSize(16);
            doc.text("FIRST INFORMATION REPORT (FIR)", pageWidth / 2, y, { align: "center" });
            y += 7;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text("(Under Section 154 Cr.P.C. / Section 173 BNSS)", pageWidth / 2, y, { align: "center" });
            y += 5;
            y = addLine(y);

            // Reference
            const now = new Date();
            const firRef = `DRAFT/NYAYBOT/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
            doc.text(`Draft Reference: ${firRef}`, margin, y);
            doc.text(`Generated: ${now.toLocaleDateString("en-IN")} at ${now.toLocaleTimeString("en-IN")}`, pageWidth - margin, y, { align: "right" });
            y += 8;

            // Sections
            addSectionTitle("1. COMPLAINANT DETAILS");
            addField("Name:", formData.complainantName);
            addField("Address:", formData.complainantAddress);
            addField("Phone:", formData.complainantPhone);
            y = addLine(y);

            addSectionTitle("2. INCIDENT DETAILS");
            checkPageBreak(12);
            doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
            doc.text("Date of Incident:", margin, y);
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(30, 30, 30);
            doc.text(formData.incidentDate || "Not Provided", margin + 35, y);
            doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
            doc.text("Time:", pageWidth / 2, y);
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(30, 30, 30);
            doc.text(formData.incidentTime || "Not Provided", pageWidth / 2 + 15, y);
            y += 8;
            addField("Place of Incident:", formData.incidentPlace);
            addField("Detailed Description:", formData.incidentDescription);
            y = addLine(y);

            addSectionTitle("3. ACCUSED DETAILS");
            addField("Name of Accused:", formData.accusedName);
            addField("Description:", formData.accusedDescription);
            y = addLine(y);

            addSectionTitle("4. APPLICABLE LEGAL SECTIONS");
            addField("IPC / BNS Sections:", formData.sections);
            y = addLine(y);

            addSectionTitle("5. SUPPORTING INFORMATION");
            addField("Witnesses:", formData.witnesses);
            addField("Evidence:", formData.evidenceDetails);
            addField("Property Loss / Stolen Items:", formData.propertyLoss);
            y = addLine(y);

            // Signatures
            checkPageBreak(40);
            y += 10;
            doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
            doc.text("_________________________", margin, y);
            doc.text("Signature of Complainant", margin, y + 6);
            doc.text(`(${formData.complainantName || "Name"})`, margin, y + 11);
            doc.text("_________________________", pageWidth - margin - 50, y);
            doc.text("Signature of Officer", pageWidth - margin - 50, y + 6);
            doc.text("(Station House Officer)", pageWidth - margin - 50, y + 11);
            y += 25;

            // Footer
            checkPageBreak(20);
            y = addLine(y);
            y += 3;
            doc.setFont("helvetica", "italic"); doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
            doc.text("DISCLAIMER: This is an AI-generated FIR draft created by NyayBot for reference purposes only.", pageWidth / 2, y, { align: "center" });
            doc.text("The actual FIR must be filed at a police station under the supervision of an authorized police officer.", pageWidth / 2, y + 4, { align: "center" });
            doc.text("NyayBot is not a substitute for professional legal counsel. Generated under SDG 16 — Peace, Justice & Strong Institutions.", pageWidth / 2, y + 8, { align: "center" });

            doc.save("FIR_Draft_NyayBot.pdf");
        } catch (error) {
            console.error("PDF Error:", error);
            alert("Error generating PDF: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-border-glass rounded-sm text-text-primary font-[family-name:var(--font-inter)] text-[0.95rem] outline-none transition-colors focus:border-accent-gold";

    return (
        <div className="pt-[90px] min-h-screen relative z-[1]">
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-[rgba(10,15,30,0.8)] z-[2000] flex items-center justify-center flex-col gap-4 backdrop-blur-[5px]">
                    <div className="w-[50px] h-[50px] border-[3px] border-border-glass border-t-accent-gold rounded-full animate-spin-slow" />
                    <p className="text-text-secondary">{loadingText}</p>
                </div>
            )}

            <div className="max-w-[800px] mx-auto px-6 pb-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold mb-2">📝 FIR Draft Generator</h1>
                    <p className="text-text-secondary">Review the AI-filled details below, make any corrections, and download your FIR as a PDF.</p>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-6">
                    {/* Complainant Details */}
                    <div className="bg-bg-glass border border-border-glass rounded-lg p-6 backdrop-blur-[20px]">
                        <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold mb-4 text-accent-gold flex items-center gap-2">👤 Complainant Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                                <input type="text" value={formData.complainantName} onChange={(e) => updateField("complainantName", e.target.value)} placeholder="Enter your full name" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Address</label>
                                <textarea rows={2} value={formData.complainantAddress} onChange={(e) => updateField("complainantAddress", e.target.value)} placeholder="Enter your full address" className={`${inputClass} resize-y`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                                <input type="tel" value={formData.complainantPhone} onChange={(e) => updateField("complainantPhone", e.target.value)} placeholder="Enter your phone number" className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Incident Details */}
                    <div className="bg-bg-glass border border-border-glass rounded-lg p-6 backdrop-blur-[20px]">
                        <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold mb-4 text-accent-gold flex items-center gap-2">📋 Incident Details</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Date of Incident</label>
                                    <input type="date" value={formData.incidentDate} onChange={(e) => updateField("incidentDate", e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Time of Incident</label>
                                    <input type="time" value={formData.incidentTime} onChange={(e) => updateField("incidentTime", e.target.value)} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Place of Incident</label>
                                <input type="text" value={formData.incidentPlace} onChange={(e) => updateField("incidentPlace", e.target.value)} placeholder="Enter the location where the incident occurred" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Detailed Description of the Incident</label>
                                <textarea rows={6} value={formData.incidentDescription} onChange={(e) => updateField("incidentDescription", e.target.value)} placeholder="Describe what happened in detail..." className={`${inputClass} resize-y min-h-[100px]`} />
                            </div>
                        </div>
                    </div>

                    {/* Accused Details */}
                    <div className="bg-bg-glass border border-border-glass rounded-lg p-6 backdrop-blur-[20px]">
                        <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold mb-4 text-accent-gold flex items-center gap-2">🔍 Accused Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Name of Accused (if known)</label>
                                <input type="text" value={formData.accusedName} onChange={(e) => updateField("accusedName", e.target.value)} placeholder="Enter accused person's name" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Description of Accused</label>
                                <textarea rows={3} value={formData.accusedDescription} onChange={(e) => updateField("accusedDescription", e.target.value)} placeholder="Physical description, relationship, or any identifying details" className={`${inputClass} resize-y`} />
                            </div>
                        </div>
                    </div>

                    {/* Legal Sections */}
                    <div className="bg-bg-glass border border-border-glass rounded-lg p-6 backdrop-blur-[20px]">
                        <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold mb-4 text-accent-gold flex items-center gap-2">⚖️ Applicable Legal Sections</h3>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">IPC / BNS Sections</label>
                            <textarea rows={3} value={formData.sections} onChange={(e) => updateField("sections", e.target.value)} placeholder="e.g., IPC Section 420 (Cheating), BNS Section 318" className={`${inputClass} resize-y`} />
                        </div>
                    </div>

                    {/* Supporting Information */}
                    <div className="bg-bg-glass border border-border-glass rounded-lg p-6 backdrop-blur-[20px]">
                        <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold mb-4 text-accent-gold flex items-center gap-2">📎 Supporting Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Witnesses (if any)</label>
                                <textarea rows={2} value={formData.witnesses} onChange={(e) => updateField("witnesses", e.target.value)} placeholder="Names and contact details of any witnesses" className={`${inputClass} resize-y`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Evidence Details</label>
                                <textarea rows={2} value={formData.evidenceDetails} onChange={(e) => updateField("evidenceDetails", e.target.value)} placeholder="Description of any evidence (photos, documents, recordings, etc.)" className={`${inputClass} resize-y`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Property Stolen / Loss Details (if applicable)</label>
                                <textarea rows={2} value={formData.propertyLoss} onChange={(e) => updateField("propertyLoss", e.target.value)} placeholder="Description and estimated value of any stolen property or financial loss" className={`${inputClass} resize-y`} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center flex-wrap mt-4">
                        <button
                            onClick={autoFillFromChat}
                            className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-teal to-accent-teal-light text-bg-primary rounded-sm font-semibold shadow-[0_0_30px_rgba(0,212,170,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,212,170,0.4)] cursor-pointer border-none text-base"
                        >
                            🤖 AI Auto-Fill from Chat
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-gold-light text-bg-primary rounded-sm font-semibold text-lg shadow-[0_0_30px_rgba(245,166,35,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(245,166,35,0.4)] cursor-pointer border-none"
                        >
                            📄 Download FIR as PDF
                        </button>
                        <Link
                            href="/chat"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-bg-glass text-text-primary border border-border-glass rounded-sm font-semibold backdrop-blur-[10px] transition-all duration-300 hover:bg-bg-glass-hover hover:border-accent-gold hover:-translate-y-0.5 no-underline"
                        >
                            💬 Back to Chat
                        </Link>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-center text-[0.75rem] text-text-muted mt-6">
                    ⚠️ This is an AI-generated FIR draft for reference purposes. The actual FIR must be filed at a police station
                    under the supervision of an authorized officer. NyayBot is not a substitute for professional legal counsel.
                </p>
            </div>
        </div>
    );
}
