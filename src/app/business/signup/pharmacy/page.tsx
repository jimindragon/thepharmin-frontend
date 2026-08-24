import type { Metadata } from "next";
import { AuthHeader } from "@/components/shared/AuthHeader";
import { PharmacySignupClient } from "@/components/business/signup/PharmacySignupClient";

export const metadata: Metadata = {
  title: "약국 가입 | 더파마 리크루트",
  description: "약국을 운영하며 약사 인력을 채용하려는 약국장·관리약사를 위한 가입입니다.",
};

interface BusinessSignupPharmacyPageProps {
  /** 약국 상세의 "약국 인증하기"가 붙여 오는 등록부 id — 그 약국을 STEP1에 미리 세운다 */
  searchParams: Promise<{ pharmacyId?: string }>;
}

export default async function BusinessSignupPharmacyPage({ searchParams }: BusinessSignupPharmacyPageProps) {
  const { pharmacyId } = await searchParams;

  return (
    <>
      <AuthHeader />
      <PharmacySignupClient initialPharmacyId={pharmacyId} />
    </>
  );
}
