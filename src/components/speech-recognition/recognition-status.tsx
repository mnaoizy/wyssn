"use client";

import { useCurrentLocale } from '@/locale/client';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

interface MessageType {
    no_speech: string;
    aborted: string;
    audio_capture: string;
    network: string;
    not_allowed: string;
    service_not_allowed: string;
    bad_grammar: string;
    language_not_supported: string;
    browser_not_supported: string;
}

// Message dictionary for all supported locales
const messages: Record<string, MessageType> = {
    'en-US': {
        no_speech: 'No speech was detected',
        aborted: 'Speech recognition was aborted',
        audio_capture: 'Audio capture failed',
        network: 'Network communication failed',
        not_allowed: 'Microphone access not allowed',
        service_not_allowed: 'Speech recognition service not allowed',
        bad_grammar: 'Invalid grammar format',
        language_not_supported: 'Language not supported',
        browser_not_supported: 'Browser does not support speech recognition'
    },
    'ja-JP': {
        no_speech: '音声が検出されませんでした',
        aborted: '音声認識が中止されました',
        audio_capture: '音声の取得に失敗しました',
        network: 'ネットワーク通信に失敗しました',
        not_allowed: 'マイクへのアクセスが許可されていません',
        service_not_allowed: '音声認識サービスが許可されていません',
        bad_grammar: '文法形式が無効です',
        language_not_supported: '言語がサポートされていません',
        browser_not_supported: 'ブラウザが音声認識をサポートしていません'
    },
    'fr-FR': {
        no_speech: 'Aucune parole détectée',
        aborted: 'La reconnaissance vocale a été interrompue',
        audio_capture: 'La capture audio a échoué',
        network: 'La communication réseau a échoué',
        not_allowed: 'Accès au microphone non autorisé',
        service_not_allowed: 'Service de reconnaissance vocale non autorisé',
        bad_grammar: 'Format de grammaire invalide',
        language_not_supported: 'Langue non prise en charge',
        browser_not_supported: 'Le navigateur ne prend pas en charge la reconnaissance vocale'
    },
    'de-DE': {
        no_speech: 'Keine Sprache erkannt',
        aborted: 'Spracherkennung wurde abgebrochen',
        audio_capture: 'Audioaufnahme fehlgeschlagen',
        network: 'Netzwerkkommunikation fehlgeschlagen',
        not_allowed: 'Mikrofonzugriff nicht erlaubt',
        service_not_allowed: 'Spracherkennungsdienst nicht erlaubt',
        bad_grammar: 'Ungültiges Grammatikformat',
        language_not_supported: 'Sprache nicht unterstützt',
        browser_not_supported: 'Browser unterstützt keine Spracherkennung'
    },
    'es-ES': {
        no_speech: 'No se detectó ninguna voz',
        aborted: 'El reconocimiento de voz fue interrumpido',
        audio_capture: 'Falló la captura de audio',
        network: 'Falló la comunicación de red',
        not_allowed: 'Acceso al micrófono no permitido',
        service_not_allowed: 'Servicio de reconocimiento de voz no permitido',
        bad_grammar: 'Formato de gramática inválido',
        language_not_supported: 'Idioma no soportado',
        browser_not_supported: 'El navegador no admite el reconocimiento de voz'
    },
    'zh-CN': {
        no_speech: '未检测到语音',
        aborted: '语音识别已中止',
        audio_capture: '音频捕获失败',
        network: '网络通信失败',
        not_allowed: '不允许访问麦克风',
        service_not_allowed: '不允许使用语音识别服务',
        bad_grammar: '语法格式无效',
        language_not_supported: '不支持该语言',
        browser_not_supported: '浏览器不支持语音识别'
    },
    'zh-TW': {
        no_speech: '未檢測到語音',
        aborted: '語音識別已中止',
        audio_capture: '音頻捕獲失敗',
        network: '網絡通信失敗',
        not_allowed: '不允許訪問麥克風',
        service_not_allowed: '不允許使用語音識別服務',
        bad_grammar: '語法格式無效',
        language_not_supported: '不支持該語言',
        browser_not_supported: '瀏覽器不支持語音識別'
    },
    'ko-KR': {
        no_speech: '음성이 감지되지 않았습니다',
        aborted: '음성 인식이 중단되었습니다',
        audio_capture: '오디오 캡처에 실패했습니다',
        network: '네트워크 통신에 실패했습니다',
        not_allowed: '마이크 접근이 허용되지 않았습니다',
        service_not_allowed: '음성 인식 서비스가 허용되지 않았습니다',
        bad_grammar: '잘못된 문법 형식입니다',
        language_not_supported: '지원되지 않는 언어입니다',
        browser_not_supported: '브라우저가 음성 인식을 지원하지 않습니다'
    },
    'pt-BR': {
        no_speech: 'Nenhuma fala detectada',
        aborted: 'O reconhecimento de fala foi interrompido',
        audio_capture: 'Falha na captura de áudio',
        network: 'Falha na comunicação de rede',
        not_allowed: 'Acesso ao microfone não permitido',
        service_not_allowed: 'Serviço de reconhecimento de fala não permitido',
        bad_grammar: 'Formato de gramática inválido',
        language_not_supported: 'Idioma não suportado',
        browser_not_supported: 'O navegador não suporta reconhecimento de fala'
    },
    'ru-RU': {
        no_speech: 'Речь не обнаружена',
        aborted: 'Распознавание речи было прервано',
        audio_capture: 'Не удалось записать аудио',
        network: 'Сбой сетевого соединения',
        not_allowed: 'Доступ к микрофону не разрешен',
        service_not_allowed: 'Служба распознавания речи не разрешена',
        bad_grammar: 'Недопустимый формат грамматики',
        language_not_supported: 'Язык не поддерживается',
        browser_not_supported: 'Браузер не поддерживает распознавание речи'
    },
    'uk-UA': {
        no_speech: 'Мовлення не виявлено',
        aborted: 'Розпізнавання мовлення перервано',
        audio_capture: 'Не вдалося записати аудіо',
        network: 'Помилка мережевого з\'єднання',
        not_allowed: 'Доступ до мікрофона не дозволено',
        service_not_allowed: 'Служба розпізнавання мовлення не дозволена',
        bad_grammar: 'Неприпустимий формат граматики',
        language_not_supported: 'Мова не підтримується',
        browser_not_supported: 'Браузер не підтримує розпізнавання мовлення'
    },
    'it-IT': {
        no_speech: 'Nessun discorso rilevato',
        aborted: 'Riconoscimento vocale interrotto',
        audio_capture: 'Acquisizione audio fallita',
        network: 'Comunicazione di rete fallita',
        not_allowed: 'Accesso al microfono non consentito',
        service_not_allowed: 'Servizio di riconoscimento vocale non consentito',
        bad_grammar: 'Formato grammaticale non valido',
        language_not_supported: 'Lingua non supportata',
        browser_not_supported: 'Il browser non supporta il riconoscimento vocale'
    },
    'vi-VN': {
        no_speech: 'Không phát hiện giọng nói',
        aborted: 'Nhận dạng giọng nói đã bị hủy bỏ',
        audio_capture: 'Ghi âm thất bại',
        network: 'Kết nối mạng thất bại',
        not_allowed: 'Không cho phép truy cập microphone',
        service_not_allowed: 'Dịch vụ nhận dạng giọng nói không được phép',
        bad_grammar: 'Định dạng ngữ pháp không hợp lệ',
        language_not_supported: 'Ngôn ngữ không được hỗ trợ',
        browser_not_supported: 'Trình duyệt không hỗ trợ nhận dạng giọng nói'
    },
    'hi-IN': {
        no_speech: 'कोई भाषण नहीं मिला',
        aborted: 'भाषण पहचान रद्द कर दी गई',
        audio_capture: 'ऑडियो कैप्चर विफल हुआ',
        network: 'नेटवर्क संचार विफल हुआ',
        not_allowed: 'माइक्रोफोन तक पहुंच की अनुमति नहीं है',
        service_not_allowed: 'भाषण पहचान सेवा की अनुमति नहीं है',
        bad_grammar: 'अमान्य व्याकरण प्रारूप',
        language_not_supported: 'भाषा समर्थित नहीं है',
        browser_not_supported: 'ब्राउज़र भाषण पहचान का समर्थन नहीं करता है'
    },
    'th-TH': {
        no_speech: 'ไม่พบเสียงพูด',
        aborted: 'การรู้จำเสียงถูกยกเลิก',
        audio_capture: 'การบันทึกเสียงล้มเหลว',
        network: 'การสื่อสารเครือข่ายล้มเหลว',
        not_allowed: 'ไม่อนุญาตให้เข้าถึงไมโครโฟน',
        service_not_allowed: 'ไม่อนุญาตให้ใช้บริการรู้จำเสียง',
        bad_grammar: 'รูปแบบไวยากรณ์ไม่ถูกต้อง',
        language_not_supported: 'ไม่รองรับภาษา',
        browser_not_supported: 'เบราว์เซอร์ไม่รองรับการรู้จำเสียง'
    }
};

