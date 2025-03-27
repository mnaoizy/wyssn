import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma-client";
import { PlansSection } from "@/components/subscription/plans-section";
import { Suspense } from "react";
import { getI18n } from "@/locale/server";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { buttonVariants } from "@/components/ui/button";
import { Redis } from '@upstash/redis';

type SearchParamsType = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AccountPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: SearchParamsType;
}) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const t = await getI18n();
    // We need to await the params but don't need to store it as a variable
    await params;
    const resolvedSearchParams = await searchParams;

    // Redirect to login if user is not authenticated
    if (!user || !user.id) {
        redirect("/");
    }

    // Get query parameters
    const success = resolvedSearchParams.success;
    const canceled = resolvedSearchParams.canceled;
    const error = resolvedSearchParams.error;

    const showSuccess = success === "true";
    const showCanceled = canceled === "true";
    const showError = error !== undefined;
    const errorType = error as string;

    // Initialize variables
    let userSubscription = null;
    let portalSessionUrl = null;
    let dbUserId: string | null = null;

    try {
        // First try to get the user without including subscriptions
        // This can help avoid complex join issues
        const userData = await db.user.findUnique({
            where: { kindeId: user.id },
            select: { id: true, stripeCustomerId: true },
        });

        if (userData) {
            dbUserId = userData.id;
            // If we can get the basic user, then try to get subscription details
            try {
                // Using a separate query for subscriptions can help avoid statement preparation issues
                const userSubs = await db.subscription.findMany({
                    where: { userId: userData.id },
                    orderBy: { createdAt: "desc" },
                    take: 1
                });

                userSubscription = userSubs[0] || null;

                // Create customer portal session
                if (userData.stripeCustomerId) {
                    const portalSession = await stripe.billingPortal.sessions.create({
                        customer: userData.stripeCustomerId,
                        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
                    });

                    if (portalSession.url) {
                        portalSessionUrl = portalSession.url;
                    }
                }
            } catch (subError) {
                console.error("Error fetching subscription data:", subError);
                // Continue with null subscription - we'll show the free plan
            }
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        // Continue with null subscription - we'll show the free plan
    }

    // Get usage data
    const redis = Redis.fromEnv();
    const currentUsage = dbUserId ? await redis.get<number>(`rate_limit:${dbUserId}`).catch(() => 0) : 0;
    const ttl = dbUserId ? await redis.ttl(`rate_limit:${dbUserId}`).catch(() => 0) : 0;

    // Get total API usage count
    const totalUsage = dbUserId ? await db.apiUsage.count({
        where: { userId: dbUserId }
    }) : 0;

    // Calculate reset time (current time + TTL seconds)
    const resetTime = new Date();
    resetTime.setSeconds(resetTime.getSeconds() + ttl);

    return (
        <div className="container max-w-5xl mx-auto py-10 px-4 sm:px-6">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{t("account.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("account.manage_subscription")}</p>
                </div>
                {userSubscription && portalSessionUrl && (
                    <Link
                        href={portalSessionUrl}
                        className={buttonVariants({ variant: "secondary" })}
                    >
                        {t("account.manage_subscription_button")}
                    </Link>
                )}
            </div>

            {showSuccess && (
                <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700">
                    <p>{t("account.subscription_success")}</p>
                </div>
            )}

            {showCanceled && (
                <div className="mb-6 rounded-md bg-amber-50 p-4 text-amber-700">
                    <p>{t("account.subscription_canceled")}</p>
                </div>
            )}

            {showError && (
                <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
                    <p>
                        {errorType === "no-customer"
                            ? t("account.error_no_customer")
                            : errorType === "portal-failed"
                                ? t("account.error_portal_failed")
                                : t("account.error_generic")}
                    </p>
                </div>
            )}

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-3">{t("account.user_info")}</h2>
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
                    <h2 className="text-xl font-semibold mb-3">{t("account.usage")}</h2>
                    <div className="rounded-md border border-gray-200 p-5 bg-white shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="font-medium text-sm text-gray-500">{t("account.today_usage")}</div>
                                <div>{currentUsage || 0} / 100</div>
                            </div>
                            <div>
                                <div className="font-medium text-sm text-gray-500">{t("account.total_usage")}</div>
                                <div>{totalUsage}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="font-medium text-sm text-gray-500">{t("account.reset_time")}</div>
                                <div>{resetTime.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">{t("account.subscription")}</h2>
                    <Suspense fallback={<div className="flex justify-center py-8">{t("account.loading")}</div>}>
                        <PlansSection userSubscription={userSubscription} subscriptionManagementUrl={portalSessionUrl} />
                    </Suspense>
                </section>

            </div>
        </div>
    );
}
