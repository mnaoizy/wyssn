import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma-client";
import { PlansSection } from "@/components/subscription/plans-section";
import { Suspense } from "react";
import { getI18n } from "@/locale/server";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { buttonVariants } from "@/components/ui/button";

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
    // Get user from database
    const dbUser = await db.user.findUnique({
        where: { kindeId: user.id },
        select: { stripeCustomerId: true }
    });

    if (!dbUser || !dbUser.stripeCustomerId) {
        // Redirect to subscription page if user doesn't have a Stripe customer ID
        redirect("/")
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });


    // Get query parameters
    const success = (await searchParams).success;
    const canceled = (await searchParams).canceled;
    const error = (await searchParams).error;

    const showSuccess = success === "true";
    const showCanceled = canceled === "true";
    const showError = error !== undefined;
    const errorType = error as string;

    // Initialize with null subscription
    let userSubscription = null;

    try {
        // First try to get the user without including subscriptions
        // This can help avoid complex join issues
        const userBasic = await db.user.findUnique({
            where: { kindeId: user.id },
            select: { id: true }
        });

        if (userBasic) {
            // If we can get the basic user, then try to get subscription details
            try {
                // Using a separate query for subscriptions can help avoid statement preparation issues
                const userSubs = await db.subscription.findMany({
                    where: { userId: userBasic.id },
                    orderBy: { createdAt: "desc" },
                    take: 1
                });

                userSubscription = userSubs[0] || null;

                // Note: We don't need to retrieve the full user details since
                // we have the basic user ID and subscription data
            } catch (subError) {
                console.error("Error fetching subscription data:", subError);
                // Continue with null subscription - we'll show the free plan
            }
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        // Continue with null subscription - we'll show the free plan
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4 sm:px-6">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{t("account.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("account.manageSubscription")}</p>
                </div>
                {userSubscription && (
                    <Link
                        href={portalSession.url}
                        className={buttonVariants({ variant: "secondary" })}
                    >
                        Manage Subscription
                    </Link>
                )}
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

            {showError && (
                <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
                    <p>
                        {errorType === "no-customer"
                            ? "You don't have a Stripe customer account yet. Please subscribe first."
                            : errorType === "portal-failed"
                                ? "Failed to access the billing portal. Please try again later."
                                : "An error occurred. Please try again."}
                    </p>
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
