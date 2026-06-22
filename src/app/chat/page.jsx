"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// ── Config (system prompts live here, API calls go through /api routes) ──
const SYSTEM_PROMPT = `You are NyayBot, an AI legal assistant built for ordinary Indian citizens. Your role is to help people understand their legal rights in simple, clear language.

IMPORTANT RULES:
1. Always respond in the same language the user writes in (English or Hindi).
2. When the user describes a problem, identify the relevant legal sections:
   - Cite applicable IPC (Indian Penal Code) sections AND their equivalent BNS (Bharatiya Nyaya Sanhita) sections where applicable.
   - Explain each section in plain, simple language that a non-lawyer can understand.
3. Suggest practical next steps the user can take (file FIR, approach consumer court, contact legal aid, etc.)
4. Be empathetic and supportive — remember these are real people facing real problems.
5. If the situation is an emergency (threat to life, domestic violence), advise them to call 100 (Police) or 181 (Women Helpline) immediately.
6. Always include a disclaimer: "This is AI-generated legal information, not professional legal advice. For serious matters, please consult a qualified lawyer or visit your nearest Legal Aid Centre."
7. Format your responses clearly with headings, bullet points, and section references.
8. Keep your language simple — avoid legal jargon unless you explain it immediately.`;

const MODEL = "llama-3.3-70b-versatile";

const SUGGESTIONS = [
    { icon: "🏠", label: "Landlord dispute", text: "My landlord is not returning my security deposit despite the lease being over. What can I do?" },
    { icon: "💰", label: "Online fraud", text: "Someone cheated me online by taking money for a product that was never delivered. What are my rights?" },
    { icon: "🏢", label: "Workplace harassment", text: "I am being harassed at my workplace by a colleague. What legal action can I take?" },
    { icon: "⚠️", label: "Threats & safety", text: "My neighbour is threatening me and my family. We are scared for our safety. What should we do?" },
    { icon: "📱", label: "Theft complaint", text: "Someone stole my phone from a public place. How do I file a complaint?" },
];

