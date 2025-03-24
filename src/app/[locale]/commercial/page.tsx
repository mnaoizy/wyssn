import fs from 'fs/promises';
import path from 'path';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';

export const metadata: Metadata = {
    title: '特定商取引法に基づく表記 | Wyssn',
    description: '特定商取引法に基づく表記',
};

async function getCommericalLawContent() {
    try {
        const filePath = path.join(process.cwd(), 'COMMERCIAL_LAW.md');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error('Error reading commerical law file:', error);
        return '# CommercialLaw\n\nNo commercial law content found.';
    }
}

export default async function CommercialLawPage() {
    const commercialLawContent = await getCommericalLawContent();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">
                    特定商取引法に基づく表記
                </h1>

            </div>

            <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                    components={{
                        h2: ({ ...props }) => <h2 className="text-xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-6 mb-3" {...props} />,
                        ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                        li: ({ ...props }) => <li className="mb-1" {...props} />,
                        p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                        code: ({ ...props }) => <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono" {...props} />,
                        pre: ({ ...props }) => <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto mb-4 text-sm" {...props} />,
                        a: ({ ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                        blockquote: ({ ...props }) => <blockquote className="pl-4 italic border-l-4 border-gray-200 text-gray-700 mb-4" {...props} />
                    }}>
                    {commercialLawContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
