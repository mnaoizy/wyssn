import fs from 'fs/promises';
import path from 'path';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';

export const metadata: Metadata = {
    title: 'Terms | Wyssn',
    description: 'Terms of service',
};

async function getTermsContent() {
    try {
        const filePath = path.join(process.cwd(), 'TERMS.md');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error('Error reading terms file:', error);
        return '# Changelog\n\nNo terms content found.';
    }
}

export default async function TermsPage() {
    const termsContent = await getTermsContent();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                    components={{
                        h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200" {...props} />,
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
                    {termsContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
