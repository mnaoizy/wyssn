import { Fraunces, Outfit } from "next/font/google";
import { getCurrentLocale } from "@/locale/server";
import './globals.css';

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

// Dynamically generate metadata based on locale
export async function generateMetadata(): Promise<{ title: string; description: string }> {
    const locale = await getCurrentLocale();

    const metadataByLocale: Record<string, { title: string; description: string }> = {
        en: {
            title: "WYSSN - Never be at a loss for words",
            description: "Your AI-powered conversation companion that helps you maintain meaningful dialogues with contextually appropriate suggestions.",
        },
        fr: {
            title: "WYSSN - Ne manquez jamais de mots",
            description: "Votre compagnon de conversation alimenté par l'IA qui vous aide à maintenir des dialogues significatifs avec des suggestions contextuelles appropriées.",
        },
        ja: {
            title: "WYSSN - 言葉に困ることはありません",
            description: "AIで駆動された会話の相棒で、適切なコンテキストの提案で意味のある対話を維持するのに役立ちます。",
        }
    };

    return metadataByLocale[locale] || metadataByLocale.en;
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getCurrentLocale();

    return (
        <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
            <body className="antialiased min-h-screen bg-white">
                {children}
            </body>
        </html>
    );
}
