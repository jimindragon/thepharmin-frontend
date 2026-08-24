import type { Metadata } from "next";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { PharmacyReviewWriteGate } from "@/components/company/PharmacyReviewWriteGate";
import { ReviewWriteClient } from "@/components/company/ReviewWriteClient";
import { getPharmacyReviewWriteAccess } from "@/config/pharmacistLicenseGate";
import { resolveQnaViewerState, type QnaPreviewSearchParams } from "@/config/qnaAccess";
import { companies } from "@/data/companies";
import { getCompanyTrack } from "@/data/companyDirectory";
import { getCompanyProfile } from "@/data/companyProfiles";
import { resolvePharmacyDetail } from "@/data/pharmacyDetail";

interface CompanyReviewWritePageProps {
  params: Promise<{ companyId: string }>;
  /** 약사 인증 미리보기 쿼리(?pharmacist·?licenseEligible) — 약사 QNA가 쓰는 것과 같은 축이다 */
  searchParams: Promise<QnaPreviewSearchParams>;
}

export const metadata: Metadata = {
  title: "리뷰 작성 | THE PHARMA Recruit.",
};

/**
 * 현직자 리뷰 작성 목업 화면. 실제 저장 없이 ReviewWriteClient가 토스트 + 목록 이동만 수행한다.
 *
 * **약국 트랙만** 약사 인증 게이트를 지난다 — 원안이 인증된 약사에게만 이 후기를 허용한다.
 * 판정은 약사 QNA와 같은 축을 그대로 부르고(resolveQnaViewerState), 서버에서 가려 폼 자체가
 * 자격 없는 클라이언트로 내려가지 않게 한다(약사 QNA가 데이터를 걸러 내는 것과 같은 자리).
 * 면접 후기 작성과 나머지 세 트랙의 재직 후기 작성은 이 게이트를 타지 않는다.
 */
export default async function CompanyReviewWritePage({ params, searchParams }: CompanyReviewWritePageProps) {
  const { companyId } = await params;
  const profile = getCompanyProfile(companyId);
  const company = companies.find((item) => item.id === companyId);
  const pharmacy = resolvePharmacyDetail(companyId);
  const track = getCompanyTrack(companyId);

  const writeAccess =
    track === "pharmacy" ? getPharmacyReviewWriteAccess(await resolveQnaViewerState(await searchParams)) : "allowed";

  const body =
    writeAccess === "allowed" ? (
      <ReviewWriteClient companyId={companyId} companyName={company?.name ?? pharmacy?.name ?? "기업"} track={track} reviewType="company" />
    ) : (
      <div className="py-8">
        <PharmacyReviewWriteGate access={writeAccess} />
      </div>
    );

  if (!profile && !pharmacy) {
    return <CompanyFallbackShell>{body}</CompanyFallbackShell>;
  }

  return body;
}
