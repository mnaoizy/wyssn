import fs from 'fs/promises';
import path from 'path';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { markdownStyle } from '@/lib/markdown';

export const metadata: Metadata = {
    title: 'Terms | Wyssn',
    description: 'Terms of service',
};

async function getTermsContent() {
    try {
        const filePath = path.join(process.cwd(), "docs", "terms", 'ja-JP.md');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error('Error reading terms file:', error);
        return '# Terms\n\nNo terms content found.';
    }
}

export default async function TermsPage() {
    const termsContent = await getTermsContent();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                    components={markdownStyle}>
                    {termsContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