// ── Helpers ──
function formatTime(date) {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatBotResponse(text) {
    let html = escapeHTML(text);
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/^### (.*$)/gm, "<h4>$1</h4>");
    html = html.replace(/^## (.*$)/gm, "<h3>$1</h3>");
    html = html.replace(/^[-*] (.*$)/gm, "<li>$1</li>");
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
    html = html.replace(/^\d+\. (.*$)/gm, "<li>$1</li>");
    html = html.replace(/`(.*?)`/g, "<code>$1</code>");
    html = html.replace(/\n/g, "<br>");
    html = html.replace(/<\/(h3|h4|ul|ol)><br>/g, "</$1>");
    html = html.replace(/<br><(h3|h4|ul|ol)/g, "<$1");
    return html;
}

export default function ChatPage() {
    const [messages, setMessages] = useState([]); // { role, content, time }
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [conversationHistory, setConversationHistory] = useState([]);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const streamBubbleRef = useRef(null);

    // Load previous conversation on mount
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem("nyaybot_conversation");
            if (saved) {
                const history = JSON.parse(saved);
                if (history.length > 0) {
                    setShowWelcome(false);
                    setConversationHistory(history);
                    const uiMessages = history.map((msg) => ({
                        role: msg.role === "assistant" ? "bot" : "user",
                        content: msg.content,
                        time: formatTime(new Date()),
                    }));
                    setMessages(uiMessages);
                }
            }
        } catch (e) {
            console.warn("Could not load conversation:", e);
        }
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isStreaming]);

    // Save conversation to sessionStorage
    function saveConversation(history) {
        try {
            sessionStorage.setItem("nyaybot_conversation", JSON.stringify(history));
        } catch (e) {
            console.warn("Could not save conversation:", e);
        }
    }

    // ── Send message ──
    async function sendMessage(overrideText) {
        const text = (overrideText || input).trim();
        if (!text || isStreaming) return;

        setShowWelcome(false);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        const time = formatTime(new Date());

        // Add user message
        setMessages((prev) => [...prev, { role: "user", content: text, time }]);

        const newHistory = [...conversationHistory, { role: "user", content: text }];
        setConversationHistory(newHistory);

        // Call API with streaming
        setIsStreaming(true);

        try {
            const apiMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...newHistory];

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: MODEL,
                    messages: apiMessages,
                    temperature: 0.7,
                    max_tokens: 2048,
                    stream: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API returned status ${response.status}`);
            }

            let fullResponse = "";
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Add empty bot message for streaming
            setMessages((prev) => [...prev, { role: "bot", content: "", time: formatTime(new Date()) }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter((line) => line.trim() !== "");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") continue;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                // Update the last bot message
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        ...updated[updated.length - 1],
                                        content: fullResponse,
                                    };
                                    return updated;
                                });
                            }
                        } catch (e) {
                            // Skip malformed chunks
                        }
                    }
                }
            }

            const updatedHistory = [...newHistory, { role: "assistant", content: fullResponse }];
            setConversationHistory(updatedHistory);
            saveConversation(updatedHistory);
        } catch (error) {
            console.error("API Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "❌ Sorry, I encountered an error. Please check your internet connection and try again.\n\nError: " + error.message, time: formatTime(new Date()) },
            ]);
        } finally {
            setIsStreaming(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function handleTextareaInput(e) {
        setInput(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    }

    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-col h-screen pt-[70px]">
            <div className="flex-1 max-w-[900px] w-full mx-auto flex flex-col p-4 overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-bg-glass border border-border-glass rounded-lg mb-3 backdrop-blur-[20px]">
                    <div className="flex items-center gap-3">
                        <div className="w-[42px] h-[42px] bg-gradient-to-r from-accent-gold to-accent-gold-light rounded-full flex items-center justify-center text-xl">
                            ⚖️
                        </div>
                        <div>
                            <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">NyayBot Legal Assistant</h3>
                            <div className="text-[0.8rem] text-accent-teal flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-accent-teal rounded-full animate-pulse-dot" />
                                Online · Ready to help
                            </div>
                        </div>
                    </div>
                    {hasMessages && (
                        <Link
                            href="/fir"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-teal to-accent-teal-light text-bg-primary rounded-sm font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(0,212,170,0.2)] no-underline"
                        >
                            📝 Generate FIR
                        </Link>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 chat-scroll scroll-smooth">
                    {showWelcome && (
                        <div className="text-center py-8 text-text-secondary">
                            <div className="text-5xl mb-4">⚖️</div>
                            <h3 className="font-[family-name:var(--font-outfit)] text-text-primary text-xl mb-2">Welcome to NyayBot</h3>
                            <p className="text-[0.95rem] max-w-[500px] mx-auto leading-relaxed">
                                I'm your AI legal assistant. Describe your problem in simple English or Hindi, and I'll help you understand your legal rights, applicable IPC/BNS sections, and next steps.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mt-6">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s.label}
                                        onClick={() => sendMessage(s.text)}
                                        className="px-3 py-2 bg-bg-glass border border-border-glass rounded-xl text-[0.85rem] text-text-secondary cursor-pointer transition-all duration-200 hover:border-accent-gold hover:text-accent-gold hover:bg-[rgba(245,166,35,0.05)] font-[family-name:var(--font-inter)]"
                                    >
                                        {s.icon} {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-2 max-w-[85%] md:max-w-[85%] max-[480px]:max-w-[92%] animate-message-in ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                            <div
                                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm shrink-0 mt-1 ${
                                    msg.role === "user"
                                        ? "bg-gradient-to-r from-accent-gold to-accent-gold-light"
                                        : "bg-gradient-to-r from-accent-teal to-accent-teal-light"
                                }`}
                            >
                                {msg.role === "user" ? "👤" : "⚖️"}
                            </div>
                            <div>
                                <div
                                    className={`px-4 py-3 rounded-lg text-[0.95rem] leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-[linear-gradient(135deg,rgba(245,166,35,0.15),rgba(245,166,35,0.08))] border border-border-gold rounded-br-sm"
                                            : "bg-bg-glass border border-border-glass rounded-bl-sm"
                                    }`}
                                >
                                    <div
                                        className={msg.role === "bot" ? "bot-message" : ""}
                                        dangerouslySetInnerHTML={{
                                            __html: msg.role === "bot" ? formatBotResponse(msg.content) : escapeHTML(msg.content),
                                        }}
                                    />
                                </div>
                                <div className={`text-[0.7rem] text-text-muted mt-1 ${msg.role === "bot" ? "text-left" : "text-right"}`}>
                                    {msg.time}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isStreaming && messages.length > 0 && messages[messages.length - 1].content === "" && (
                        <div className="self-start flex gap-1 px-4 py-3 bg-bg-glass border border-border-glass rounded-lg rounded-bl-sm">
                            <span className="w-2 h-2 bg-text-muted rounded-full animate-typing-bounce" />
                            <span className="w-2 h-2 bg-text-muted rounded-full animate-typing-bounce [animation-delay:0.2s]" />
                            <span className="w-2 h-2 bg-text-muted rounded-full animate-typing-bounce [animation-delay:0.4s]" />
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="py-3">
                    <div className="flex gap-2 bg-bg-glass border border-border-glass rounded-lg p-2 backdrop-blur-[20px] transition-colors focus-within:border-accent-gold">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleTextareaInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your legal problem here..."
                            rows={1}
                            className="flex-1 bg-transparent border-none text-text-primary font-[family-name:var(--font-inter)] text-[0.95rem] px-3 py-2 resize-none outline-none max-h-[120px] min-h-[44px] leading-normal placeholder:text-text-muted"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={isStreaming || !input.trim()}
                            className="w-11 h-11 bg-gradient-to-r from-accent-gold to-accent-gold-light border-none rounded-md text-bg-primary text-xl cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 self-end hover:scale-105 hover:shadow-[0_0_30px_rgba(245,166,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            ➤
                        </button>
                    </div>
                    <p className="text-center text-[0.75rem] text-text-muted py-2">
                        ⚠️ NyayBot provides AI-generated legal information, not professional legal advice. For serious matters, consult a qualified lawyer.
                    </p>
                </div>
            </div>
        </div>
    );
}
