// ============================================
// NyayBot — Chat Logic (chat.js)
// Handles Groq API calls, streaming responses,
// message rendering, and conversation storage
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initChat();
});

// ── State ──
let conversationHistory = [];
let isStreaming = false;

function initChat() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const generateFirBtn = document.getElementById('generateFirBtn');

    if (!chatInput || !sendBtn) return;

    // Load previous conversation if exists
    loadConversation();

    // ── Send message on button click ──
    sendBtn.addEventListener('click', () => {
        sendMessage();
    });

    // ── Send message on Enter (Shift+Enter for new line) ──
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // ── Auto-resize textarea ──
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    // ── Suggestion chips ──
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.dataset.suggestion;
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
            sendMessage();
        });
    });
}

// ── Send a message ──
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message || isStreaming) return;

    // Hide welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }

    // Add user message to UI
    addMessageToUI('user', message);

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Show typing indicator
    showTypingIndicator(true);

    // Show Generate FIR button after first message
    const generateFirBtn = document.getElementById('generateFirBtn');
    if (generateFirBtn) {
        generateFirBtn.classList.add('visible');
    }

    // Call Groq API with streaming
    try {
        await callGroqAPI(message);
    } catch (error) {
        console.error('API Error:', error);
        showTypingIndicator(false);
        addMessageToUI('bot', '❌ Sorry, I encountered an error. Please check your internet connection and try again.\n\nError: ' + error.message);
    }

    // Save conversation
    saveConversation();
}

// ── Call Groq API with streaming ──
async function callGroqAPI(userMessage) {
    isStreaming = true;
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    // Build messages array with system prompt and history
    const messages = [
        {
            role: 'system',
            content: NYAYBOT_CONFIG.SYSTEM_PROMPT
        },
        ...conversationHistory
    ];

    try {
        const response = await fetch(NYAYBOT_CONFIG.CHAT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: NYAYBOT_CONFIG.MODEL,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048,
                stream: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API returned status ${response.status}`);
        }

        // Hide typing indicator and create bot message bubble
        showTypingIndicator(false);
        const botBubble = createEmptyBotMessage();
        let fullResponse = '';

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            fullResponse += content;
                            // Render markdown-like formatting
                            botBubble.querySelector('.message-text').innerHTML = formatBotResponse(fullResponse);
                            scrollToBottom();
                        }
                    } catch (e) {
                        // Skip malformed JSON chunks
                    }
                }
            }
        }

        // Add bot response to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: fullResponse
        });

    } finally {
        isStreaming = false;
        sendBtn.disabled = false;
        document.getElementById('chatInput').focus();
    }
}

// ── Add a message to the chat UI ──
function addMessageToUI(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = role === 'user' ? '👤' : '⚖️';
    const time = formatTime(new Date());

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div>
            <div class="message-bubble">
                <div class="message-text">${role === 'bot' ? formatBotResponse(content) : escapeHTML(content)}</div>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;

    // Insert before typing indicator
    chatMessages.insertBefore(messageDiv, typingIndicator);
    scrollToBottom();
}

// ── Create an empty bot message bubble (for streaming) ──
function createEmptyBotMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';

    const time = formatTime(new Date());

    messageDiv.innerHTML = `
        <div class="message-avatar">⚖️</div>
        <div>
            <div class="message-bubble">
                <div class="message-text"></div>
            </div>
            <div class="message-time">${time}</div>
        </div>
    `;

    chatMessages.insertBefore(messageDiv, typingIndicator);
    return messageDiv;
}

// ── Format bot response (basic markdown → HTML) ──
function formatBotResponse(text) {
    let html = escapeHTML(text);

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Headers: ### text
    html = html.replace(/^### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gm, '<h3>$1</h3>');

    // Bullet points: - text or * text
    html = html.replace(/^[-*] (.*$)/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Numbered lists: 1. text
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

    // Code: `text`
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    // Clean up excessive <br> after block elements
    html = html.replace(/<\/(h3|h4|ul|ol)><br>/g, '</$1>');
    html = html.replace(/<br><(h3|h4|ul|ol)/g, '<$1');

    return html;
}

// ── Escape HTML to prevent XSS ──
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── Show/hide typing indicator ──
function showTypingIndicator(show) {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.classList.toggle('active', show);
    }
    if (show) scrollToBottom();
}

// ── Auto-scroll to bottom of chat ──
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// ── Save conversation to sessionStorage ──
function saveConversation() {
    try {
        sessionStorage.setItem('nyaybot_conversation', JSON.stringify(conversationHistory));
    } catch (e) {
        console.warn('Could not save conversation to sessionStorage:', e);
    }
}

// ── Load conversation from sessionStorage ──
function loadConversation() {
    try {
        const saved = sessionStorage.getItem('nyaybot_conversation');
        if (saved) {
            conversationHistory = JSON.parse(saved);
            if (conversationHistory.length > 0) {
                // Hide welcome message
                const welcomeMessage = document.getElementById('welcomeMessage');
                if (welcomeMessage) welcomeMessage.style.display = 'none';

                // Show generate FIR button
                const generateFirBtn = document.getElementById('generateFirBtn');
                if (generateFirBtn) generateFirBtn.classList.add('visible');

                // Render previous messages
                conversationHistory.forEach(msg => {
                    addMessageToUI(msg.role === 'assistant' ? 'bot' : 'user', msg.content);
                });
            }
        }
    } catch (e) {
        console.warn('Could not load conversation from sessionStorage:', e);
    }
}

// ── Format time helper ──
function formatTime(date) {
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}
