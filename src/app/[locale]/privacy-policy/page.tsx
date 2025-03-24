import fs from 'fs/promises';
import path from 'path';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { markdownStyle } from '@/lib/markdown';

export const metadata: Metadata = {
    title: 'プライバシーポリシー | Wyssn',
    description: 'プライバシーポリシー',
};

async function getPrivacyPolicyContent() {
    try {
        const filePath = path.join(process.cwd(), "docs", "privacy-policy", 'ja-JP.md');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error('Error reading privacy policy file:', error);
        return '# Privacy Policy \n\nNo privacy policy content found.';
    }
}

export default async function PrivacyPolicyPage() {
    const privacyPolicyContent = await getPrivacyPolicyContent();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                    components={markdownStyle}>
                    {privacyPolicyContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
