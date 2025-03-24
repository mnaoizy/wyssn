import fs from 'fs/promises';
import path from 'path';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { markdownStyle } from '@/lib/markdown';

export const metadata: Metadata = {
    title: 'Changelog | Wyssn',
    description: 'Track all updates and changes to the Wyssn application',
};

async function getChangelogContent() {
    try {
        const filePath = path.join(process.cwd(), 'CHANGELOG.md');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error('Error reading changelog file:', error);
        return '# Changelog\n\nNo changelog content found.';
    }
}

export default async function ChangelogPage() {
    const changelogContent = await getChangelogContent();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                    components={markdownStyle}>
                    {changelogContent}
                </ReactMarkdown>
            </div>
        </div>
    );
}
