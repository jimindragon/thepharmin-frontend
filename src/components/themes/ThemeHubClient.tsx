"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { PageHeader } from "@/components/PageHeader";
import { SortButtons } from "@/components/JobListToolbar";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { typeScale } from "@/components/ui/Typography";
import { companies } from "@/data/companies";
import { jobs } from "@/data/jobs";
import { THEME_META } from "@/data/taxonomy";
import type { ThemeMeta } from "@/data/taxonomy";
import type { Job, SortOption, ThemeId } from "@/types/jobs";
import type { Company } from "@/types/jobs";

// ── helpers ──────────────────────────────────────────────────────────────────

function sortJobs(items: Job[], sortOption: SortOption) {
  return [...items].sort((a, b) => {
    if (sortOption === "최신순") return b.dateOrder - a.dateOrder;
    if (sortOption === "마감임박순") return a.deadlineOrder - b.deadlineOrder;
    return Number(b.isRecommended) - Number(a.isRecommended) || b.dateOrder - a.dateOrder;
  });
}

function collectCompanies(themeJobs: Job[]) {
  const seen = new Set<string>();
  const result: Company[] = [];
  for (const job of themeJobs) {
    if (job.companyId && !seen.has(job.companyId)) {
      seen.add(job.companyId);
      const company = companies.find((c) => c.id === job.companyId);
      if (company) result.push(company);
    }
  }
  return result;
}

// ── static sidebar data ───────────────────────────────────────────────────────

interface ThemeNewsArticle {
  id: string;
  date: string;
  title: string;
  href: string;
}