interface RecognitionStatusProps {
    error: Error | null;
    isSupported: boolean;
}

export const RecognitionStatus: React.FC<RecognitionStatusProps> = ({
    error,
    isSupported
}) => {
    const locale = useCurrentLocale();
    const localeMessages = messages[locale]?.no_speech ? messages[locale] : messages['en-US'];

    useEffect(() => {
        if (error) {
            const errorType = error.message.startsWith('Error: ')
                ? error.message.substring(7)
                : error.message;

            switch (errorType) {
                case 'no-speech':
                    toast.error(localeMessages.no_speech, {
                        duration: 2000,
                        id: 'no-speech-toast'
                    });
                    break;
                case 'aborted':
                    toast.error(localeMessages.aborted, {
                        duration: 2000,
                        id: 'aborted-toast'
                    });
                    break;
                case 'audio-capture':
                    toast.error(localeMessages.audio_capture, {
                        duration: 2000,
                        id: 'audio-capture-toast'
                    });
                    break;
                case 'network':
                    toast.error(localeMessages.network, {
                        duration: 2000,
                        id: 'network-toast'
                    });
                    break;
                case 'not-allowed':
                    toast.error(localeMessages.not_allowed, {
                        duration: 2000,
                        id: 'not-allowed-toast'
                    });
                    break;
                case 'service-not-allowed':
                    toast.error(localeMessages.service_not_allowed, {
                        duration: 2000,
                        id: 'service-not-allowed-toast'
                    });
                    break;
                case 'bad-grammar':
                    toast.error(localeMessages.bad_grammar, {
                        duration: 2000,
                        id: 'bad-grammar-toast'
                    });
                    break;
                case 'language-not-supported':
                    toast.error(localeMessages.language_not_supported, {
                        duration: 2000,
                        id: 'language-not-supported-toast'
                    });
                    break;
                default:
                    toast.error(error.message, {
                        duration: 2000,
                        id: 'speech-error-toast'
                    });
            }
        }

        if (!isSupported) {
            toast.error(localeMessages.browser_not_supported, {
                duration: 2000,
                id: 'browser-not-supported-toast'
            });
        }
    }, [error, isSupported, locale, localeMessages]);

    return null;
};
