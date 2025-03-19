"use client";

import { I18nProviderClient } from "@/locale/client";
import { AuthProvider } from "@/providers/auth-provider";
import { ReactElement, use } from "react";


export default function Layout({
  children,
  params,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  return (
    <I18nProviderClient locale={locale}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </I18nProviderClient>
  );
}
