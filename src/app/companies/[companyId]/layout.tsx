import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { CompanyDetailHero } from "@/components/company/CompanyDetailHero";
import { CompanyDetailTabs } from "@/components/company/CompanyDetailTabs";
import { getCompanyProfile } from "@/data/companyProfiles";
import { resolvePharmacyDetail } from "@/data/pharmacyDetail";

interface CompanyLayoutProps {
  children: ReactNode;
  params: Promise<{ companyId: string }>;
}

/**
 * 허브((hub) 라우트 그룹)와 무관한 형제 경로. 프로필이 있는 기업과 **등록부에 있는 약국**이
 * 여기서 hero/탭 네비/app-shell을 렌더링한다 — 약국은 프로필 없이도 이름 하나로 그 껍데기를
 * 채울 수 있어(등록부가 기본 정보의 출처다) 얇은 별도 레이아웃을 두지 않는다. 둘 다 아닌 id만
 * Header만 공유하고 나머지를 각 페이지(주로 CompanyFallbackShell)에 맡긴다. MissingCompany
 * (기업 개요 전용 404류 화면)는 스스로 전체 화면을 구성하므로 이 레이아웃이 app-shell을 덧씌우지 않는다.
 */
export default async function CompanyLayout({ children, params }: CompanyLayoutProps) {
  const { companyId } = await params;
  const profile = getCompanyProfile(companyId);
  const pharmacy = profile ? null : resolvePharmacyDetail(companyId);
  /** 히어로·브레드크럼이 쓰는 최소 재료. 프로필이 있으면 그대로, 없으면 약국 이름 하나다 */
  const heroData = profile ?? (pharmacy ? { id: pharmacy.id, name: pharmacy.name } : null);

  if (!heroData) {
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
          <PageBreadcrumb className="mb-5" items={[{ label: "기업 인사이트" }, { label: heroData.name }]} />
          {/* 개요는 풀 히어로, 하위 탭은 컴팩트 바(≤760px 한정) — 경로 판정이 필요해 클라이언트 래퍼를 거친다 */}
          <CompanyDetailHero profile={heroData} companyId={companyId} />
          <CompanyDetailTabs companyId={companyId} />
          {/* ≤760px mt-0 — 개요 기준값이다. 이 폭에서 히어로 바로 아래 오는 것은 SectionAnchorNav(전폭 흰
              sticky 바)이고, 히어로에 붙어 있어야 스크롤 중 헤더 밑으로 이어진다. 사이에 24px 회색 띠가
              끼면 바가 아니라 카드처럼 뜬다. 개요에서 이 mt가 곧 앵커~본문 간격이기도 하다(앵커의 -mb-9와 한 쌍).
              하위 탭은 그 자리에 액자형 탭 행(CompanyDetailTabs)이 서고 sticky가 아니라 본문과 떨어져야 하는데,
              여기서는 경로를 알 수 없으므로(서버 컴포넌트) 그 간격은 탭 행 자신이 max-[760px]:mb-6으로 든다. */}
          <div className="mt-6 max-[760px]:mt-0">{children}</div>
        </div>
      </main>
    </>
  );
}
