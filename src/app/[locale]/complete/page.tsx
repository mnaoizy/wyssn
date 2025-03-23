'use client';

import React, { useReducer, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Briefcase,
    Sparkles,
    IceCream,
    WebcamIcon,
    Shuffle,
    NotebookPenIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 型定義
interface SuggestionsPosition {
    top: number;
    left: number;
    width: number;
}

interface Suggestion {
    ja: string;
    en: string;
}

// テキスト要素の型定義
interface TextItem {
    text: string;
    type: 'user-input' | 'autocomplete';
}

interface AppState {
    isClient: boolean;
    isPositionCalculated: boolean;
    text: string; // 後方互換性のため保持
    textItems: TextItem[]; // オブジェクト配列に変更
    selectedTexts: string[];
    debugTextInput: string;
    debugAutoCompleteWord: string;
    showTranslation: boolean;
    currentContext: string;
    currentTone: string;
    suggestionsPosition: SuggestionsPosition;
    windowWidth: number;
    suggestions: Suggestion[];
}

type ActionType =
    | { type: 'SET_CLIENT'; payload: boolean }
    | { type: 'SET_POSITION_CALCULATED'; payload: boolean }
    | { type: 'SET_TEXT'; payload: { text: string; textItems: TextItem[] } }
    | { type: 'ADD_RANDOM_TEXT' }
    | { type: 'UPDATE_SUGGESTIONS_POSITION'; payload: SuggestionsPosition }
    | { type: 'SET_WINDOW_WIDTH'; payload: number }
    | { type: 'SET_AUTOCOMPLETE_WORD'; payload: string }
    | { type: 'TOGGLE_TRANSLATION' }
    | { type: 'SELECT_SUGGESTION'; payload: Suggestion }
    | { type: 'UPDATE_SUGGESTIONS'; payload: Suggestion[] };

// アプリケーションの状態を定義
const initialState: AppState = {
    isClient: false,
    isPositionCalculated: false,
    text: '',
    textItems: [],
    selectedTexts: [],
    debugTextInput: '',
    debugAutoCompleteWord: 'オートコンプリート',
    showTranslation: true,
    currentContext: 'ビジネス',
    currentTone: 'フォーマル',
    suggestionsPosition: { top: 200, left: 20, width: 450 },
    windowWidth: 0,
    suggestions: []
};

// アクションタイプの定義
const ActionTypes = {
    SET_CLIENT: 'SET_CLIENT',
    SET_POSITION_CALCULATED: 'SET_POSITION_CALCULATED',
    SET_TEXT: 'SET_TEXT',
    ADD_RANDOM_TEXT: 'ADD_RANDOM_TEXT',
    UPDATE_SUGGESTIONS_POSITION: 'UPDATE_SUGGESTIONS_POSITION',
    SET_WINDOW_WIDTH: 'SET_WINDOW_WIDTH',
    SET_AUTOCOMPLETE_WORD: 'SET_AUTOCOMPLETE_WORD',
    TOGGLE_TRANSLATION: 'TOGGLE_TRANSLATION',
    SELECT_SUGGESTION: 'SELECT_SUGGESTION',
    UPDATE_SUGGESTIONS: 'UPDATE_SUGGESTIONS'
} as const;

// ランダムな長さのテキストを生成する関数
const generateRandomText = (): string => {
    const words = ['テスト', 'サンプル', 'テキスト', '入力', 'オートコンプリート', 'AI', '自然言語', '処理', '開発', 'フロントエンド'];
    const length = Math.floor(Math.random() * 5) + 1; // 1〜5語のランダムな長さ

    let result = '';
    for (let i = 0; i < length; i++) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        result += (i > 0 ? ' ' : '') + randomWord;
    }

    return result;
};

// テキスト文字列からTextItem配列に変換する関数
const textToItems = (text: string, defaultType: 'user-input' | 'autocomplete' = 'user-input'): TextItem[] => {
    return text.split(' ')
        .filter(word => word.length > 0)
        .map(word => ({ text: word, type: defaultType }));
};

