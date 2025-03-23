"use client";

import React from "react";
import Link from "next/link";
import { buttonVariants } from "./button";
import { useI18n } from "@/locale/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

export function SignupDialog({
    isOpen,
    onClose
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const t = useI18n();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Subscribe to Wyssn</DialogTitle>
                    <DialogDescription>
                        To subscribe to our plans, you&apos;ll need to create an account first. Sign up now to get started.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col gap-3 sm:flex-col">
                    <Link
                        href="/api/auth/login"
                        className={buttonVariants({ variant: "default", className: "w-full" })}
                    >
                        {t("nav.signup")}
                    </Link>
                    <Link
                        href="/api/auth/login"
                        className={buttonVariants({ variant: "outline", className: "w-full" })}
                    >
                        {t("nav.signin")}
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