const THEME_NEWS: Record<ThemeId, ThemeNewsArticle[]> = {
  T1: [
    { id: "t1-n1", date: "2024.06.20", title: "외자계 한국법인, 올해 임상·허가 직군 채용 확대", href: "https://www.thepharmanews.com/news/global-pharma-korea-hiring" },
    { id: "t1-n2", date: "2024.06.05", title: "글로벌 빅파마 R&D 센터 국내 확충…이중 언어 인재 수요 증가", href: "https://www.thepharmanews.com/news/bigpharma-rd-korea" },
    { id: "t1-n3", date: "2024.05.18", title: "외자계 취업 전략: 영어 면접·글로벌 역량 체크리스트", href: "https://www.thepharmanews.com/news/global-pharma-interview" },
  ],
  T2: [
    { id: "t2-n1", date: "2024.06.18", title: "국내 대형 제약사, 상반기 신입·경력 공채 일정 발표", href: "https://www.thepharmanews.com/news/bigpharma-recruit-2024" },
    { id: "t2-n2", date: "2024.06.02", title: "제약업계 연봉 비교: 2024년 대기업 처우 현황", href: "https://www.thepharmanews.com/news/pharma-salary-2024" },
    { id: "t2-n3", date: "2024.05.20", title: "국내 제약 빅3, 글로벌 시장 확장…해외 업무 경험자 우대", href: "https://www.thepharmanews.com/news/domestic-pharma-global" },
  ],
  T3: [
    { id: "t3-n1", date: "2024.06.15", title: "CDMO 빅4, 바이오 생산 설비 증설로 인력 수요 급증", href: "https://www.thepharmanews.com/news/cdmo-capacity-2024" },
    { id: "t3-n2", date: "2024.06.01", title: "삼성바이오·셀트리온 하반기 채용 규모 전망", href: "https://www.thepharmanews.com/news/bio-company-hire-h2" },
    { id: "t3-n3", date: "2024.05.22", title: "GMP 전문 인력 부족…품질·생산 직무 연봉 상승 추세", href: "https://www.thepharmanews.com/news/gmp-talent-shortage" },
  ],
  T4: [
    { id: "t4-n1", date: "2024.06.22", title: "제약·바이오 벤처, 기술특례 상장 이후 채용 급증", href: "https://www.thepharmanews.com/news/bioventure-ipo-hiring" },
    { id: "t4-n2", date: "2024.06.08", title: "국내 혁신 신약 벤처 투자 유치 현황과 채용 트렌드", href: "https://www.thepharmanews.com/news/bioventure-investment" },
    { id: "t4-n3", date: "2024.05.25", title: "스타트업 바이오 입사 전 확인할 것: 파이프라인·자금 현황", href: "https://www.thepharmanews.com/news/bioventure-checklist" },
  ],
  T5: [
    { id: "t5-n1", date: "2024.06.19", title: "MFDS, 혁신 의약품 허가 절차 간소화…RA 직무 역할 변화", href: "https://www.thepharmanews.com/news/mfds-ra-2024" },
    { id: "t5-n2", date: "2024.06.04", title: "글로벌 RA 규제 대응 인력, 국내 기업 수요 지속 증가", href: "https://www.thepharmanews.com/news/global-ra-demand" },
    { id: "t5-n3", date: "2024.05.21", title: "CTD 작성부터 허가 전략까지: RA 커리어 로드맵", href: "https://www.thepharmanews.com/news/ra-career-roadmap" },
  ],
  T6: [
    { id: "t6-n1", date: "2024.06.17", title: "국내 임상시험 건수 사상 최고…CRO·스폰서 동시 채용", href: "https://www.thepharmanews.com/news/clinical-trial-record" },
    { id: "t6-n2", date: "2024.06.03", title: "GCP 개정안 시행 앞두고 임상 모니터링 인력 교육 수요 급증", href: "https://www.thepharmanews.com/news/gcp-2024-update" },
    { id: "t6-n3", date: "2024.05.16", title: "CRA에서 PM으로: 임상 직무 커리어 전환 가이드", href: "https://www.thepharmanews.com/news/cra-to-pm-guide" },
  ],
  T7: [
    { id: "t7-n1", date: "2024.06.21", title: "FDA·EMA GMP 실사 강화, 품질 조직 역할 재조명", href: "https://www.thepharmanews.com/news/gmp-inspection-2024" },
    { id: "t7-n2", date: "2024.06.07", title: "국내 CDMO 품질 인력 부족, QA·QC 연봉 10% 상승", href: "https://www.thepharmanews.com/news/qa-qc-salary" },
    { id: "t7-n3", date: "2024.05.23", title: "CAPA·일탈 관리 경험 어떻게 쌓을까: QA 현직자 인터뷰", href: "https://www.thepharmanews.com/news/qa-career-guide" },
  ],
  T8: [
    { id: "t8-n1", date: "2024.06.16", title: "MSL 역할 확대…KOL 전략부터 리얼월드 데이터까지", href: "https://www.thepharmanews.com/news/msl-role-2024" },
    { id: "t8-n2", date: "2024.06.02", title: "메디컬 어페어스 팀, 제약사 내 위상 높아진 배경", href: "https://www.thepharmanews.com/news/medical-affairs-rising" },
    { id: "t8-n3", date: "2024.05.19", title: "임상의에서 MSL로: 직무 전환 성공 사례와 준비 방법", href: "https://www.thepharmanews.com/news/doctor-to-msl" },
  ],
  T9: [
    { id: "t9-n1", date: "2024.06.23", title: "국내 제약 BD 딜 상반기 결산, 기술이전 건수 역대 최고", href: "https://www.thepharmanews.com/news/bd-deals-h1-2024" },
    { id: "t9-n2", date: "2024.06.09", title: "라이선싱 협상 전문가 부족…글로벌 계약 경험자 연봉 급등", href: "https://www.thepharmanews.com/news/licensing-expert-shortage" },
    { id: "t9-n3", date: "2024.05.26", title: "BD 직무 입문 가이드: 사업개발팀이 찾는 인재 유형", href: "https://www.thepharmanews.com/news/bd-career-guide" },
  ],
};

// ── sidebar panels ────────────────────────────────────────────────────────────

function SidebarPanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">
      <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
      {children}
    </h2>
  );
}

