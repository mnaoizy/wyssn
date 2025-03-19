'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PinIcon, Trash2Icon } from 'lucide-react';
import { useI18n } from '@/locale/client';
import { ClientSuggestion } from '@/types/suggestions';

// SuggestionCard component props type
interface SuggestionCardProps {
    suggestion: ClientSuggestion;
    isPinned: boolean;
    onTogglePin: () => void;
    onHide: () => void;
    isDisabled?: boolean;
}

// Function to get category color
export function getCategoryColor(category?: string): string {
    switch (category) {
        case 'deeper_reflection':
            return 'bg-blue-100 text-blue-800';
        case 'additional_details':
            return 'bg-green-100 text-green-800';
        case 'question_expansion':
            return 'bg-yellow-100 text-yellow-800';
        case 'related_topics':
            return 'bg-purple-100 text-purple-800';
        case 'personal_opinion':
            return 'bg-amber-100 text-amber-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Shared SuggestionCard component
export const SuggestionCard: React.FC<SuggestionCardProps> = ({
    suggestion,
    isPinned,
    onTogglePin,
    onHide,
    isDisabled = false
}) => {
    const t = useI18n();

    return (
        <div
            className={`bg-white shadow rounded-lg p-4 ${isPinned ? 'pb-6' : 'pb-10'} ${isPinned ? 'border-2 border-blue-200' : 'border border-gray-200'
                } flex flex-col min-h-40 justify-start h-full relative`}
        >
            <div className="flex justify-between items-start">
                <span className="font-semibold text-gray-900 text-md">
                    {t(`categories.${suggestion.category}` as keyof typeof t)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(suggestion.category)}`}>
                    {suggestion.confidenceLevel}%
                </span>
            </div>
            <p className="mt-2 text-gray-600 text-left text-sm">{suggestion.content}</p>
            {
                suggestion.translation && (
                    <div className='w-full h-[1px] bg-gray-100 my-2' />
                )
            }

            {
                suggestion.translation && <span className='text-gray-600 text-sm text-left'>
                    <span className='font-medium bg-gray-100 text-gray-400 px-1 py-0.5 mr-1 -ml-1 text-xs rounded-[3px] text-left'>Translation</span>{suggestion.translation}
                </span>
            }
            <div className="absolute -bottom-2 right-1">
                <div className="mb-3 scale-80 origin-bottom-right flex flex-row gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={isDisabled}
                        onClick={onHide}
                    >
                        <Trash2Icon />
                    </Button>
                    <Button
                        variant={isPinned ? "default" : "outline"}
                        size="icon"
                        disabled={isDisabled}
                        onClick={onTogglePin}
                    >
                        <PinIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
};