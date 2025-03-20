import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma-client";
import { PlansSection } from "@/components/subscription/plans-section";
import { Suspense } from "react";
import { getI18n } from "@/locale/server";

export default async function AccountPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const t = await getI18n();

    // Redirect to login if user is not authenticated
    if (!user || !user.id) {
        redirect("/api/auth/login");
    }

    // Get query parameters
    const success = (await searchParams).success;
    const canceled = (await searchParams).canceled;
    const showSuccess = success === "true";
    const showCanceled = canceled === "true";

    // Initialize with null subscription
    let userSubscription = null;
    let dbUser = null;

    try {
        // Fetch user's subscription data
        dbUser = await db.user.findUnique({
            where: { kindeId: user.id },
            include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
        });

        // Current active subscription if any
        userSubscription = dbUser?.subscriptions[0] || null;
    } catch (error) {
        console.error("Error fetching user data:", error);
        // Continue with null subscription - we'll show the free plan
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t("account.title")}</h1>
                <p className="text-muted-foreground mt-1">{t("account.manageSubscription")}</p>
            </div>

            {showSuccess && (
                <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700">
                    <p>{t("account.subscriptionSuccess")}</p>
                </div>
            )}

            {showCanceled && (
                <div className="mb-6 rounded-md bg-amber-50 p-4 text-amber-700">
                    <p>{t("account.subscriptionCanceled")}</p>
                </div>
            )}

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-3">{t("account.userInfo")}</h2>
                    <div className="rounded-md border border-gray-200 p-5 bg-white shadow-sm">
                        <div className="mb-3">
                            <div className="font-medium text-sm text-gray-500">{t("account.name")}</div>
                            <div>{user.given_name} {user.family_name}</div>
                        </div>
                        <div>
                            <div className="font-medium text-sm text-gray-500">{t("account.email")}</div>
                            <div>{user.email}</div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">{t("account.subscription")}</h2>
                    <Suspense fallback={<div className="flex justify-center py-8">{t("account.loading")}</div>}>
                        <PlansSection userSubscription={userSubscription} />
                    </Suspense>
                </section>
            </div>
        </div>
    );
}
