"use client";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <KindeProvider>{children}</KindeProvider>;
};