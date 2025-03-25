import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma-client';
import { checkAdminPermission } from '../users/route';

export async function GET(request: Request) {
    try {
        await checkAdminPermission();

        // URLからロケールパラメータを取得
        const url = new URL(request.url);
        const locale = url.searchParams.get('locale');

        // 基本クエリ条件
        let whereClause = 'created_at >= NOW() - INTERVAL \'30 days\'';

        // ロケールが指定されている場合、条件を追加
        if (locale && locale !== 'all') {
            whereClause += ` AND locale = '${locale}'`;
        }

        // Define types for query results
        interface DailyStat {
            date: string;
            count: bigint;
            avgInputLength: number | null;
            avgRecentInputLength: number | null;
            uniqueUsers: bigint;
            locales: string[] | null;
        }

        interface SummaryStat {
            totalUsage: bigint;
            totalUsers: bigint;
            overallAvgInputLength: number | null;
            allLocales: string[] | null;
        }

        // 共通の動的クエリ条件を構築
        const dailyStatsQuery = `
            WITH daily_counts AS (
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count,
                    AVG(input_length) as "avgInputLength",
                    AVG(recent_input_length) as "avgRecentInputLength",
                    array_agg(DISTINCT locale) as locales
                FROM api_usage
                WHERE ${whereClause}
                GROUP BY DATE(created_at)
            ),
            daily_users AS (
                SELECT 
                    DATE(created_at) as date,
                    COUNT(DISTINCT user_id) as "uniqueUsers"
                FROM api_usage
                WHERE ${whereClause}
                GROUP BY DATE(created_at)
            )
            SELECT 
                dc.date,
                dc.count,
                dc."avgInputLength",
                dc."avgRecentInputLength",
                du."uniqueUsers",
                dc.locales
            FROM daily_counts dc
            JOIN daily_users du ON dc.date = du.date
            ORDER BY dc.date DESC
        `;

        // フィルタリングされた日別統計を取得
        const dailyStats = await db.$queryRawUnsafe<DailyStat[]>(dailyStatsQuery);

        // 選択したロケールに応じたサマリー統計を取得
        const summaryQuery = `
            WITH user_counts AS (
                SELECT COUNT(DISTINCT user_id) as "totalUsers" 
                FROM api_usage
                WHERE ${whereClause}
            )
            SELECT 
                COUNT(*) as "totalUsage",
                uc."totalUsers",
                AVG(input_length) as "overallAvgInputLength",
                array_agg(DISTINCT locale) as "allLocales"
            FROM api_usage, user_counts uc
            WHERE ${whereClause}
            GROUP BY uc."totalUsers"
        `;

        const summary = await db.$queryRawUnsafe<SummaryStat[]>(summaryQuery);

        // 常に全てのロケールリストを取得（ドロップダウン用）
        const allLocales = await db.$queryRaw<{ locale: string }[]>`
            SELECT DISTINCT locale
            FROM api_usage
            ORDER BY locale ASC
        `;

        // ロケールごとの使用状況をカウント
        const localeStats = await db.$queryRaw<{ locale: string, count: bigint }[]>`
            SELECT 
                locale,
                COUNT(*) as count
            FROM api_usage
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY locale
            ORDER BY count DESC
        `;

        // Format response with all available metrics
        const formattedDailyStats = dailyStats.map(stat => ({
            date: stat.date,
            count: Number(stat.count),
            avgInputLength: Number(stat.avgInputLength) || 0,
            avgRecentInputLength: Number(stat.avgRecentInputLength) || 0,
            uniqueUsers: Number(stat.uniqueUsers),
            locales: stat.locales || []
        }));

        const formattedSummary = {
            dailyStats: formattedDailyStats,
            totalUsage: Number(summary[0]?.totalUsage || 0),
            totalUsers: Number(summary[0]?.totalUsers || 0),
            overallAvgInputLength: Number(summary[0]?.overallAvgInputLength) || 0,
            // allLocalesは常に全ロケールリストを返す（ドロップダウン用）
            allLocales: allLocales.map(item => item.locale),
            // 現在のフィルターに該当するロケール（単一ロケール選択時）
            currentLocale: locale || 'all',
            // ロケール別の集計情報
            localeStats: localeStats.map(stat => ({
                locale: stat.locale,
                count: Number(stat.count)
            }))
        };

        return NextResponse.json(formattedSummary);
    } catch (error: unknown) {
        console.error('Error fetching usage stats:', error);
        if (error instanceof Error && error.message === 'Admin permission required') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch usage stats' },
            { status: 500 }
        );
    }
}