// TextItem配列からテキスト文字列に変換する関数
const itemsToText = (items: TextItem[]): string => {
    return items.map(item => item.text).join(' ');
};

// Reducerの定義
function reducer(state: AppState, action: ActionType): AppState {
    switch (action.type) {
        case ActionTypes.SET_CLIENT:
            return { ...state, isClient: action.payload };
        case ActionTypes.SET_POSITION_CALCULATED:
            return { ...state, isPositionCalculated: action.payload };
        case ActionTypes.SET_TEXT:
            const { text, textItems } = action.payload;

            return {
                ...state,
                text,
                textItems,
                debugTextInput: text
            };
        case ActionTypes.ADD_RANDOM_TEXT:
            const randomText = generateRandomText();
            const randomItems = textToItems(randomText, 'user-input');
            const newTextItems = [...state.textItems, ...randomItems];
            const newText = itemsToText(newTextItems);

            return {
                ...state,
                text: newText,
                textItems: newTextItems,
                debugTextInput: newText
            };
        case ActionTypes.UPDATE_SUGGESTIONS_POSITION:
            return {
                ...state,
                suggestionsPosition: action.payload,
                isPositionCalculated: true
            };
        case ActionTypes.SET_WINDOW_WIDTH:
            return { ...state, windowWidth: action.payload };
        case ActionTypes.SET_AUTOCOMPLETE_WORD:
            return { ...state, debugAutoCompleteWord: action.payload };
        case ActionTypes.TOGGLE_TRANSLATION:
            return { ...state, showTranslation: !state.showTranslation };
        case ActionTypes.SELECT_SUGGESTION:
            const suggestion = action.payload;
            const suggestionItems = textToItems(suggestion.ja, 'autocomplete');
            const updatedTextItems = [...state.textItems, ...suggestionItems];
            const updatedText = itemsToText(updatedTextItems);

            return {
                ...state,
                text: updatedText,
                textItems: updatedTextItems,
                debugTextInput: updatedText,
                selectedTexts: [...state.selectedTexts, suggestion.ja]
            };
        case ActionTypes.UPDATE_SUGGESTIONS:
            return { ...state, suggestions: action.payload };
        default:
            return state;
    }
}

