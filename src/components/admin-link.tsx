"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";

export function AdminLink() {
    const { getPermission } = useKindeBrowserClient();
    const hasAdminPermission = getPermission("admin").isGranted;

    if (!hasAdminPermission) {
        return null;
    }

    return (
        <Link href="/admin" className="text-sm font-medium hover:underline">
            Admin Panel
        </Link>
    );
}
