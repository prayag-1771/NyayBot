"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function HomePage() {
    useEffect(() => {
        // Scroll reveal
        const reveals = document.querySelectorAll(".reveal");
        if (reveals.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => entry.target.classList.add("visible"), index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
        );

        reveals.forEach((el) => observer.observe(el));
        return () => reveals.forEach((el) => observer.unobserve(el));
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center text-center px-6 pt-[120px] pb-16">
                <div className="max-w-[800px] animate-fade-in-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-glass border border-border-gold rounded-xl text-[0.85rem] text-accent-gold mb-6 animate-fade-in-up-delay-1">
                        <span className="w-2 h-2 bg-accent-gold rounded-full animate-pulse-dot" />
                        Powered by AI · Aligned with SDG 16
                    </div>

                    <h1 className="font-[family-name:var(--font-outfit)] text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.1] mb-4 animate-fade-in-up-delay-2">
                        Justice,<br />
                        <span className="bg-gradient-to-r from-accent-gold to-accent-gold-light bg-clip-text text-transparent">
                            Simplified.
                        </span>
                    </h1>

                    <p className="text-[clamp(1rem,2vw,1.25rem)] text-text-secondary max-w-[600px] mx-auto mb-8 leading-relaxed animate-fade-in-up-delay-3">
                        Don't know your legal rights? Can't afford a lawyer? NyayBot is your free AI legal assistant —
                        describe your problem in plain English or Hindi, and get instant legal guidance with applicable
                        IPC/BNS sections and ready-to-submit FIR drafts.
                    </p>

                    <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up-delay-4">
                        <Link
                            href="/chat"
                            className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-gold to-accent-gold-light text-bg-primary rounded-md font-semibold text-lg shadow-[0_0_30px_rgba(245,166,35,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(245,166,35,0.4)] no-underline"
                        >
                            ⚡ Start Free Consultation
                        </Link>
                        <a
                            href="#features"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-bg-glass text-text-primary border border-border-glass rounded-md font-semibold text-lg backdrop-blur-[10px] transition-all duration-300 hover:bg-bg-glass-hover hover:border-accent-gold hover:-translate-y-0.5 no-underline"
                        >
                            Learn More ↓
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 justify-center mt-12 animate-fade-in-up-delay-5">
                        {[
                            { value: "500+", label: "IPC/BNS Sections" },
                            { value: "100%", label: "Free Forever" },
                            { value: "24/7", label: "AI Available" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="font-[family-name:var(--font-outfit)] text-3xl font-bold text-accent-gold">{stat.value}</div>
                                <div className="text-[0.85rem] text-text-muted mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="text-center mb-12 reveal">
                        <span className="inline-block px-4 py-1 bg-bg-glass border border-border-teal rounded-xl text-[0.8rem] font-semibold text-accent-teal uppercase tracking-wider mb-4">
                            Features
                        </span>
                        <h2 className="font-[family-name:var(--font-outfit)] text-[clamp(1.8rem,4vw,2.8rem)] font-bold mb-4">
                            Everything You Need for Legal Aid
                        </h2>
                        <p className="text-text-secondary text-lg max-w-[600px] mx-auto">
                            Three powerful tools working together to make justice accessible to every Indian citizen.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "🧠", title: "AI Legal Advisor", desc: "Describe your problem in simple language — English or Hindi. Our AI understands your situation and explains your legal rights in words you can actually understand." },
                            { icon: "📋", title: "IPC & BNS Lookup", desc: "Instantly know which Indian Penal Code (IPC) or Bharatiya Nyaya Sanhita (BNS) sections apply to your case, with clear explanations of what each section means." },
                            { icon: "📝", title: "FIR Draft Generator", desc: "Generate a properly formatted FIR draft based on your conversation. Edit the details, download as PDF, and submit it at your nearest police station." },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="reveal bg-bg-glass border border-border-glass rounded-lg p-8 text-center backdrop-blur-[20px] transition-all duration-300 hover:bg-bg-glass-hover hover:border-border-gold hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(245,166,35,0.2)]"
                            >
                                <div className="w-[70px] h-[70px] mx-auto mb-4 flex items-center justify-center text-3xl bg-[linear-gradient(135deg,rgba(245,166,35,0.05),rgba(0,212,170,0.05))] border border-border-gold rounded-md">
                                    {feature.icon}
                                </div>
                                <h3 className="font-[family-name:var(--font-outfit)] text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-text-secondary text-[0.95rem] leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="text-center mb-12 reveal">
                        <span className="inline-block px-4 py-1 bg-bg-glass border border-border-teal rounded-xl text-[0.8rem] font-semibold text-accent-teal uppercase tracking-wider mb-4">
                            How It Works
                        </span>
                        <h2 className="font-[family-name:var(--font-outfit)] text-[clamp(1.8rem,4vw,2.8rem)] font-bold mb-4">
                            Three Simple Steps to Justice
                        </h2>
                        <p className="text-text-secondary text-lg max-w-[600px] mx-auto">
                            No legal knowledge required. Just describe what happened to you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { num: "1", icon: "💬", title: "Describe Your Problem", desc: "Tell NyayBot what happened in your own words. No legal jargon needed — just explain the situation like you would to a friend." },
                            { num: "2", icon: "⚖️", title: "Understand Your Rights", desc: "NyayBot identifies the applicable IPC/BNS sections, explains your legal rights, and suggests the best course of action for your situation." },
                            { num: "3", icon: "📄", title: "Generate Your FIR", desc: "With one click, NyayBot creates a formal FIR draft pre-filled with your case details. Review it, download the PDF, and submit it at the police station." },
                        ].map((step) => (
                            <div
                                key={step.num}
                                className="reveal bg-bg-glass border border-border-glass rounded-lg p-8 text-center backdrop-blur-[20px] transition-all duration-300 hover:bg-bg-glass-hover hover:border-border-gold hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(245,166,35,0.2)]"
                            >
                                <div className="w-[50px] h-[50px] mx-auto mb-4 flex items-center justify-center font-[family-name:var(--font-outfit)] text-xl font-bold bg-gradient-to-r from-accent-gold to-accent-gold-light text-bg-primary rounded-full">
                                    {step.num}
                                </div>
                                <div className="text-4xl mb-3">{step.icon}</div>
                                <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold mb-2">{step.title}</h3>
                                <p className="text-text-secondary text-[0.95rem]">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SDG 16 Section */}
            <section className="py-16 px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="reveal flex flex-col md:flex-row items-center gap-8 bg-[linear-gradient(135deg,rgba(245,166,35,0.05),rgba(0,212,170,0.05))] border border-border-teal rounded-lg p-8 backdrop-blur-[20px]">
                        <div className="text-6xl shrink-0">🏛️</div>
                        <div>
                            <h3 className="font-[family-name:var(--font-outfit)] text-2xl font-semibold mb-2 text-accent-teal">
                                SDG 16 — Peace, Justice & Strong Institutions
                            </h3>
                            <p className="text-text-secondary text-[0.95rem] leading-relaxed">
                                NyayBot directly supports the United Nations Sustainable Development Goal 16 by making
                                legal aid accessible to people who are normally excluded from the justice system due to
                                cost, language barriers, or lack of legal knowledge. Everyone deserves to know their rights —
                                regardless of their income or education.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border-glass py-8 px-6 text-center">
                <div className="flex gap-8 justify-center mb-4">
                    {[
                        { href: "/", label: "Home" },
                        { href: "/chat", label: "Legal Chat" },
                        { href: "/fir", label: "FIR Generator" },
                    ].map((link) => (
                        <Link key={link.href} href={link.href} className="text-text-secondary text-sm hover:text-accent-gold transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>
                <p className="text-text-muted text-sm">© 2026 NyayBot · Built with respect for the people of India · SDG 16 🏛️</p>
                <p className="mt-2 text-[0.75rem] text-text-muted">
                    Disclaimer: NyayBot provides AI-generated legal information, not professional legal advice.
                </p>
            </footer>
        </>
    );
}
