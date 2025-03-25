"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserWithSubscriptions extends User {
    subscriptions: {
        status: string;
        currentPeriodEnd: Date;
    }[];
}

interface UsageStats {
    dailyStats: Array<{
        date: string;
        count: number;
        avgInputLength: number;
        avgRecentInputLength: number;
        uniqueUsers: number;
        locales: string[];
    }>;
    totalUsage: number;
    totalUsers: number;
    overallAvgInputLength: number;
    allLocales: string[];
    currentLocale?: string;
    localeStats?: Array<{
        locale: string;
        count: number;
    }>;
}

export default function AdminPage() {
    const { isLoading, isAuthenticated, getPermission } = useKindeBrowserClient();
    const [users, setUsers] = useState<UserWithSubscriptions[]>([]);
    const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLocale, setSelectedLocale] = useState<string>("all");

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            redirect("/");
        }
    }, [isLoading, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
            fetchUsageStats("all"); // 初期表示は全ロケール
        }
    }, [isAuthenticated]);

    // ロケール選択時に再フェッチ
    const handleLocaleChange = (locale: string) => {
        setSelectedLocale(locale);
        setLoading(true);
        fetchUsageStats(locale);
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) {
                throw new Error(response.status === 401 ?
                    'Unauthorized' : 'Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUsageStats = async (locale: string) => {
        try {
            // ロケールパラメータを付与してAPI呼び出し
            const url = locale === "all"
                ? '/api/admin/usage'
                : `/api/admin/usage?locale=${encodeURIComponent(locale)}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(response.status === 401 ?
                    'Unauthorized' : 'Failed to fetch usage stats');
            }
            const data = await response.json();
            setUsageStats(data);
        } catch (error) {
            console.error('Error fetching usage stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasAdminPermission = getPermission("admin").isGranted;
    if (!hasAdminPermission) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
                <div className="bg-white rounded-lg shadow p-4">
                    You don&apos;t have permission to access this page
                </div>
            </div>
        );
    }

    const getSubscriptionStatus = (user: UserWithSubscriptions) => {
        if (!user.subscriptions?.length) return "None";
        const activeSub = user.subscriptions.find(sub =>
            ["active", "trialing"].includes(sub.status)
        );
        return activeSub ? "Active" : "Inactive";
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">API Usage Statistics</h2>

                            {!loading && usageStats && usageStats.allLocales && usageStats.allLocales.length > 0 && (
                                <div className="w-48">
                                    <Select
                                        value={selectedLocale}
                                        onValueChange={handleLocaleChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by locale" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Locales</SelectItem>
                                            {usageStats?.allLocales?.map(locale => (
                                                <SelectItem key={locale} value={locale}>
                                                    {locale}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <div>Loading usage stats...</div>
                        ) : (
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium">
                                        Total API Calls: {usageStats?.totalUsage || 0}
                                        {selectedLocale !== "all" && (
                                            <span className="text-sm text-gray-500 ml-2">
                                                (Filtered by: {selectedLocale})
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-medium mb-4">Summary Statistics</h3>
                                        <div className="space-y-2">
                                            <p>Total API Calls: {usageStats?.totalUsage || 0}</p>
                                            <p>Total Unique Users: {usageStats?.totalUsers || 0}</p>
                                            <p>Average Input Length: {
                                                typeof usageStats?.overallAvgInputLength === 'number'
                                                    ? usageStats.overallAvgInputLength.toFixed(2)
                                                    : '0.00'
                                            } chars</p>

                                            {/* ロケール別使用量表示（オプショナル） */}
                                            {selectedLocale === "all" && usageStats?.localeStats && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium mb-2">Top Locales</h4>
                                                    <div className="max-h-40 overflow-y-auto">
                                                        <table className="min-w-full text-sm">
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-left">Locale</th>
                                                                    <th className="text-right">Usage</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {usageStats.localeStats.slice(0, 10).map(stat => (
                                                                    <tr key={stat.locale}>
                                                                        <td>{stat.locale}</td>
                                                                        <td className="text-right">{stat.count}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow">
                                        <h3 className="text-lg font-medium mb-4">Daily Statistics</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Users</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Input</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {usageStats?.dailyStats.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                                                                No data available for the selected locale.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        usageStats?.dailyStats.map((day) => (
                                                            <tr key={day.date}>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(day.date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {day.count}
                                                                </td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {day.uniqueUsers}
                                                                </td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {typeof day.avgInputLength === 'number'
                                                                        ? day.avgInputLength.toFixed(2)
                                                                        : '0.00'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold">User Management</h2>
                    </div>
                    {loading ? (
                        <div className="p-4">Loading users...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getSubscriptionStatus(user)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}