import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CompanyOverviewClient } from "@/components/company/CompanyOverviewClient";
import type { QnaPreviewSearchParams } from "@/config/qnaAccess";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyPageProps {
  params: Promise<{ companyId: string }>;
  /** 약사 인증 미리보기 쿼리 — ≤760px 기업 리뷰 펼침의 작성 유도 카드가 이 축으로 갈린다 */
  searchParams: Promise<QnaPreviewSearchParams>;
}

/** 프로필이 없을 때의 처리 방식(문구/라우트)은 기존과 동일 — Header는 이제 layout.tsx가 그려주므로 여기서는 빼둔다 */
function MissingCompany() {
  return (
    <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-[#f5f6f7] px-6 py-20">
      <section className="w-full max-w-[520px] border border-border bg-white p-8 text-center shadow-[var(--shadow)]">
        <p className="text-[13px] font-medium text-brand">기업정보</p>
        <h1 className="mt-2 text-[28px] font-bold text-[#202734]">기업 정보를 찾을 수 없습니다.</h1>
        <p className="mt-3 text-[15px] font-medium leading-[1.7] text-[#667181]">등록되지 않았거나 준비 중인 기업 페이지입니다.</p>
        <Link href="/jobs" className="mx-auto mt-6 inline-flex h-11 items-center gap-2 border border-[#111111] px-4 text-[13px] font-medium text-[#111111]">
          <ChevronLeft size={17} />
          채용공고 목록으로 돌아가기
        </Link>
      </section>
    </main>
  );
}

export default async function CompanyPage({ params, searchParams }: CompanyPageProps) {
  const { companyId } = await params;
  const profile = getCompanyProfile(companyId);

  if (!profile) {
    return <MissingCompany />;
  }

  return <CompanyOverviewClient profile={profile} searchParams={await searchParams} />;
}
