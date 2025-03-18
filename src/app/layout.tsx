import { Fraunces, Outfit } from "next/font/google";
import './globals.css';
import type { Metadata } from 'next'

// Font setup
const serif = Fraunces({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-serif",
});

const sans = Outfit({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    display: "swap",
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "WYSSN - Never be at a loss for words",
    description: "Your AI-powered conversation companion that helps you maintain meaningful dialogues with contextually appropriate suggestions."
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html lang="en" className={`${sans.variable} ${serif.variable}`}>
            <body className="antialiased min-h-screen bg-white">
                {children}
            </body>
        </html>
    );
}