function RelatedThemesPanel({ currentThemeId }: { currentThemeId: ThemeId }) {
  const related = useMemo(
    () =>
      Object.values(THEME_META)
        .filter((m) => m.id !== currentThemeId)
        .slice(0, 3),
    [currentThemeId],
  );

  return (
    <section className="border border-[#e5e9ef] bg-white p-5">
      <SidebarPanelHeading>관련 채용관</SidebarPanelHeading>
      <ul className="mt-4 space-y-3.5">
        {related.map((meta) => (
          <li key={meta.id}>
            <Link href={`/themes/${meta.id}`} className="group flex items-start gap-3 transition hover:opacity-70">
              <span className="min-w-0">
                <span className="block text-[11px] font-medium text-[#8a94a3]">{meta.subtitle}</span>
                <span className="mt-0.5 block truncate text-[13px] font-medium text-[#303946] group-hover:text-[#111111]">
                  {meta.label}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ThemeNewsPanel({ themeId }: { themeId: ThemeId }) {
  const newsItems = THEME_NEWS[themeId] ?? [];
  if (newsItems.length === 0) return null;

  return (
    <section className="border border-[#e5e9ef] bg-white p-5">
      <SidebarPanelHeading>관련 뉴스</SidebarPanelHeading>
      <ol className="mt-4 space-y-3.5">
        {newsItems.map((news, index) => (
          <li key={news.id}>
            <a
              href={news.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 transition hover:opacity-70"
            >
              <span className="shrink-0 text-[15px] font-bold text-[#a0a9b7]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-medium text-[#8a94a3]">{news.date}</span>
                <span className="mt-0.5 block text-[13px] font-medium leading-[1.45] text-[#303946]">
                  {news.title}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── middle section panel ──────────────────────────────────────────────────────

function CompanyPanel({
  themeJobs,
  themeLabel,
}: {
  themeJobs: Job[];
  themeLabel: string;
}) {
  const themeCompanies = useMemo(() => collectCompanies(themeJobs), [themeJobs]);
  if (themeCompanies.length === 0) return null;

  return (
    <section className="mt-8 border-t border-[#eeeeee] pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#111111]">이 채용관의 기업</h2>
        <Link href="/companies" className="text-[13px] text-[#888888] transition hover:text-[#111111]">
          기업정보 전체보기 &rsaquo;
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 border-t border-[#eeeeee] pt-5 sm:grid-cols-2 lg:grid-cols-3">
        {themeCompanies.map((company) => {
            const jobCount = themeJobs.filter((j) => j.companyId === company.id).length;
            return (
              <div
                key={company.id}
                className="flex flex-col justify-between rounded-[var(--radius)] border border-[#e5e5e5] bg-white p-5"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <EntityLogo
                      name={company.name}
                      logoText={company.logoText}
                      logoUrl={company.logoUrl}
                      size={40}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#111111]">{company.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#17a68c]" />
                        <span className="text-[12px] text-[#17a68c]">{themeLabel}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-[#666666]">
                    {company.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                  <span className="text-[12px] text-[#888888]">{jobCount}개 포지션</span>
                  <Link
                    href={`/companies/${company.id}`}
                    className="text-[12px] font-medium text-[#555555] transition hover:text-[#111111]"
                  >
                    기업 보기 &rsaquo;
                  </Link>
                </div>
              </div>
            );
        })}
      </div>
    </section>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function ThemeHubClient({ themeId, theme }: { themeId: ThemeId; theme: ThemeMeta }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("추천순");

  const themeJobs = useMemo(() => jobs.filter((j) => j.themes?.includes(themeId)), [themeId]);
  const themeCompanies = useMemo(() => collectCompanies(themeJobs), [themeJobs]);
  const sortedJobs = useMemo(() => sortJobs(themeJobs, sortOption), [themeJobs, sortOption]);

  const toggleBookmark = (jobId: number) => {
    setBookmarkedIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Header />
      <main className="pb-20">
        <div className="app-shell pt-8">
          {/* ── Page header ────────────────────────────────────────────────── */}
          <PageHeader
            breadcrumbLabel="테마별 채용관"
            eyebrow="THE PHARMA THEMES"
            title={theme.label}
          />
          {/* Description outside PageHeader so it has no max-width cap → 한 줄 표시 */}
          <p className={clsx("mt-3", typeScale.body, "text-[#596373]")}>{theme.description}</p>
          {themeCompanies.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-[12px] text-[#888888]">참여 기업</span>
              {themeCompanies.map((company) => (
                <span key={company.id} className="text-[13px] font-semibold text-[#222222]">
                  {company.name}
                </span>
              ))}
            </div>
          )}

          {/* ── 기업 카드 섹션: 모든 테마 동일 렌더링 ──────────────────────── */}
          <CompanyPanel themeJobs={themeJobs} themeLabel={theme.label} />

          {/* ── 2-column: job listing + sidebar ───────────────────────────── */}
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_280px] gap-8 border-t border-[#eeeeee] pt-8 max-[1024px]:grid-cols-1">
            {/* Main: job list */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[#111111]">
                  이 채용관의 공고 <span>{themeJobs.length}</span>
                </h2>
                <SortButtons sortOption={sortOption} onChange={setSortOption} />
              </div>

              {sortedJobs.length === 0 ? (
                <div className="py-20 text-center text-[14px] text-[#888888]">
                  현재 채용 중인 공고가 없습니다.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#eeeeee] border-t border-[#eeeeee]">
                  {sortedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isBookmarked={bookmarkedIds.includes(job.id)}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-5 max-[1024px]:mt-4">
              <RelatedThemesPanel currentThemeId={themeId} />
              <ThemeNewsPanel themeId={themeId} />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
