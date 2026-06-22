# 🎓 NyayBot — Step-by-Step Build Guide (teach.md)

> **This file is GITIGNORED** — it won't be committed to GitHub. It's your personal learning companion that explains every concept used in building NyayBot.

---

## Table of Contents

1. [What is a GenAI Project?](#1-what-is-a-genai-project)
2. [How LLMs Work (Simplified)](#2-how-llms-work-simplified)
3. [What is the Groq API?](#3-what-is-the-groq-api)
4. [Calling Groq from JavaScript (fetch, headers, body)](#4-calling-groq-from-javascript)
5. [Prompt Engineering — The Secret Sauce](#5-prompt-engineering--the-secret-sauce)
6. [Streaming Responses — Real-time AI](#6-streaming-responses--real-time-ai)
7. [PDF Generation with jsPDF](#7-pdf-generation-with-jspdf)
8. [sessionStorage — Passing Data Between Pages](#8-sessionstorage--passing-data-between-pages)
9. [CSS Glassmorphism & Animations](#9-css-glassmorphism--animations)
10. [Project Architecture](#10-project-architecture)
11. [Deploying to Netlify Drop](#11-deploying-to-netlify-drop)
12. [Security Considerations](#12-security-considerations)

---

## 1. What is a GenAI Project?

A **Generative AI (GenAI)** project is any application that uses AI models to **generate new content** — text, images, code, music, etc. — based on user input.

NyayBot is a GenAI project because:
- The user types a problem (input)
- An AI model **generates** a legal explanation (output)
- The AI **generates** a structured FIR draft (output)

The AI doesn't just look things up in a database — it *generates* new, contextual responses every time.

### Types of GenAI Projects:
| Type | Example |
|------|---------|
| **Text Generation** | ChatGPT, NyayBot, writing assistants |
| **Image Generation** | DALL-E, Midjourney, Stable Diffusion |
| **Code Generation** | GitHub Copilot, Cursor |
| **Audio/Music** | Suno AI, ElevenLabs |

NyayBot falls under **Text Generation** — we send text in, we get text out.

---

## 2. How LLMs Work (Simplified)

**LLM = Large Language Model**

Think of an LLM as a super-intelligent autocomplete. It was trained on billions of text documents (books, websites, legal texts, etc.) and learned the patterns of language.

### The Simple Version:
```
You type:  "My landlord is not returning my..."
AI thinks: Based on everything I've ever read, the next likely words are "security deposit"
AI knows:  In Indian law, this relates to IPC Section 403, 406, and the Rent Control Act
AI generates: A complete explanation with legal sections
```

### Key Concepts:
- **Training**: The model read billions of documents and learned language patterns
- **Tokens**: Text is broken into small pieces called tokens. "Hello world" = ["Hello", " world"]
- **Context Window**: How much text the model can "remember" in one conversation (llama-3.3-70b has ~128K tokens)
- **Temperature**: Controls randomness. Low (0.3) = focused/factual. High (0.9) = creative/varied
- **Inference**: When the model generates a response based on your input

### Why Groq + LLaMA?
- **LLaMA 3.3 70B** is Meta's open-source model with 70 billion parameters (connections)
- **Groq** runs it on special hardware (LPU) making it extremely fast — responses in milliseconds
- It's free for development use with generous rate limits

---

## 3. What is the Groq API?

An **API (Application Programming Interface)** is like a waiter at a restaurant:
- You (the customer) don't go into the kitchen
- You tell the waiter (API) what you want
- The waiter brings back your food (response)

**Groq's API** lets you send text to their AI servers and get back AI-generated responses.

### The API Endpoint:
```
https://api.groq.com/openai/v1/chat/completions
```

This URL is where we send our requests. It follows the **OpenAI format** (an industry standard), which means if you learn this, you can use the same code with OpenAI, Anthropic, and others.

### Authentication:
Every API call needs an **API key** — a secret password that identifies you:
```
Authorization: Bearer gsk_xxxxxxxxxxxxxxxxxxxxx
```

The key starts with `gsk_` (Groq Secret Key). **Never share this publicly** or commit it to GitHub.

### The Request Format:
```json
{
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": "You are a legal assistant..."},
        {"role": "user", "content": "Someone stole my phone"}
    ],
    "temperature": 0.7,
    "max_tokens": 2048,
    "stream": true
}
```

| Field | What it does |
|-------|-------------|
| `model` | Which AI model to use |
| `messages` | The conversation so far (system + user + assistant messages) |
| `temperature` | Randomness (0 = predictable, 1 = creative) |
| `max_tokens` | Maximum length of the response |
| `stream` | If true, response comes word-by-word (real-time effect) |

---

## 4. Calling Groq from JavaScript

Here's how we actually call the API from the browser using the `fetch` API:

```javascript
// This is the core of NyayBot's intelligence
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',                          // We're SENDING data
    headers: {
        'Content-Type': 'application/json',  // We're sending JSON
        'Authorization': `Bearer ${API_KEY}` // Our secret key
    },
    body: JSON.stringify({                   // The actual request
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: 'You are a legal assistant...' },
            { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true
    })
});
```

### Breaking it down:

1. **`fetch(url, options)`** — The modern way to make HTTP requests in JavaScript
2. **`method: 'POST'`** — We're sending data TO the server (GET = asking for data, POST = sending data)
3. **`headers`** — Metadata about our request (like the envelope of a letter)
4. **`body: JSON.stringify(...)`** — The actual data we're sending, converted to a JSON string
5. **`await`** — Wait for the server to respond before continuing (this is an async operation)

### Understanding async/await:
```javascript
// Without async/await (old way — callbacks & promises)
fetch(url, options)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// With async/await (modern way — reads like normal code)
try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
} catch (error) {
    console.error(error);
}
```

`async/await` makes asynchronous code look synchronous — much easier to read and debug.

---

## 5. Prompt Engineering — The Secret Sauce

**Prompt engineering** is the art of writing instructions that make the AI behave exactly how you want.

### NyayBot's System Prompt (what makes it a legal assistant):

```
You are NyayBot, an AI legal assistant built for ordinary Indian citizens.

IMPORTANT RULES:
1. Always respond in the same language the user writes in (English or Hindi)
2. Identify relevant IPC and BNS sections
3. Explain each section in plain, simple language
4. Suggest practical next steps
5. Be empathetic and supportive
6. For emergencies, advise calling 100 or 181
7. Always include a legal disclaimer
8. Keep language simple
```

### Why each rule matters:

| Rule | Purpose |
|------|---------|
| Language matching | Indian users may write in Hindi — the AI should respond in kind |
| IPC/BNS sections | This is the core value — mapping problems to legal codes |
| Simple language | Target audience is non-lawyers; avoid jargon |
| Practical steps | Don't just explain law — tell them what to DO |
| Empathy | These are real people with real problems |
| Emergency numbers | Safety first — some situations need immediate help |
| Disclaimer | Legal protection — AI is not a lawyer |

### The FIR Extraction Prompt:

For the FIR generator, we use a different prompt that asks the AI to return **structured JSON**:

```
Extract the following information and return it as a valid JSON object:
{
    "complainantName": "",
    "incidentDescription": "",
    "sections": "",
    ...
}
```

This is called **structured output** — we're constraining the AI to return data in a specific format that our code can parse.

### Prompt Engineering Tips:
1. **Be specific** — "You are a legal assistant" is better than "You help people"
2. **Give examples** — Show the AI what good output looks like
3. **Set boundaries** — Tell it what NOT to do
4. **Use formatting** — Numbered rules are clearer than paragraphs
5. **Temperature matters** — Use low temp (0.3) for factual/structured output, higher (0.7) for creative/conversational

---

## 6. Streaming Responses — Real-time AI

Without streaming, the user waits 5-10 seconds staring at a blank screen. With streaming, they see text appear word-by-word — like watching someone type.

### How streaming works:

```javascript
// 1. Set stream: true in the request
body: JSON.stringify({ ..., stream: true })

// 2. Read the response as a stream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // 3. Decode the binary chunk into text
    const chunk = decoder.decode(value, { stream: true });

    // 4. Parse each line (Server-Sent Events format)
    // Each line looks like: data: {"choices":[{"delta":{"content":"Hello"}}]}
    const lines = chunk.split('\n');
    for (const line of lines) {
        if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove "data: " prefix
            if (data === '[DONE]') continue;

            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
                // 5. Append to the message bubble
                fullResponse += content;
                botBubble.innerHTML = formatResponse(fullResponse);
            }
        }
    }
}
```

### Key concepts:
- **ReadableStream** — A stream of data that arrives in chunks, not all at once
- **getReader()** — Gets a reader object to consume the stream chunk by chunk
- **TextDecoder** — Converts raw binary data (Uint8Array) into text strings
- **Server-Sent Events (SSE)** — The format Groq uses. Each chunk is prefixed with `data: `
- **delta** — Each chunk contains only the *new* content (the "delta" or change)

### The flow:
```
User sends message → API starts generating → 
    chunk 1: "Based" →
    chunk 2: " on" →
    chunk 3: " your" →
    chunk 4: " situation" →
    ... (each chunk updates the UI instantly)
    final chunk: [DONE]
```

---

## 7. PDF Generation with jsPDF

**jsPDF** is a JavaScript library that creates PDF files entirely in the browser — no server needed.

### Loading jsPDF (from CDN):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js"></script>
```

A **CDN (Content Delivery Network)** hosts the library file on fast servers worldwide. We don't need to download it locally.

### Creating a PDF:
```javascript
const { jsPDF } = window.jspdf;

// Create a new PDF document
// 'p' = portrait, 'mm' = millimeters, 'a4' = paper size
const doc = new jsPDF('p', 'mm', 'a4');

// Set font
doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(20, 20, 20); // RGB color

// Add text at position (x, y) in mm from top-left
doc.text('FIRST INFORMATION REPORT', 105, 20, { align: 'center' });

// Draw a line
doc.setDrawColor(180, 180, 180);
doc.line(20, 25, 190, 25); // (x1, y1, x2, y2)

// Add multi-line text with automatic wrapping
const lines = doc.splitTextToSize(longText, 170); // wrap at 170mm
doc.text(lines, 20, 40);

// Save/download the PDF
doc.save('FIR_Draft_NyayBot.pdf');
```

### Important jsPDF methods:
| Method | What it does |
|--------|-------------|
| `new jsPDF('p', 'mm', 'a4')` | Create new PDF (portrait, millimeters, A4 size) |
| `doc.text(text, x, y)` | Add text at coordinates |
| `doc.setFont(family, style)` | Set font (helvetica, times, courier) |
| `doc.setFontSize(size)` | Set font size in points |
| `doc.setTextColor(r, g, b)` | Set text color |
| `doc.line(x1, y1, x2, y2)` | Draw a line |
| `doc.splitTextToSize(text, maxWidth)` | Word-wrap text |
| `doc.addPage()` | Add a new page |
| `doc.save(filename)` | Download the PDF |

### Page breaks:
A4 paper is 210mm × 297mm. We track the current `y` position and add a new page when we're about to overflow:
```javascript
function checkPageBreak(neededSpace) {
    if (y + neededSpace > 270) { // 270mm = near bottom
        doc.addPage();
        y = 20; // Reset to top
    }
}
```

---

## 8. sessionStorage — Passing Data Between Pages

NyayBot has 3 pages. How do we pass the conversation from `chat.html` to `fir.html`?

### sessionStorage vs localStorage:
| Feature | sessionStorage | localStorage |
|---------|---------------|-------------|
| **Lifetime** | Until tab is closed | Forever (until cleared) |
| **Scope** | Same tab only | All tabs on same domain |
| **Use case** | Temporary data (current session) | Persistent data (user preferences) |

We use `sessionStorage` because conversation data is temporary — we don't want old conversations lingering.

### How it works:
```javascript
// SAVE data (in chat.js, after each message)
sessionStorage.setItem('nyaybot_conversation', JSON.stringify(conversationHistory));

// LOAD data (in fir.js, on page load)
const saved = sessionStorage.getItem('nyaybot_conversation');
const conversation = JSON.parse(saved);

// CLEAR data
sessionStorage.removeItem('nyaybot_conversation');
```

### Why JSON.stringify/parse?
sessionStorage can only store **strings**. Our conversation is an **array of objects**:
```javascript
// This is an object — can't be stored directly
const conversation = [
    { role: 'user', content: 'Someone stole my phone' },
    { role: 'assistant', content: 'I understand...' }
];

// JSON.stringify converts it to a string
'[{"role":"user","content":"Someone stole my phone"},...]'

// JSON.parse converts it back to an object
```

---

## 9. CSS Glassmorphism & Animations

### Glassmorphism
Glassmorphism creates a frosted-glass effect. The three ingredients:

```css
.glass-card {
    /* 1. Semi-transparent background */
    background: rgba(255, 255, 255, 0.05);

    /* 2. Blur effect on content behind the element */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px); /* Safari support */

    /* 3. Subtle border to define edges */
    border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### CSS Custom Properties (Variables)
Instead of repeating colors everywhere, we define them once:
```css
:root {
    --accent-gold: #f5a623;
    --bg-primary: #0a0f1e;
}

/* Use anywhere */
.element {
    color: var(--accent-gold);
    background: var(--bg-primary);
}
```

### Animations

**Keyframe animations** define multi-step animations:
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.element {
    animation: fadeInUp 1s ease;
    /* name | duration | timing-function */
}
```

**Scroll-reveal** with IntersectionObserver:
```javascript
// Watch elements as they scroll into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Triggers CSS animation
        }
    });
}, { threshold: 0.15 }); // Trigger when 15% visible

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

### Gradient text:
```css
.gradient-text {
    background: linear-gradient(135deg, #f5a623, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```
This creates a gradient, clips it to the shape of the text, and makes the text itself transparent so the gradient shows through.

---

## 10. Project Architecture

```
NyayBot/
├── index.html      ──→ Homepage (static, no API calls)
├── chat.html       ──→ Chat page (calls Groq API with streaming)
├── fir.html        ──→ FIR page (calls Groq API for extraction + jsPDF)
├── css/
│   └── style.css   ──→ All styles in one file (design system)
├── js/
│   ├── config.js   ──→ API key + system prompts (GITIGNORED)
│   ├── app.js      ──→ Shared utilities (navbar, scroll reveal)
│   ├── chat.js     ──→ Chat-specific logic
│   └── fir.js      ──→ FIR-specific logic
├── .gitignore      ──→ Excludes teach.md and config.js
├── teach.md        ──→ This file (GITIGNORED)
└── README.md       ──→ Public project description
```

### Data Flow:
```
User types problem → chat.js sends to Groq API → AI responds with legal info
         ↓
Conversation saved to sessionStorage
         ↓
User clicks "Generate FIR" → navigates to fir.html
         ↓
fir.js loads conversation from sessionStorage → sends to Groq API
         ↓
AI extracts structured FIR data (JSON) → fills form fields
         ↓
User reviews/edits → clicks "Download PDF" → jsPDF generates PDF
```

---

## 11. Deploying to Netlify Drop

**Netlify Drop** is the simplest way to deploy a static website — literally drag and drop.

### Steps:
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your entire `NyayBot` folder onto the page
3. Done! You get a URL like `https://random-name-123.netlify.app`

### ⚠️ Important for Deployment:
Since `config.js` is gitignored, you need to include it manually when deploying:
- Option A: Include `config.js` in the folder you drag to Netlify (it's only gitignored from Git, Netlify doesn't care)
- Option B: Use Netlify environment variables + a build step (more advanced)

For this project, Option A is fine — just make sure `config.js` is in the `js/` folder when you deploy.

### Custom Domain (Optional):
1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Netlify handles SSL (HTTPS) automatically

---

## 12. Security Considerations

### ⚠️ API Key Exposure
In this project, the API key is in `config.js` which runs in the browser. This means:
- Anyone can open DevTools (F12) → Network tab → see your API key
- Someone could steal it and use it for their own projects
- This is a known limitation of frontend-only apps

### For a production app, you would:
1. Create a backend server (Node.js/Python)
2. Store the API key on the server (environment variable)
3. Frontend calls YOUR server → server calls Groq → returns response
4. This way, the API key never leaves the server

```
Frontend → Your Backend (key hidden) → Groq API
   vs.
Frontend (key exposed) → Groq API directly
```

### For this project:
- It's fine for a school/hackathon project
- Groq has rate limits that prevent abuse
- The `.gitignore` prevents the key from being on GitHub
- Just don't share the key publicly

---

## 🎯 Key Takeaways

1. **GenAI projects** use AI models to generate new content based on user input
2. **LLMs** are trained on vast text data and predict the most likely next tokens
3. **APIs** are the bridge between your frontend and AI models
4. **Prompt engineering** is arguably the most important skill — the same model behaves completely differently with different prompts
5. **Streaming** makes AI feel responsive and human-like
6. **jsPDF** enables PDF generation entirely in the browser
7. **sessionStorage** is perfect for passing temporary data between pages
8. **CSS glassmorphism** creates modern, premium-looking UIs
9. **Always handle errors** — APIs can fail, networks can go down
10. **Security matters** — API keys in the frontend are a known limitation

---

*Built with ❤️ for the people of India. SDG 16 — Peace, Justice & Strong Institutions.*
