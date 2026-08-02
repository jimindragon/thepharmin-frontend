import type { Metadata } from "next";
import { BusinessLoginClient } from "@/components/business/BusinessLoginClient";

export const metadata: Metadata = {
  title: "기업 로그인 | 더파마 리크루트",
};

interface BusinessLoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function BusinessLoginPage({ searchParams }: BusinessLoginPageProps) {
  const { redirect } = await searchParams;

  return <BusinessLoginClient redirectTo={redirect || "/business/dashboard"} />;
}
