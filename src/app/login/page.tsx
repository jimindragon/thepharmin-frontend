import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { PersonalLoginClient } from "@/components/login/PersonalLoginClient";

export const metadata: Metadata = {
  title: "로그인 | 더파마 리크루트",
};

interface PersonalLoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function PersonalLoginPage({ searchParams }: PersonalLoginPageProps) {
  const { redirect } = await searchParams;

  return (
    <>
      <AuthHeader />
      <PersonalLoginClient redirectTo={redirect || "/"} />
    </>
  );
}
