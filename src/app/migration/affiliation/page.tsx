import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { AffiliationConfirmClient } from "@/components/migration/AffiliationConfirmClient";

export const metadata: Metadata = {
  title: "회원 정보 확인 | 더파마 리크루트",
};

interface MigrationAffiliationPageProps {
  /** 재동의 화면이 넘겨 준 "원래 가려던 곳". 확인 완료·나중에 하기 둘 다 여기로 보낸다. */
  searchParams: Promise<{ redirect?: string }>;
}

/**
 * 재동의(/migration) 다음 단계. 로그인 화면(login/page.tsx)과 같은 방식으로 redirect를 받고,
 * 헤더도 같은 AuthHeader를 쓴다 — 두 이관 화면이 같은 껍데기를 갖는다.
 */
export default async function MigrationAffiliationPage({ searchParams }: MigrationAffiliationPageProps) {
  const { redirect } = await searchParams;

  return (
    <>
      <AuthHeader />
      <AffiliationConfirmClient redirectTo={redirect || "/"} />
    </>
  );
}
