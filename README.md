# ⚖️ NyayBot — AI Legal Assistant for India

> *Justice, Simplified. Free AI-powered legal guidance for every Indian citizen.*

![SDG 16](https://img.shields.io/badge/SDG%2016-Peace%2C%20Justice%20%26%20Strong%20Institutions-blue)
![Made with](https://img.shields.io/badge/Made%20with-HTML%20%7C%20CSS%20%7C%20JavaScript-orange)
![AI Powered](https://img.shields.io/badge/AI-Groq%20%7C%20LLaMA%203.3-green)

---

## 🚀 What is NyayBot?

NyayBot is a free, web-based AI legal assistant built for **ordinary Indian citizens** who cannot afford lawyers or don't understand the complex legal system. 

Simply describe your problem in **plain English or Hindi**, and NyayBot will:
- 🧠 **Explain your legal rights** in simple, understandable language
- 📋 **Identify applicable IPC/BNS sections** relevant to your case
- 📝 **Generate a ready-to-submit FIR draft** that you can download as a PDF

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Legal Chat** | Describe your problem in simple language and get instant legal guidance |
| **IPC & BNS Lookup** | Automatically identifies applicable Indian Penal Code and Bharatiya Nyaya Sanhita sections |
| **FIR Generator** | AI auto-fills a formal FIR template from your conversation |
| **PDF Download** | Download your FIR draft as a professionally formatted PDF |
| **Bilingual Support** | Works in both English and Hindi |
| **100% Free** | No sign-up, no payment, no hidden fees |

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla — no frameworks)
- **AI Model**: LLaMA 3.3 70B via [Groq API](https://groq.com)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Hosting**: [Netlify](https://netlify.com)
- **Design**: Glassmorphism, dark theme, responsive layout

---

## 📁 Project Structure

```
NyayBot/
├── index.html          # Homepage
├── chat.html           # AI Chat Interface
├── fir.html            # FIR Generator & PDF Download
├── css/
│   └── style.css       # Global design system
├── js/
│   ├── config.js       # API configuration (gitignored)
│   ├── app.js          # Shared utilities
│   ├── chat.js         # Chat logic & Groq API integration
│   └── fir.js          # FIR form & PDF generation
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A Groq API key ([Get one free](https://console.groq.com))

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NyayBot.git
   cd NyayBot
   ```

2. Create the config file:
   ```bash
   # Create js/config.js with your API key
   ```
   ```javascript
   const NYAYBOT_CONFIG = {
       API_URL: "https://api.groq.com/openai/v1/chat/completions",
       API_KEY: "your_groq_api_key_here",
       MODEL: "llama-3.3-70b-versatile",
       SYSTEM_PROMPT: "..." // See config template
   };
   ```

3. Open `index.html` in your browser (or use Live Server in VS Code)

---

## 🏛️ SDG 16 — Peace, Justice & Strong Institutions

NyayBot directly supports **UN Sustainable Development Goal 16** by making legal aid accessible to people who are normally excluded from the justice system due to:
- 💰 **Cost** — Legal consultations are expensive
- 📖 **Complexity** — Laws are written in difficult language
- 🗣️ **Language barriers** — Many citizens don't understand English legal texts
- 🌍 **Access** — Not everyone lives near a lawyer or legal aid center

---

## 🔮 Future Scope

- 🌐 Multi-language support (Tamil, Bengali, Marathi, etc.)
- 📱 Mobile app version (React Native / Flutter)
- 📄 RTI (Right to Information) request generator
- 🛡️ Consumer complaint generator
- 🤝 Integration with legal aid services
- 🔒 Backend API proxy for enhanced security

---

## ⚠️ Disclaimer

NyayBot provides **AI-generated legal information**, not professional legal advice. The FIR drafts generated are for **reference purposes only**. For serious legal matters, please consult a qualified lawyer or visit your nearest **Legal Aid Centre**.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ for the people of India*
