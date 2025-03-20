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

    // Fetch user's subscription data
    const dbUser = await db.user.findUnique({
        where: { kindeId: user.id },
        include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    // Current active subscription if any
    const userSubscription = dbUser?.subscriptions[0] || null;

    // Check for Stripe success or cancel message
    const showSuccess = (await searchParams).success === "true";
    const showCanceled = (await searchParams).canceled === "true";

    return (
        <div className="container py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{t("account.title")}</h1>
                <p className="text-muted-foreground">{t("account.manageSubscription")}</p>
            </div>

            {showSuccess && (
                <div className="mb-8 rounded-md bg-green-50 p-4 text-green-700">
                    <p>{t("account.subscriptionSuccess")}</p>
                </div>
            )}

            {showCanceled && (
                <div className="mb-8 rounded-md bg-amber-50 p-4 text-amber-700">
                    <p>{t("account.subscriptionCanceled")}</p>
                </div>
            )}

            <div className="grid gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">{t("account.userInfo")}</h2>
                    <div className="rounded-md border p-4">
                        <div className="mb-2">
                            <span className="font-medium">{t("account.name")}:</span> {user.given_name} {user.family_name}
                        </div>
                        <div>
                            <span className="font-medium">{t("account.email")}:</span> {user.email}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">{t("account.subscription")}</h2>
                    <Suspense fallback={<div>{t("account.loading")}</div>}>
                        <PlansSection userSubscription={userSubscription} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
