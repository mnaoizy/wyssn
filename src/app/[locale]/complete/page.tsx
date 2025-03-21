'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Briefcase,
    SparklesIcon,
    DessertIcon
} from 'lucide-react';

export default function Home() {
    // メインテキスト（表示用）
    const [text, setText] = useState<string>('これはテキストの例です。オートコンプリート');
    // 選択した候補の履歴
    const [selectedTexts, setSelectedTexts] = useState<string[]>([]);
    // デバッグ用：表示テキスト入力
    const [debugTextInput, setDebugTextInput] = useState<string>('これはテキストの例です。オートコンプリート');
    // デバッグ用：オートコンプリート設定
    const [debugAutoCompleteWord, setDebugAutoCompleteWord] = useState<string>('オートコンプリート');
    // 翻訳表示の切り替え
    const [showTranslation, setShowTranslation] = useState<boolean>(true);
    // コンテキスト設定
    const [currentContext,] = useState<string>('ビジネス');
    // 感情トーン設定
    const [currentTone,] = useState<string>('フォーマル');

    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);
    const textRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // ウィンドウサイズの状態
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);

    // テキストの最後の単語を取得する関数
    const getLastWord = (text: string): string => {
        if (!text) return '';
        const words = text.split(' ');
        return words[words.length - 1];
    };

    // オートコンプリートの候補と翻訳を生成する関数
    const generateSuggestions = (lastWord: string): Array<{ ja: string, en: string }> => {
        if (!lastWord) return [];

        // デバッグモードの場合、入力された単語を使用
        const wordToUse = debugAutoCompleteWord || lastWord;

        // 3つの候補を提供（翻訳付き）
        const suggestions = [
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

        return suggestions;
    };

    // デバッグ用テキスト入力処理
    const handleDebugTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDebugTextInput(newValue);
        setText(newValue);
    };

    // デバッグ用オートコンプリートワード入力処理
    const handleDebugAutoCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDebugAutoCompleteWord(newValue);
        if (newValue.length > 0) {
            setShowSuggestions(true);
        }
    };

    // 候補の選択処理
    const handleSuggestionSelect = (suggestion: { ja: string, en: string }) => {
        // テキストを更新
        setText(`${text}`);
        setDebugTextInput(`${text}`);

        // 選択した候補をリストに追加
        setSelectedTexts([...selectedTexts, suggestion.ja]);

        setShowSuggestions(false);
    };

    // 翻訳表示の切り替え
    const toggleTranslation = () => {
        setShowTranslation(!showTranslation);
    };

    // キーボード操作の処理
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const suggestions = generateSuggestions(getLastWord(text));

        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
            }
            else if (e.key === 'Enter' && showSuggestions) {
                e.preventDefault();
                handleSuggestionSelect(suggestions[selectedSuggestion]);
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                setShowSuggestions(false);
            }
        }
    };

    // 候補リストのポジショニング
    const calculateSuggestionsPosition = () => {
        if (!textRef.current || !containerRef.current) return { top: 0, left: 0, width: 450 };

        const range = document.createRange();
        range.selectNodeContents(textRef.current);
        const textRect = range.getBoundingClientRect();

        const lastCharRect = getLastCharRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // ウィンドウサイズに応じてサジェスト幅を調整
        const idealWidth = windowWidth < 640 ? windowWidth - 60 : 450;
        const maxWidth = Math.min(containerRect.width - 60, idealWidth);

        const left = lastCharRect ? (lastCharRect.left - containerRect.left) : 0;
        const availableWidth = containerRect.width - 40;

        let adjustedLeft = left;
        if (left + maxWidth > availableWidth) {
            adjustedLeft = Math.max(0, availableWidth - maxWidth);
        }

        return {
            top: lastCharRect ? (lastCharRect.bottom - containerRect.top) : (textRect.bottom - containerRect.top),
            left: adjustedLeft,
            width: maxWidth
        };
    };

    // 最後の文字の位置情報を取得する関数
    const getLastCharRect = (): DOMRect | null => {
        if (!textRef.current || text.length === 0) return null;

        const textNode = Array.from(textRef.current.childNodes).find(
            node => node.nodeType === Node.TEXT_NODE
        ) as Text;

        if (!textNode) return null;

        const range = document.createRange();
        range.setStart(textNode, textNode.length - 1);
        range.setEnd(textNode, textNode.length);
        return range.getBoundingClientRect();
    };

    // 候補位置の計算
    const suggestionsPosition = calculateSuggestionsPosition();
    const suggestions = generateSuggestions(debugAutoCompleteWord || getLastWord(text));

    // オートコンプリート表示の切り替え
    const toggleSuggestions = () => {
        setShowSuggestions(!showSuggestions);
    };

    // ウィンドウリサイズ時の処理
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // useEffectでテキスト更新時やウィンドウサイズ変更時にオートコンプリート位置を更新
    useEffect(() => {
        // 位置を計算して更新
        calculateSuggestionsPosition();

        // テキストの最後の単語に基づいて候補を表示/非表示
        const lastWord = getLastWord(text);
        if (debugAutoCompleteWord.length > 0 || lastWord.length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [text, debugAutoCompleteWord, windowWidth]); // ウィンドウ幅も監視

    // アニメーションの設定
    const suggestionVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
        exit: {
            opacity: 0,
            y: -5,
            scale: 0.9,
            transition: {
                duration: 0.15
            }
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-4 sm:p-6 relative" ref={containerRef}>
                <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">テキスト オートコンプリート</h1>

                {/* デバッグ用入力エリア */}
                <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">デバッグ用コントロール</h2>

                    {/* 表示テキスト設定 */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700">テキスト</label>
                        <input
                            type="text"
                            value={debugTextInput}
                            onChange={handleDebugTextChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-gray-500 focus:border-gray-500"
                            placeholder="表示するテキストを入力..."
                        />
                    </div>

                    {/* オートコンプリート設定 */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1 text-gray-700">オートコンプリート用単語</label>
                        <input
                            type="text"
                            value={debugAutoCompleteWord}
                            onChange={handleDebugAutoCompleteChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-gray-500 focus:border-gray-500"
                            placeholder="オートコンプリートの基準となる単語..."
                        />
                    </div>

                    {/* 翻訳表示設定 */}
                    <div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="showTranslation"
                                checked={showTranslation}
                                onChange={toggleTranslation}
                                className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            />
                            <label htmlFor="showTranslation" className="text-sm font-medium text-gray-700">
                                英語訳を表示
                            </label>
                        </div>
                    </div>
                </div>

                {/* 新しいシンプルなツールバー */}
                <div className="mb-4 p-2 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-2">
                    {/* 緊急フレーズボタン */}
                    <button
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        aria-label="緊急フレーズ"
                    >
                        <SparklesIcon size={16} />
                        <span className="hidden sm:inline">再生成</span>
                    </button>

                    {/* 感情トーン表示器 */}
                    <button
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-600"
                        aria-label="感情トーン"
                    >
                        <DessertIcon size={16} />
                        <span className="hidden sm:inline">カジュアル</span>
                    </button>

                    {/* コンテキスト切り替えボタン */}
                    <button
                        className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                        aria-label="コンテキスト切り替え"
                    >
                        <Briefcase size={16} />
                        <span className="hidden sm:inline">ビジネス</span>
                    </button>

                    {/* 状態表示 */}
                    <div className="ml-auto text-xs text-gray-500">
                        <span className="bg-gray-200 px-2 py-1 rounded-md">
                            モード: ビジネス / トーン: フォーマル
                        </span>
                    </div>
                </div>

                {/* テキスト表示エリア */}
                <div className="space-y-4 relative font-bold text-xl">
                    <div
                        ref={textRef}
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                    >
                        {text}
                    </div>

                    {/* 選択された候補のリスト */}
                    {selectedTexts.length > 0 && (
                        <div className="flex flex-row flex-wrap gap-1 absolute top-2 left-2">
                            {selectedTexts.map((selectedText, index) => (
                                <div
                                    key={index}
                                    className="p-2 backdrop-blur-md z-10 bg-white/90  rounded-md text-xs text-gray-800 max-w-[240px]"
                                >
                                    {selectedText}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* オートコンプリート候補 - アニメーション付き */}
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            className="absolute z-10 backdrop-blur-lg bg-white/90 border border-gray-200 rounded-md shadow-lg overflow-hidden divide-y divide-gray-300/40"
                            style={{
                                top: `${suggestionsPosition.top + 5}px`,
                                left: `${suggestionsPosition.left}px`,
                                width: `${suggestionsPosition.width}px`,
                                maxWidth: windowWidth < 640 ? '95vw' : '450px'
                            }}
                            variants={suggestionVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* すべての候補を表示（翻訳付き） */}
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={`cursor-pointer suggestion-item ${index === selectedSuggestion ? 'bg-gray-300/10' : 'hover:bg-gray-300/10'
                                        }`}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                >
                                    {/* 日本語 */}
                                    <div className="px-2 pt-2 pb-1 text-sm text-gray-800">
                                        {suggestion.ja}
                                    </div>

                                    {/* 英語（表示/非表示切り替え可能） */}
                                    {showTranslation && (
                                        <div className="px-2 pb-1 text-xs text-gray-500">
                                            {suggestion.en}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* スケルトンでの4つ目の候補（常に表示） */}
                            <div className="cursor-pointer suggestion-item hover:bg-gray-300/10">
                                <div className="px-2 pt-2 pb-1">
                                    <Skeleton className="w-full h-5 mb-1 bg-gray-200" />
                                    <Skeleton className="w-1/4 h-5 mb-1 bg-gray-200" />
                                </div>

                                {showTranslation && (
                                    <div className="px-2 pb-1">
                                        <Skeleton className="w-5/6 h-3 mb-1 bg-gray-100" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        onClick={toggleSuggestions}
                        className="px-3 py-1 sm:px-4 sm:py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                        {showSuggestions ? 'オートコンプリートを隠す' : 'オートコンプリートを表示'}
                    </button>

                    <button
                        onClick={toggleTranslation}
                        className={`px-3 py-1 sm:px-4 sm:py-2 text-sm rounded focus:outline-none focus:ring-2 transition-colors ${showTranslation
                            ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                            }`}
                    >
                        {showTranslation ? '英語訳を隠す' : '英語訳を表示'}
                    </button>
                </div>

                <div className="mt-4 text-xs sm:text-sm text-gray-600">
                    <p>
                        上下矢印キーで候補を選択、Enterで確定、Escapeで候補を閉じることができます。
                    </p>
                </div>

                {/* デバッグ情報 */}
                <div className="mt-4 p-2 sm:p-3 bg-gray-50 rounded text-xs text-gray-500 border border-gray-200">
                    <p>生成された候補数: {suggestions.length} + スケルトン表示</p>
                    <p>現在のコンテキスト: {currentContext} / 現在のトーン: {currentTone}</p>
                </div>
            </div>
        </div>
    );
}