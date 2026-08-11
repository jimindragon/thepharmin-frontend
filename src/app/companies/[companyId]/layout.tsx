import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { CompanyHero } from "@/components/company/CompanyHero";
import { CompanyDetailTabs } from "@/components/company/CompanyDetailTabs";
import { getCompanyProfile } from "@/data/companyProfiles";

interface CompanyLayoutProps {
  children: ReactNode;
  params: Promise<{ companyId: string }>;
}

/**
 * 허브((hub) 라우트 그룹)와 무관한 형제 경로. companyProfiles.ts에 프로필이 있는 기업만 여기서
 * hero/탭 네비/app-shell을 렌더링한다 — 프로필이 없는 기업(대부분의 약국 등)은 Header만 공유하고
 * 나머지는 각 페이지(주로 CompanyFallbackShell)에 맡긴다. MissingCompany(기업 개요 전용 404류
 * 화면)는 스스로 전체 화면을 구성하므로 이 레이아웃이 app-shell을 덧씌우지 않는다.
 */
export default async function CompanyLayout({ children, params }: CompanyLayoutProps) {
  const { companyId } = await params;
  const profile = getCompanyProfile(companyId);

  if (!profile) {
    return (
      <>
        <Header />
        {children}
      </>
    );
  }

  return (
    <>
      <Header />
      {/* ≤760px pt-0 — 히어로가 풀블리드(9a715c1)라 좌우로 헤더와 같은 폭을 쓰는데, 위로만 24px 띄우면
          회색 띠 하나가 끼어 헤더에서 떨어져 나온 것처럼 보인다. 홈 히어로(23eae02)와 같은 처방이다.
          브레드크럼은 이 폭에서 이미 숨어 있어(PageBreadcrumb의 max-[760px]:hidden) 여백 계산에 없다. */}
      <main className="bg-[#f5f6f7] pb-24 pt-6 max-[760px]:pt-0">
        <div className="app-shell">
          <PageBreadcrumb className="mb-5" items={[{ label: "기업 인사이트" }, { label: profile.name }]} />
          <CompanyHero profile={profile} />
          <CompanyDetailTabs companyId={companyId} />
          {/* ≤760px mt-0 — 이 폭에서 히어로 바로 아래 오는 것은 어느 탭에서든 흰 탭 행 하나다(하위 탭은
              CompanyDetailTabs, 개요는 그 자리를 넘겨받은 SectionAnchorNav). 둘 다 sticky 바라 히어로에
              붙어 있어야 스크롤 중 헤더 밑으로 이어지고, 사이에 24px 회색 띠가 끼면 바가 아니라 카드처럼 뜬다.
              개요에서 이 mt가 곧 히어로~앵커 간격이고 하위 탭에서는 탭 행~본문 간격이라, 한 줄로 두 자리가 같이 0이 된다. */}
          <div className="mt-6 max-[760px]:mt-0">{children}</div>
        </div>
      </main>
    </>
  );
}
