import fs from 'fs/promises';
import path from 'path';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { markdownStyle } from '@/lib/markdown';

export const metadata: Metadata = {
    title: '特定商取引法に基づく表記 | Wyssn',
    description: '特定商取引法に基づく表記',
};

async function getCommericalLawContent() {
    try {
        const filePath = path.join(process.cwd(), "docs", "commercial-law", 'ja-JP.md');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error('Error reading commerical law file:', error);
        return '# Commercial Law\n\nNo commercial law content found.';
    }
}

export default async function CommercialLawPage() {
    const commercialLawContent = await getCommericalLawContent();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                    components={markdownStyle}>
                    {commercialLawContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
