import { getI18n } from "@/locale/server";
import { Suspense } from "react";
import { PublicPlansSection } from "@/components/subscription/public-plans-section";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function PricingPage() {
    const t = await getI18n();

    return (
        <div className="container max-w-5xl mx-auto py-10 px-4 sm:px-6">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold">{t("plans.heading")}</h1>
                <p className="text-muted-foreground mt-1">{t("plans.subheading")}</p>
            </div>

            <section>
                <Suspense fallback={<div className="flex justify-center py-8">Loading...</div>}>
                    <PublicPlansSection />
                </Suspense>
            </section>

            <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">
                    Ready to get started? Sign up now to access our powerful features.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/api/auth/login" className={buttonVariants({ variant: "default" })}>
                        {t("nav.signup")}
                    </Link>
                    <Link href="/api/auth/login" className={buttonVariants({ variant: "outline" })}>
                        {t("nav.signin")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
