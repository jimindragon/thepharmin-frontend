import clsx from "clsx";
import type { Metadata } from "next";
import { FLUSH_GRID_CLASS } from "@/components/flushListStyles";
import { CompanyFallbackShell } from "@/components/company/CompanyFallbackShell";
import { CompanyReviewCard } from "@/components/company/CompanyReviewCard";
import { CompanyMobileOverviewRedirect } from "@/components/company/CompanyMobileOverviewRedirect";
import { CompanyReviewWriteCard } from "@/components/company/CompanyReviewWriteCard";
import { PharmacyReviewsListClient } from "@/components/company/PharmacyReviewsListClient";
import { companyAnchorIds } from "@/config/companyDetailAnchors";
import { companyReviews } from "@/data/companies";
import { getCompanyTrack } from "@/data/companyDirectory";
import { toCompanyReviewCardItem } from "@/data/companyReviewItems";
import { getCompanyProfile } from "@/data/companyProfiles";
import { readPersonalSession } from "@/lib/session.server";

interface CompanyReviewsPageProps {
  params: Promise<{ companyId: string }>;
}

export const metadata: Metadata = {
  title: "기업 리뷰 | THE PHARMA Recruit.",
};

/** 기업 리뷰(회사 후기)의 열람 게이팅은 **약국 트랙에만** 있다 — 그쪽은 근무 조건이 후기의 실질이라
 * 면접 후기와 같은 열람권을 나눠 쓰고(PharmacyReviewsListClient), 나머지 세 트랙은 종전대로 전체 공개다.
 * 잠금은 서버가 content를 비워서가 아니라 클라이언트 상태기계가 걸므로 이 페이지는 어느 트랙이든 원문을 내려준다.
 * KeywordReview 기반 요약 섹션(긍정/개선 키워드 포함)은 제거됐다 — companyReviews 원문 목록 하나가 이 페이지의 전체 내용이다.
 * 작성 카드의 로그인 분기만 개인 세션 쿠키를 본다 — 본문 열람 게이팅과는 무관하다. */
export default async function CompanyReviewsPage({ params }: CompanyReviewsPageProps) {
  const { companyId } = await params;
  const isLoggedIn = await readPersonalSession();
  const profile = getCompanyProfile(companyId);

  /* 매핑은 개요의 인라인 펼침과 공유한다(companyReviewItems) — 같은 후기가 두 화면에서 다르게 보이지 않도록 */
  const items = companyReviews
    .filter((review) => review.companyId === companyId && review.type === "company")
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .map(toCompanyReviewCardItem);

  /* ≤760px에서 이 목록이 화면 본문의 전부다 — 회색 배경 위 카드 격자가 아니라 전폭 낱장 목록으로 접는다.
     탭 행·본문 카드가 이미 전폭이라 목록만 액자로 남으면 한 화면 안에서 두 문법이 부딪힌다.
     border-y는 흰 블록의 시작·끝을 확정하는 자리다: 섹션 카드(FLUSH_SECTION_CLASS)와 달리 이 목록에는
     감싸는 셸이 없어, 위아래 1px이 없으면 회색 배경으로 그대로 번진다. */
  const body =
    getCompanyTrack(companyId) === "pharmacy" ? (
      <PharmacyReviewsListClient companyId={companyId} items={items} isLoggedIn={isLoggedIn} />
    ) : (
      <div className={clsx("grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1", FLUSH_GRID_CLASS, "max-[760px]:border-y max-[760px]:border-border")}>
        <CompanyReviewWriteCard companyId={companyId} reviewType="company" isLoggedIn={isLoggedIn} hasItems={items.length > 0} />
        {items.map((item) => (
          <CompanyReviewCard key={item.id} review={item} />
        ))}
      </div>
    );

  /* 프로필이 없는 기업은 개요가 MissingCompany라 돌려보낼 곳이 없다 — 가드를 씌우지 않는다.
     companyDirectory.detailHref가 그런 기업을 이 페이지로 폴백시키므로 실제로 자주 밟는 갈래다. */
  if (!profile) {
    return <CompanyFallbackShell>{body}</CompanyFallbackShell>;
  }

  return (
    <CompanyMobileOverviewRedirect companyId={companyId} anchorId={companyAnchorIds.reviews}>
      {body}
    </CompanyMobileOverviewRedirect>
  );
}
