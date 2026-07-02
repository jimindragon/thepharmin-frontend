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
      <main className="bg-[#f5f6f7] pb-24 pt-6">
        <div className="app-shell">
          <PageBreadcrumb className="mb-5" items={[{ label: "기업정보" }, { label: profile.name }]} />
          <CompanyHero profile={profile} />
          <CompanyDetailTabs companyId={companyId} profile={profile} />
          {children}
        </div>
      </main>
    </>
  );
}
