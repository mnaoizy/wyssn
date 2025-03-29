import pino from 'pino';

// ロガーの基本設定
const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    formatters: {
        level: (label) => ({ level: label }),
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            '*.password',
            '*.token'
        ],
        censor: '**REDACTED**'
    }
});

// リクエストごとのロガーインスタンスを生成する関数
export const createRequestLogger = (requestId?: string) => {
    return logger.child({
        requestId: requestId || 'unknown',
        env: process.env.NODE_ENV || 'development'
    });
};

export default logger;
