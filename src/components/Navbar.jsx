"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/chat", label: "Legal Chat" },
        { href: "/fir", label: "FIR Generator" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[1000] border-b border-border-glass backdrop-blur-[20px] transition-all duration-300
                ${scrolled || pathname !== "/" ? "py-2 bg-[rgba(10,15,30,0.95)] shadow-[0_4px_20px_rgba(0,0,0,0.4)]" : "py-4 bg-[rgba(10,15,30,0.85)]"}`}
        >
            <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary no-underline">
                    <span className="text-[1.8rem]">⚖️</span>
                    <span>
                        Nyay<span className="bg-gradient-to-r from-accent-gold to-accent-gold-light bg-clip-text text-transparent">Bot</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <ul className="hidden md:flex items-center gap-8 list-none">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`relative font-medium text-[0.95rem] transition-colors duration-200
                                    after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-accent-gold after:to-accent-gold-light after:transition-all after:duration-300
                                    ${pathname === link.href
                                        ? "text-text-primary after:w-full"
                                        : "text-text-secondary hover:text-text-primary after:w-0 hover:after:w-full"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link
                            href="/chat"
                            className="px-4 py-2 bg-gradient-to-r from-accent-gold to-accent-gold-light text-bg-primary rounded-sm font-semibold text-[0.9rem] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(245,166,35,0.2)] no-underline"
                        >
                            Get Legal Help →
                        </Link>
                    </li>
                </ul>

                {/* Mobile Hamburger */}
                <button
                    className="flex md:hidden flex-col gap-[5px] bg-transparent border-none p-2 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-[2px] bg-text-primary rounded-sm transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                    <span className={`block w-6 h-[2px] bg-text-primary rounded-sm transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block w-6 h-[2px] bg-text-primary rounded-sm transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <ul className="md:hidden flex flex-col gap-4 p-6 bg-[rgba(10,15,30,0.98)] backdrop-blur-[20px] border-b border-border-glass list-none">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`font-medium text-[0.95rem] ${pathname === link.href ? "text-text-primary" : "text-text-secondary"}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link
                            href="/chat"
                            className="inline-block px-4 py-2 bg-gradient-to-r from-accent-gold to-accent-gold-light text-bg-primary rounded-sm font-semibold no-underline"
                            onClick={() => setMenuOpen(false)}
                        >
                            Get Legal Help →
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    );
}
