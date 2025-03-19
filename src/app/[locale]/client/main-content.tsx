/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useReducer, useState, useMemo } from 'react';
import { useUtterances } from '@/contexts/utterance-context';
import { SpeechRecognitionMinimal } from '@/components/speech-recognition-minimal';
import { useSpeechRecognition, Utterance } from '@/hooks/use-speech-recognition';
import { experimental_useObject as useObject } from '@ai-sdk/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PinIcon, Trash2Icon } from 'lucide-react';
import { conversationSuggestionSchema } from '@/types/shared-types';
import { useI18n } from '@/locale/client';

interface MainContentProps {
  heroTitle: string;
  heroDescription: string;
}

// 提案の型定義 (サーバー側から返される基本型)
interface BaseSuggestion {
  category?: string;
  confidenceLevel?: number;
  content?: string;
  translation?: string;
}

// クライアント側で拡張する提案型
interface ClientSuggestion extends BaseSuggestion {
  id: string; // 必須のID (クライアント側で生成)
  isPinned?: boolean;
}

// リデューサーの状態型
interface SuggestionsState {
  hiddenIndices: Set<number>;
  pinnedSuggestions: ClientSuggestion[];
}

// リデューサーのアクション型
type SuggestionsAction =
  | { type: 'HIDE_SUGGESTION'; index: number }
  | { type: 'TOGGLE_PIN'; suggestion: ClientSuggestion }
  | { type: 'UNPIN_SUGGESTION'; index: number }
  | { type: 'RESET_HIDDEN' };

