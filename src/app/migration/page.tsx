import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { MigrationClient } from "@/components/migration/MigrationClient";

export const metadata: Metadata = {
  title: "약관 개정 안내 | 더파마 리크루트",
};

interface MigrationPageProps {
  /** MigrationGuard가 붙여 준 "원래 가려던 곳". 소속 확인까지 넘겨 마지막에 그곳으로 돌려보낸다. */
  searchParams: Promise<{ redirect?: string }>;
}

/** 로고만 있는 헤더(AuthHeader)를 쓴다 — 가입·로그인 계열과 같이 도중에 다른 곳으로 새지 않게 한다. */
export default async function MigrationPage({ searchParams }: MigrationPageProps) {
  const { redirect } = await searchParams;

  return (
    <>
      <AuthHeader />
      <MigrationClient redirectTo={redirect || "/"} />
    </>
  );
}
