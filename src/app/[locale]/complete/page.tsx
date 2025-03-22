'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Briefcase,
    Sparkles,
    IceCream,
    WebcamIcon
} from 'lucide-react';

export default function Home() {
    // クライアントサイドレンダリングフラグ
    const [isClient, setIsClient] = useState(false);
    // 位置が計算されたかどうかのフラグ
    const [isPositionCalculated, setIsPositionCalculated] = useState(false);

    // メインテキスト（表示用）
    const [text, setText] = useState<string>('');
    // 選択した候補の履歴
    const [selectedTexts, setSelectedTexts] = useState<string[]>([]);
    // デバッグ用：表示テキスト入力
    const [debugTextInput, setDebugTextInput] = useState<string>('');
    // デバッグ用：オートコンプリート設定
    const [debugAutoCompleteWord, setDebugAutoCompleteWord] = useState<string>('オートコンプリート');
    // 翻訳表示の切り替え
    const [showTranslation, setShowTranslation] = useState<boolean>(true);
    // コンテキスト設定
    const [currentContext] = useState<string>('ビジネス');
    // 感情トーン設定
    const [currentTone] = useState<string>('フォーマル');

    // サジェスト位置の状態
    const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 200, left: 20, width: 450 });
    const textRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // ウィンドウサイズの状態
    const [windowWidth, setWindowWidth] = useState<number>(0);

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

    // デバッグ用オートコンプリートワード入力処理
    const handleDebugAutoCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDebugAutoCompleteWord(newValue);
    };

    // 候補の選択処理
    const handleSuggestionSelect = (suggestion: { ja: string, en: string }) => {
        // テキストを更新
        setText(`${text}`);
        setDebugTextInput(`${text}`);

        // 選択した候補をリストに追加
        setSelectedTexts([...selectedTexts, suggestion.ja]);
    };

    // 翻訳表示の切り替え
    const toggleTranslation = () => {
        setShowTranslation(!showTranslation);
    };

    // 最後の文字の位置情報を取得する関数 - メモ化
    const getLastCharRect = useCallback((): DOMRect | null => {
        if (!textRef.current || text.length === 0) return null;

        // テキストノードを取得する試み
        const textNode = Array.from(textRef.current.childNodes).find(
            node => node.nodeType === Node.TEXT_NODE
        ) as Text;

        if (!textNode) return null;

        try {
            const range = document.createRange();
            range.setStart(textNode, textNode.length - 1);
            range.setEnd(textNode, textNode.length);
            return range.getBoundingClientRect();
        } catch (e) {
            console.error('Error getting last char rect:', e);
            return null;
        }
    }, [text]);

    // 候補リストのポジショニング計算 - メモ化
    const calculateSuggestionsPosition = useCallback(() => {
        if (!textRef.current || !containerRef.current) return { top: 200, left: 20, width: 450 };

        const textRect = textRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const lastCharRect = getLastCharRect();

        // ウィンドウサイズに応じてサジェスト幅を調整
        const idealWidth = windowWidth < 640 ? windowWidth - 60 : 450;
        const maxWidth = Math.min(containerRect.width - 40, idealWidth);

        // 位置計算
        let top = textRect.bottom - containerRect.top + 5;
        let left = 20; // デフォルト値

        if (lastCharRect) {
            // 最後の文字の位置が取得できた場合
            top = lastCharRect.bottom - containerRect.top + 5;
            left = lastCharRect.right - containerRect.left;

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
    }, [windowWidth, getLastCharRect]);

    // 候補位置を更新 - メモ化
    const updateSuggestionsPosition = useCallback(() => {
        const newPosition = calculateSuggestionsPosition();
        setSuggestionsPosition(newPosition);

        // 位置計算完了フラグを設定
        if (!isPositionCalculated) {
            setIsPositionCalculated(true);
        }
    }, [calculateSuggestionsPosition, isPositionCalculated]);

    // 候補生成
    const suggestions = generateSuggestions(debugAutoCompleteWord || getLastWord(text));

    // クライアントサイドレンダリングの確認
    useEffect(() => {
        setIsClient(true);

        // ウィンドウサイズの初期設定
        setWindowWidth(window.innerWidth);
    }, []);

    // ウィンドウリサイズ時の処理
    useEffect(() => {
        if (!isClient) return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            updateSuggestionsPosition();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isClient, updateSuggestionsPosition]);

    // 初期レンダリング時とテキスト変更時にポジションを計算
    useEffect(() => {
        if (!isClient) return;

        // DOMの更新後に位置を計算するために少し遅延させる
        const timer = setTimeout(() => {
            updateSuggestionsPosition();
        }, 10);

        return () => clearTimeout(timer);
    }, [text, debugAutoCompleteWord, windowWidth, isClient, updateSuggestionsPosition]);

    // 初期レンダリング完了後に位置を計算
    useEffect(() => {
        if (!isClient) return;

        // DOMが完全にロードされた後に計算
        const timer = setTimeout(() => {
            updateSuggestionsPosition();
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [isClient, updateSuggestionsPosition]);

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
                            value={debugTextInput}
                            onChange={(e) => {
                                setDebugTextInput(e.target.value);
                                setText(e.target.value);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-gray-500 focus:border-gray-500 resize-y"
                            placeholder="表示するテキストを入力..."
                            rows={2}
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
                            モード: ビジネス / トーン: フォーマル
                        </span>
                    </div>
                </div>

                {/* テキスト表示エリア - word-wrapを追加 */}
                <div className="relative font-bold text-xl leading-relaxed mb-16">
                    <div
                        ref={textRef}
                        className="p-3 bg-white rounded-md border border-gray-200 min-h-[60px] break-words whitespace-pre-wrap"
                    >
                        {text}
                    </div>
                </div>

                {/* オートコンプリート候補 - クライアントサイドのみでレンダリング + 位置計算完了後に表示 */}
                {isClient && isPositionCalculated && (
                    <motion.div
                        className="absolute z-10 backdrop-blur-lg bg-white/95 border border-gray-200 rounded-md shadow-lg overflow-hidden divide-y divide-gray-300/40"
                        style={{
                            width: suggestionsPosition.width
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                            top: suggestionsPosition.top,
                            left: suggestionsPosition.left,
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
                        {suggestions.map((suggestion, index) => (
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
                                {showTranslation && (
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

                            {showTranslation && (
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
                        className={`px-3 py-1 sm:px-4 sm:py-2 text-sm rounded focus:outline-none focus:ring-2 transition-colors ${showTranslation
                            ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                            }`}
                    >
                        {showTranslation ? '英語訳を隠す' : '英語訳を表示'}
                    </button>
                </div>

                {/* デバッグ情報 */}
                <div className="mt-4 p-2 sm:p-3 bg-white rounded text-xs text-gray-500 border border-gray-200">
                    <p>生成された候補数: {suggestions.length} + スケルトン表示</p>
                    <p>現在のコンテキスト: {currentContext} / 現在のトーン: {currentTone}</p>
                    <p>サジェスト位置: top: {Math.round(suggestionsPosition.top)}px, left: {Math.round(suggestionsPosition.left)}px, width: {Math.round(suggestionsPosition.width)}px</p>
                    <p>クライアントレンダリング: {isClient ? 'はい' : 'いいえ'} / 位置計算完了: {isPositionCalculated ? 'はい' : 'いいえ'}</p>
                </div>
            </div>
        </div>
    );
}