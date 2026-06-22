import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

export const metadata = {
    title: "NyayBot — Justice, Simplified",
    description:
        "Free AI-powered legal assistant for Indian citizens. Understand your rights, find applicable IPC/BNS sections, and generate FIR drafts instantly.",
    keywords: "legal aid, Indian law, IPC, BNS, FIR, AI legal assistant, NyayBot, SDG 16",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="bg-bg-primary text-text-primary font-[family-name:var(--font-inter)] min-h-screen overflow-x-hidden leading-relaxed">
                {/* Animated Background Blobs */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute w-[400px] h-[400px] rounded-full bg-[rgba(245,166,35,0.3)] blur-[80px] opacity-40 top-[10%] left-[10%] animate-float-blob" />
                    <div className="absolute w-[350px] h-[350px] rounded-full bg-[rgba(0,212,170,0.3)] blur-[80px] opacity-40 bottom-[10%] right-[10%] animate-float-blob-reverse" />
                </div>

                {/* Navigation */}
                <Navbar />

                {/* Page Content */}
                <main className="relative z-[1]">{children}</main>
            </body>
        </html>
    );
}