export default function Home() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const textRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 最後のワード要素への参照を保持する配列
    const wordRefs = useRef<Record<number, HTMLSpanElement | null>>({});

    // テキストの最後の単語を取得する関数
    const getLastWord = useCallback((): string => {
        if (state.textItems.length === 0) return '';
        return state.textItems[state.textItems.length - 1].text;
    }, [state.textItems]);

    // オートコンプリートの候補と翻訳を生成する関数
    const generateSuggestions = useCallback((lastWord: string): Suggestion[] => {
        if (!lastWord) return [];

        // デバッグモードの場合、入力された単語を使用
        const wordToUse = state.debugAutoCompleteWord || lastWord;

        // 3つの候補を提供（翻訳付き）
        return [
            {
                ja: `${wordToUse}について詳しく教えてください。特に最近の研究や開発状況に興味があります。`,
                en: `Please tell me more about ${wordToUse}. I'm particularly interested in recent research and development.`
            },
            {
                ja: `${wordToUse}の具体的な例をいくつか示してください。実際の使用例や応用例が知りたいです。`,
                en: `Could you show me some specific examples of ${wordToUse}? I'd like to know actual use cases and applications.`
            },
            {
                ja: `${wordToUse}に関する最新の情報を教えてください。業界動向や将来の展望についても知りたいです。`,
                en: `Please share the latest information about ${wordToUse}. I'd also like to know about industry trends and future prospects.`
            }
        ];
    }, [state.debugAutoCompleteWord]);

    // 最後の要素の位置情報を取得する関数
    const getLastElementRect = useCallback((): DOMRect | null => {
        if (state.textItems.length === 0) return null;

        const lastIndex = state.textItems.length - 1;
        const lastElementRef = wordRefs.current[lastIndex];

        if (!lastElementRef) return null;

        return lastElementRef.getBoundingClientRect();
    }, [state.textItems]);

    // 候補リストのポジショニング計算
    const calculateSuggestionsPosition = useCallback((): SuggestionsPosition => {
        if (!textRef.current || !containerRef.current) return { top: 200, left: 20, width: 450 };

        const textRect = textRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const lastElementRect = getLastElementRect();

        // ウィンドウサイズに応じてサジェスト幅を調整
        const idealWidth = state.windowWidth < 640 ? state.windowWidth - 60 : 450;
        const maxWidth = Math.min(containerRect.width - 40, idealWidth);

        // 位置計算
        let top = textRect.bottom - containerRect.top + 5;
        let left = 20; // デフォルト値

        if (lastElementRect) {
            // 最後の要素の位置が取得できた場合
            top = lastElementRect.bottom - containerRect.top + 5;
            left = lastElementRect.right - containerRect.left;

            // 右端からはみ出す場合は調整
            if (left + maxWidth > containerRect.width - 20) {
                left = Math.max(20, containerRect.width - maxWidth - 20);
            }
        }

        return {
            top,
            left,
            width: maxWidth
        };
    }, [state.windowWidth, getLastElementRect]);

    // 候補位置を更新
    const updateSuggestionsPosition = useCallback(() => {
        const newPosition = calculateSuggestionsPosition();

        dispatch({
            type: ActionTypes.UPDATE_SUGGESTIONS_POSITION,
            payload: newPosition
        });
    }, [calculateSuggestionsPosition]);

    // テキスト入力処理のハンドラー
    const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        const newTextItems = textToItems(newText, 'user-input');

        dispatch({
            type: ActionTypes.SET_TEXT,
            payload: { text: newText, textItems: newTextItems }
        });
    };

    // ランダムテキスト追加ハンドラー
    const handleAddRandomText = () => {
        dispatch({ type: ActionTypes.ADD_RANDOM_TEXT });
    };

    // デバッグ用オートコンプリートワード入力処理
    const handleDebugAutoCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        dispatch({
            type: ActionTypes.SET_AUTOCOMPLETE_WORD,
            payload: newValue
        });
    };

    // 候補の選択処理
    const handleSuggestionSelect = (suggestion: Suggestion) => {
        dispatch({
            type: ActionTypes.SELECT_SUGGESTION,
            payload: suggestion
        });
    };

    // 翻訳表示の切り替え
    const toggleTranslation = () => {
        dispatch({ type: ActionTypes.TOGGLE_TRANSLATION });
    };

    // 参照関数を設定（各単語要素への参照を保持）
    const setWordRef = (el: HTMLSpanElement | null, index: number) => {
        if (el) {
            wordRefs.current[index] = el;
        }
    };

    // クライアントサイドレンダリングの確認
    useEffect(() => {
        dispatch({ type: ActionTypes.SET_CLIENT, payload: true });
        dispatch({ type: ActionTypes.SET_WINDOW_WIDTH, payload: window.innerWidth });
    }, []);

    // ウィンドウリサイズ時の処理
    useEffect(() => {
        if (!state.isClient) return;

        const handleResize = () => {
            dispatch({ type: ActionTypes.SET_WINDOW_WIDTH, payload: window.innerWidth });
            updateSuggestionsPosition();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [state.isClient, updateSuggestionsPosition]);

    // 初期レンダリング時とテキスト変更時にポジションを計算
    useEffect(() => {
        if (!state.isClient) return;

        // DOMの更新後に位置を計算するために少し遅延させる
        const timer = setTimeout(() => {
            updateSuggestionsPosition();
        }, 10);

        return () => clearTimeout(timer);
    }, [
        state.text,
        state.textItems,
        state.debugAutoCompleteWord,
        state.windowWidth,
        state.isClient,
        updateSuggestionsPosition
    ]);

    // 初期レンダリング完了後に位置を計算
    useEffect(() => {
        if (!state.isClient) return;

        // DOMが完全にロードされた後に計算
        const timer = setTimeout(() => {
            updateSuggestionsPosition();
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [state.isClient, updateSuggestionsPosition]);

    // 候補を更新
    useEffect(() => {
        const lastWord = getLastWord();
        const newSuggestions = generateSuggestions(state.debugAutoCompleteWord || lastWord);

        dispatch({
            type: ActionTypes.UPDATE_SUGGESTIONS,
            payload: newSuggestions
        });
    }, [state.textItems, state.debugAutoCompleteWord, getLastWord, generateSuggestions]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl rounded-lg shadow-md p-4 sm:p-6 bg-gray-50 relative" ref={containerRef}>
                <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">テキスト オートコンプリート</h1>

                {/* デバッグ用入力エリア */}
                <div className="mb-4 p-3 sm:p-4 bg-white rounded-md border border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">デバッグ用コントロール</h2>

                    {/* 表示テキスト設定 - テキストエリアに変更 */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700">テキスト</label>
                        <textarea
                            value={state.debugTextInput}
                            onChange={handleTextInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-gray-500 focus:border-gray-500 resize-y"
                            placeholder="表示するテキストを入力..."
                            rows={2}
                        />
                        <div className="mt-2 flex space-x-2">
                            <button
                                onClick={handleAddRandomText}
                                className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                aria-label="ランダムテキストを追加"
                            >
                                <Shuffle size={14} />
                                <span>ランダムテキスト追加</span>
                            </button>
                        </div>
                    </div>

                    {/* オートコンプリート設定 */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700">オートコンプリート用単語</label>
                        <input
                            type="text"
                            value={state.debugAutoCompleteWord}
                            onChange={handleDebugAutoCompleteChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-gray-500 focus:border-gray-500"
                            placeholder="オートコンプリートの基準となる単語..."
                        />
                    </div>
                </div>

                {/* ツールバー */}
                <div className="mb-4 p-2 bg-white rounded-md border border-gray-200 flex items-center gap-2">
                    {/* 再生成ボタン */}
                    <button
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        aria-label="再生成"
                    >
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">再生成</span>
                    </button>

                    {/* カジュアルボタン */}
                    <button
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-600"
                        aria-label="カジュアル"
                    >
                        <IceCream size={16} />
                        <span className="hidden sm:inline">カジュアル</span>
                    </button>

                    {/* ビジネスボタン */}
                    <button
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                        aria-label="ビジネス"
                    >
                        <Briefcase size={16} />
                        <span className="hidden sm:inline">ビジネス</span>
                    </button>

                    {/* 面接ボタン */}
                    <button
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                        aria-label="面接"
                    >
                        <WebcamIcon size={16} />
                        <span className="hidden sm:inline">面接</span>
                    </button>

                    {/* 状態表示 */}
                    <div className="ml-auto text-xs text-gray-500">
                        <span className="bg-gray-200 px-2 py-1 rounded-md">
                            モード: {state.currentContext} / トーン: {state.currentTone}
                        </span>
                    </div>
                </div>

                {/* テキスト表示エリア - word-wrapを追加 & 配列対応 & オートコンプリート特別スタイル */}
                <div className="relative text-md leading-relaxed mb-16">
                    <div
                        ref={textRef}
                        className="p-3 bg-white rounded-md border border-gray-200 min-h-[60px] break-words whitespace-pre-wrap"
                    >
                        {/* テキスト配列を表示 */}
                        {state.textItems.length > 0 ? (
                            <div className="flex flex-wrap justify-start items-center">
                                {state.textItems.map((item: TextItem, index: number) => {
                                    // オートコンプリートから挿入された単語かどうかをチェック
                                    const isAutoCompleteWord = item.type === 'autocomplete';

                                    return (
                                        <span
                                            key={`text-span-${index}`}
                                            ref={(el) => setWordRef(el, index)}
                                            className={cn(
                                                "mr-1 mb-1",
                                                isAutoCompleteWord
                                                    ? "text-xs p-1 text-gray-800 font-medium px rounded bg-gray-50 max-w-92 relative"
                                                    : "font-bold"
                                            )}
                                        >
                                            {item.text}
                                            {
                                                isAutoCompleteWord && <div className="absolute -bottom-1 -right-1 text-gray-400 p-2">
                                                    <NotebookPenIcon className='size-3' />
                                                </div>
                                            }
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            // 配列が空の場合は元のテキストを表示(後方互換性)
                            state.text
                        )}


                    </div>
                </div>

                {/* オートコンプリート候補 - クライアントサイドのみでレンダリング + 位置計算完了後に表示 */}
                {state.isClient && state.isPositionCalculated && (
                    <motion.div
                        className="absolute z-10 backdrop-blur-lg bg-white/95 border border-gray-200 rounded-md shadow-lg overflow-hidden divide-y divide-gray-300/40"
                        style={{
                            width: state.suggestionsPosition.width
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                            top: state.suggestionsPosition.top,
                            left: state.suggestionsPosition.left,
                            opacity: 1,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                            }
                        }}
                    >
                        {/* すべての候補を表示（翻訳付き） */}
                        {state.suggestions.map((suggestion: Suggestion, index: number) => (
                            <div
                                key={index}
                                className="cursor-pointer suggestion-item hover:bg-gray-200/30"
                                onClick={() => handleSuggestionSelect(suggestion)}
                            >
                                {/* 日本語 */}
                                <div className="px-2 pt-2 pb-1 text-sm text-gray-800">
                                    {suggestion.ja}
                                </div>

                                {/* 英語（表示/非表示切り替え可能） */}
                                {state.showTranslation && (
                                    <div className="px-2 pb-1 text-xs text-gray-500">
                                        {suggestion.en}
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* スケルトンでの4つ目の候補（常に表示） */}
                        <div className="cursor-pointer suggestion-item hover:bg-gray-200/30">
                            <div className="px-2 pt-2 pb-1">
                                <Skeleton className="w-full h-5 mb-1 bg-gray-200" />
                                <Skeleton className="w-1/4 h-5 mb-1 bg-gray-200" />
                            </div>

                            {state.showTranslation && (
                                <div className="px-2 pb-1">
                                    <Skeleton className="w-5/6 h-3 mb-1 bg-gray-100" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="mt-16 flex flex-wrap gap-2">
                    <button
                        onClick={toggleTranslation}
                        className={`px-3 py-1 sm:px-4 sm:py-2 text-sm rounded focus:outline-none focus:ring-2 transition-colors ${state.showTranslation
                            ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                            }`}
                    >
                        {state.showTranslation ? '英語訳を隠す' : '英語訳を表示'}
                    </button>
                </div>

                {/* デバッグ情報 */}
                <div className="mt-4 p-2 sm:p-3 bg-white rounded text-xs text-gray-500 border border-gray-200">
                    <p>生成された候補数: {state.suggestions.length} + スケルトン表示</p>
                    <p>現在のコンテキスト: {state.currentContext} / 現在のトーン: {state.currentTone}</p>
                    <p>サジェスト位置: top: {Math.round(state.suggestionsPosition.top)}px, left: {Math.round(state.suggestionsPosition.left)}px, width: {Math.round(state.suggestionsPosition.width)}px</p>
                    <p>クライアントレンダリング: {state.isClient ? 'はい' : 'いいえ'} / 位置計算完了: {state.isPositionCalculated ? 'はい' : 'いいえ'}</p>
                    <p>テキスト単語数: {state.textItems.length} / 最後の単語: {getLastWord()}</p>
                    <p>オートコンプリート単語数: {state.textItems.filter(item => item.type === 'autocomplete').length}個</p>
                    <div className="mt-2">
                        <p>テキストアイテム:</p>
                        <pre className="bg-gray-100 p-2 mt-1 overflow-auto max-h-32 text-xs">
                            {JSON.stringify(state.textItems, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}