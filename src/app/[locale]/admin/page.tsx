"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";

interface UserWithSubscriptions extends User {
    subscriptions: {
        status: string;
        currentPeriodEnd: Date;
    }[];
}

export default function AdminPage() {
    const { isLoading, isAuthenticated, getPermission } = useKindeBrowserClient();
    const [users, setUsers] = useState<UserWithSubscriptions[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            redirect("/");
        }
    }, [isLoading, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);

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
    );
}
