# ⚖️ NyayBot — AI Legal Assistant for India

> *Justice, Simplified. Free AI-powered legal guidance for every Indian citizen.*

![SDG 16](https://img.shields.io/badge/SDG%2016-Peace%2C%20Justice%20%26%20Strong%20Institutions-blue)
![Built with](https://img.shields.io/badge/Built%20with-Next.js%20%7C%20Tailwind%20CSS-black)
![AI Powered](https://img.shields.io/badge/AI-Groq%20%7C%20LLaMA%203.3-green)
![License](https://img.shields.io/badge/License-MIT-orange)

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
| **AI Legal Chat** | Describe your problem in simple language and get instant legal guidance with streaming responses |
| **IPC & BNS Lookup** | Automatically identifies applicable Indian Penal Code and Bharatiya Nyaya Sanhita sections |
| **FIR Generator** | AI auto-fills a formal FIR template from your conversation context |
| **PDF Download** | Download your FIR draft as a professionally formatted PDF with jsPDF |
| **Bilingual Support** | Works in both English and Hindi |
| **Secure API** | API key is never exposed to the browser — all AI calls go through server-side API routes |
| **100% Free** | No sign-up, no payment, no hidden fees |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **AI Model** | LLaMA 3.3 70B via [Groq API](https://groq.com) |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) |
| **API Security** | Next.js Edge API Routes (server-side proxy) |
| **Hosting** | [Vercel](https://vercel.com) |
| **Fonts** | Google Fonts (Inter + Outfit) |

---

## 📁 Project Structure

```
NyayBot/
├── src/
│   ├── app/
│   │   ├── layout.jsx             # Root layout (fonts, animated background, navbar)
│   │   ├── page.jsx               # Homepage (hero, features, how-it-works, SDG 16)
│   │   ├── globals.css            # Tailwind v4 theme (design tokens, animations)
│   │   ├── chat/
│   │   │   └── page.jsx           # AI Chat Interface (streaming responses)
│   │   ├── fir/
│   │   │   └── page.jsx           # FIR Generator (form + PDF download)
│   │   └── api/
│   │       ├── chat/route.js      # Edge API: securely proxies chat to Groq
│   │       └── extract/route.js   # Edge API: securely proxies FIR extraction to Groq
│   └── components/
│       └── Navbar.jsx             # Responsive navigation with mobile menu
├── .env                           # GROQ_API_KEY (gitignored)
├── .gitignore
├── package.json
├── teach.md                       # Step-by-step educational guide (gitignored)
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** 18+ installed
- A **Groq API key** ([Get one free](https://console.groq.com))

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prayag-1771/NyayBot.git
   cd NyayBot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create the environment file:**
   ```bash
   # Create a .env file in the root directory
   echo "GROQ_API_KEY=your_groq_api_key_here" > .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 🌐 Deployment (Vercel)

NyayBot is designed for one-click deployment on Vercel:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. Add the environment variable:
   - **Key:** `GROQ_API_KEY`
   - **Value:** Your Groq API key
4. Click **Deploy** — done! 🎉

Vercel automatically detects Next.js and handles everything — no build configuration needed.

**Live Demo:** [nyay-bot-psi.vercel.app](https://nyay-bot-psi.vercel.app)

---

## 🔒 Security

NyayBot uses a **server-side API proxy** architecture to keep your API key secure:

```
Browser → /api/chat (Next.js Edge Route) → Groq API
                    ↑
          API key injected here (server-side only)
          Never sent to the browser
```

The Groq API key is stored in `.env` (gitignored) and only accessed by the Edge API routes on the server. Users never see the key, even in browser DevTools.

---

## 🏛️ SDG 16 — Peace, Justice & Strong Institutions

NyayBot directly supports **UN Sustainable Development Goal 16** by making legal aid accessible to people who are normally excluded from the justice system due to:
- 💰 **Cost** — Legal consultations are expensive
- 📖 **Complexity** — Laws are written in difficult language
- 🗣️ **Language barriers** — Many citizens don't understand English legal texts
- 🌍 **Access** — Not everyone lives near a lawyer or legal aid center

---

## 🔮 Future Scope

- 🌐 Multi-language support (Tamil, Bengali, Marathi, Telugu, etc.)
- 📱 Mobile app version (React Native / Flutter)
- 📄 RTI (Right to Information) request generator
- 🛡️ Consumer complaint generator
- 🤝 Integration with government legal aid services
- 🔐 User authentication and saved case history

---

## ⚠️ Disclaimer

NyayBot provides **AI-generated legal information**, not professional legal advice. The FIR drafts generated are for **reference purposes only**. For serious legal matters, please consult a qualified lawyer or visit your nearest **Legal Aid Centre**.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with respect for the people of India*