// 一意のIDを生成する関数
const generateUniqueId = (): string => {
  return `suggestion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// リデューサー関数
const suggestionsReducer = (state: SuggestionsState, action: SuggestionsAction): SuggestionsState => {
  switch (action.type) {
    case 'HIDE_SUGGESTION':
      // 非表示インデックスを追加
      const newHiddenIndices = new Set(state.hiddenIndices);
      newHiddenIndices.add(action.index);
      return {
        ...state,
        hiddenIndices: newHiddenIndices
      };

    case 'TOGGLE_PIN':
      const suggestion = action.suggestion;

      // 既存のピン留めインデックスを検索
      const existingPinIndex = state.pinnedSuggestions.findIndex(
        pinned => pinned.id === suggestion.id
      );

      if (existingPinIndex >= 0) {
        // ピン解除
        return {
          ...state,
          pinnedSuggestions: state.pinnedSuggestions.filter((_, i) => i !== existingPinIndex)
        };
      } else {
        // ピン留め
        return {
          ...state,
          pinnedSuggestions: [...state.pinnedSuggestions, { ...suggestion, isPinned: true }]
        };
      }

    case 'UNPIN_SUGGESTION':
      // 指定されたインデックスのピン留め提案を削除
      return {
        ...state,
        pinnedSuggestions: state.pinnedSuggestions.filter((_, i) => i !== action.index)
      };

    case 'RESET_HIDDEN':
      // 非表示状態をリセット
      return {
        ...state,
        hiddenIndices: new Set()
      };

    default:
      return state;
  }
};

export const MainContent: React.FC<MainContentProps> = ({
  heroTitle,
  heroDescription
}) => {
  const [transcription, setTranscription] = useState('大学の研究で認知言語学について調べていて、特に言語がどのように人間の思考パターンを形成するかという点に興味があります。サピア・ウォーフの仮説では、使用する言語によって世界の認識の仕方が変わるとされていますが、最近の研究では部分的に支持されつつも批判も多いことを知りました。例えば、色彩語彙と色の認識には確かに関連性があるようですが、思考全体を言語が決定づけるわけではないようです。'); // デフォルト値を設定
  const t = useI18n(); // 国際化のフックを使用

  const { submit, isLoading, object } = useObject({
    api: "/api/suggest",
    schema: conversationSuggestionSchema,
  });

  // APIから返された提案にIDを割り当てる
  const suggestionsWithId = useMemo<ClientSuggestion[]>(() => {
    if (!object?.suggestions) return [];

    return object.suggestions.map((suggestion): ClientSuggestion => ({
      ...suggestion,
      id: generateUniqueId()
    }));
  }, [object?.suggestions]);

  // useReducerで提案の状態管理
  const [suggestionsState, dispatch] = useReducer(suggestionsReducer, {
    hiddenIndices: new Set<number>(),
    pinnedSuggestions: []
  });

  // 特定の提案がピン留めされているか確認する関数
  const checkIsPinned = (suggestion: ClientSuggestion): boolean => {
    return suggestionsState.pinnedSuggestions.some(pinned => pinned.id === suggestion.id);
  };

  const handleSubmit = () => {
    // 非表示状態をリセット
    dispatch({ type: 'RESET_HIDDEN' });
    // ピン留めは保持したままにする

    // 文字列を直接渡す
    submit({
      message: transcription,
    });
  };

  const { utterances, setUtterances } = useUtterances();

  const {
    utterances: speechUtterances,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onFinalUtterance(utterance, allUtterances) {
      // Update the context with all utterances
      setUtterances(allUtterances);
    },
  });

  // Keep the context updated with speechUtterances
  useEffect(() => {
    setUtterances(speechUtterances);
  }, [speechUtterances, setUtterances]);

  // For testing transitions
  const addTestUtterance = () => {
    const testUtterance: Utterance = {
      id: `test-${Date.now()}`,
      text: 'これはテスト文章です。',
      timestamp: Date.now(),
      confidence: 0.9,
      isFinal: true,
      lang: 'ja-JP'
    };

    setUtterances([...utterances, testUtterance]);
  };

  const clearAllUtterances = () => {
    setUtterances([]);
  };

  // Check if utterances exist
  const hasUtterances = utterances.length > 0;

  return (
    <main className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="flex-grow flex justify-center items-start py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-6xl 2xl:max-w-5xl text-center">
          {/* ラッパーコンテナを追加して高さを固定 */}
          <div
            className={cn(
              "transition-all duration-1200 ease-custom h-auto",
              hasUtterances ? "mt-0" : "mt-48"
            )}
          >
            {/* トランスフォームを適用する要素 */}
            <div
              className={cn(
                "transform transition-transform duration-1000 ease-custom origin-center",
                hasUtterances ? "scale-80" : "scale-100"
              )}
            >
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tight">
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-neutral-700 mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed tracking-tight max-w-3xl mx-auto lg:max-w-4xl xl:max-w-5xl">
                {heroDescription}
              </p>
            </div>
          </div>

          <div className='w-full mb-8'>
            <SpeechRecognitionMinimal />
          </div>

          {/* Test controls - for development only */}
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addTestUtterance}
              className="text-xs"
            >
              テスト文章を追加
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllUtterances}
              className="text-xs"
            >
              クリア
            </Button>
          </div>

          <div className='mt-8'>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">音声入力</h2>
              {/* <SpeechToTextWrapper onTranscriptionChange={handleTranscriptionChange} /> */}
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-24"
                placeholder="音声を入力してください..."
              />
            </div>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading || !transcription.trim()}
            >
              提案を生成
            </button>
            <div className="mt-6">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-neutral-900 mb-2 sm:mb-3 lg:mb-4 leading-tight tracking-tight text-left">
                You can probably say...
              </h2>

              <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {/* ピン留めされた提案を表示 */}
                {suggestionsState.pinnedSuggestions.map((suggestion, index) => (
                  <div key={`pinned-${suggestion.id}`} className="bg-white shadow rounded-lg p-4 pb-6 border-2 border-blue-200 flex flex-col min-h-40 justify-start h-full relative">
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
                        <span className='font-medium bg-gray-100 text-gray-400 px-1 py-0.5 mr-1 -ml-1 text-xs rounded-[3px] text-left'>翻訳</span>{suggestion.translation}
                      </span>
                    }
                    <div className="absolute -bottom-2 right-1">
                      <div className="mb-3 scale-80 origin-bottom-right flex flex-row gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => dispatch({ type: 'UNPIN_SUGGESTION', index })}
                        >
                          <Trash2Icon />
                        </Button>
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => dispatch({ type: 'TOGGLE_PIN', suggestion })}
                        >
                          <PinIcon />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 通常の提案を表示 (ピン留めされていないもののみ) */}
                {suggestionsWithId.map((suggestion, index) => (
                  // hiddenIndicesにindexが含まれておらず、かつピン留めされていない提案のみ表示
                  !suggestionsState.hiddenIndices.has(index) && !checkIsPinned(suggestion) && (
                    <div key={`regular-${suggestion.id}`} className="bg-white shadow rounded-lg p-4 pb-10 border flex flex-col min-h-40 justify-start border-gray-200 h-full relative">
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
                          <span className='font-medium bg-gray-100 text-gray-400 px-1 py-0.5 mr-1 -ml-1 text-xs rounded-[3px] text-left'>翻訳</span>{suggestion.translation}
                        </span>
                      }
                      <div className="absolute -bottom-2 right-1">
                        <div className="mb-3 scale-80 origin-bottom-right flex flex-row gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => dispatch({ type: 'HIDE_SUGGESTION', index })}
                          >
                            <Trash2Icon />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => dispatch({ type: 'TOGGLE_PIN', suggestion })}
                          >
                            <PinIcon />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            {isLoading && (
              <div className="mt-6 text-center">
                <div className="animate-pulse">会話提案を生成中...</div>
              </div>
            )}
          </div>
        </div>


      </section>
    </main>
  );
};

function getCategoryColor(category?: string): string {
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