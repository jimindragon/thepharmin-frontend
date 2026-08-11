"use client";

import clsx from "clsx";
import { ArrowRight, Bookmark, Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { CarouselControl } from "@/components/RecommendedJobs";
import { FeaturedJobsSection } from "@/components/home/FeaturedJobsSection";
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { typeScale } from "@/components/ui/Typography";
import { APPLY_METHOD_SHORT_LABELS } from "@/config/applyMethods";
import { companyLogos } from "@/config/companyImages";
import { FEATURED_COMPANY_IDS, getActiveJobCount } from "@/data/companyDirectory";
import { homeRecommendationJobIds, premiumCompanies, themeCurationCards, type HomeTrackFilter } from "@/data/home";
import { hasJobDetail } from "@/data/jobDetailIndex";
import { jobs } from "@/data/jobs";
import { homeSpotlightSlugs, recommendedJobs } from "@/data/recommendedJobs";
import { useHorizontalCarousel } from "@/hooks/useHorizontalCarousel";
import type { Job } from "@/types/jobs";
import { getCompanyInitial } from "@/utils/companyInitial";
import { formatJobDeadlineLabel, isJobDeadlineUrgent } from "@/utils/dday";

function PremiumCompanies({ activeTrack }: { activeTrack: HomeTrackFilter }) {
  const trackCompanies = activeTrack === "all" ? premiumCompanies : premiumCompanies.filter((company) => company.track === activeTrack);
  // FEATURED_COMPANY_IDS에 속한 기업을 앞으로 — Array.prototype.sort는 안정 정렬이라 나머지는 원래 순서를 유지한다
  const visibleCompanies = [...trackCompanies].sort((a, b) => {
    const aFeatured = FEATURED_COMPANY_IDS.includes(a.id) ? 0 : 1;
    const bFeatured = FEATURED_COMPANY_IDS.includes(b.id) ? 0 : 1;
    return aFeatured - bFeatured;
  });
  const { containerRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel<HTMLDivElement>();

  return (
    <section className="mt-14">
      <SectionHeader
        title="업계를 이끄는 기업"
        action={
          <div className="hidden shrink-0 md:block">
            <CarouselControl
              onPrev={scrollPrev}
              onNext={scrollNext}
              canGoPrev={canScrollPrev}
              canGoNext={canScrollNext}
              prevLabel="이전 기업"
              nextLabel="다음 기업"
            />
          </div>
        }
        viewAll={{ href: "/companies" }}
      />
      {/* ≤760px에서 "한 판에 칸을 나눈 표"(공용 테두리 + 카드 사이 세로선)를 버리고 테마별 공고처럼 낱장 카드가
          gap으로 떨어진 행으로 바꾼다. 폭이 좁아질수록 붙은 칸은 카드가 아니라 잘린 표로 읽혀,
          "옆으로 밀 수 있다"는 신호가 죽는다.

          우측만 셸 거터 밖으로 빼(-mr) 스크롤 행이 화면 오른쪽 끝까지 닿게 한다. 왼쪽은 그대로라 첫 카드가
          섹션 제목과 같은 선에서 시작하고, 늘어난 24px은 전부 "다음 카드 미리보기"로 간다.
          이 24px이 카드 2.2장 노출(2.23장)과 2.06장의 차이다 — 없으면 세 번째 카드가 6px만 비어져 안 읽힌다.
          행 끝 pr-6은 끝까지 밀었을 때 마지막 카드가 화면 모서리에 부딪히지 않게 하는 여백이다. */}
      <div
        ref={containerRef}
        className="premium-scrollbar overflow-x-auto border border-[#dddddd] bg-white max-[760px]:-mr-[calc(var(--shell-gutter)/2)] max-[760px]:border-0 max-[760px]:bg-transparent"
      >
        <div className="flex min-w-max max-[760px]:gap-2 max-[760px]:pr-6">
          {visibleCompanies.map((company) => {
            const logoSrc = companyLogos[company.name];
            const description = company.lines.join(" · ");
            const activeJobCount = getActiveJobCount(company.id);

            return (
              <div
                key={company.id}
                data-carousel-item
                /* ≤760px 카드 폭 300 → 200 → 160(0.8배). 200에서도 1.71장이라 두 번째 카드는 걸렸지만
                   세 번째가 전혀 안 보여 "몇 개나 더 있는지"가 안 읽혔다. 160 + gap 8 + 행 우측 블리드로
                   2.23장이 되어 세 번째 카드가 30px 비어진다.
                   안쪽 여백(px-5 py-5 = 20px)은 그대로다 — 모바일 가이드라인이 정한 카드 패딩 바닥값이라
                   여기서 더 내리지 않는다. 대신 세로 리듬(로고→이름→설명→풋터)을 한 단계씩 당겨 높이를 줄인다.
                   160 − px-5×2 = 120px이 글이 쓸 수 있는 폭이다. */
                className="premium-company-card relative z-0 flex min-h-[240px] w-[300px] shrink-0 flex-col border-r border-[#dddddd] px-7 py-[28px] transition-colors duration-[180ms] last:border-r-0 max-[760px]:min-h-[160px] max-[760px]:w-[160px] max-[760px]:border max-[760px]:border-[#dddddd] max-[760px]:bg-white max-[760px]:px-5 max-[760px]:py-5 max-[760px]:last:border-r"
              >
                <Link href={`/companies/${company.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">{company.name} 기업정보 보기</span>
                </Link>
                {/* 로고 유무와 무관하게 고정 높이로 렌더 — 폴백 텍스트도 이 안에서 세로 중앙 정렬되어 아래 요소들의 시작 위치가 모든 카드에서 동일하다.
                    ≤760px 로고 칸 40 → 36, 최대 폭 160 → 120: 카드 안쪽 폭이 딱 120px(160 − px-5×2)이라 그보다 크면 로고가 칸을 넘는다. */}
                <div className="flex h-10 items-center max-[760px]:h-9">
                  {logoSrc ? (
                    <img src={logoSrc} alt={company.name} className="max-h-[34px] w-auto max-w-[160px] object-contain max-[760px]:max-h-[30px] max-[760px]:max-w-[120px]" />
                  ) : (
                    <span className="max-w-[160px] truncate text-[13px] font-medium text-[#171b20]/60 max-[760px]:max-w-[120px]">{getCompanyInitial(company.name)}</span>
                  )}
                </div>
                {/* ≤760px 세로 여백 한 단계씩: 로고→이름 24→12, 이름→설명 8→6, 설명→풋터 24→12, 구분선→풋터 글 12→8
                    이름 17 → 16(모바일 위계 압축표). 설명 13·풋터 12·13은 15px 바닥 아래라 그대로 둔다. */}
                <h3 className={clsx(typeScale.cardTitle, "mt-6 truncate text-[#15191f] max-[760px]:mt-3 max-[760px]:text-[16px]")}>{company.name}</h3>
                {/* min-h로 한 줄 캡션도 두 줄 높이를 차지 — 풋터 구분선 시작 위치를 카드마다 통일한다 */}
                <p className="mt-2 line-clamp-2 min-h-[42px] text-[13px] font-normal leading-[1.6] text-[#777777] max-[760px]:mt-1.5">{description}</p>
                <div className="mt-6 border-t border-[#ececec] pt-3 max-[760px]:mt-3 max-[760px]:pt-2">
                  <Link
                    href={`/companies/${company.id}/jobs`}
                    className="relative z-20 flex items-center justify-between"
                  >
                    <span className="text-[12px] font-medium text-[#aaaaaa]">채용중 공고</span>
                    <strong className="premium-company-card-count text-[13px] font-bold text-[#111111]">{activeJobCount}건</strong>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecruiterSolutionBanner() {
  return (
    <section className="mt-6 border border-border bg-[#fafafa] px-6 py-5">
      {/* 행 전체가 링크라 반전도 행 전체에서 걸리게 한다 — 버튼 span에만 hover를 두면
          문구 쪽에 커서를 올렸을 때 클릭은 되는데 버튼은 반응하지 않아 어긋나 보인다.
          ≤760px 재구성은 RecommendedJobs의 HeadhuntingNoticeRow와 한 벌이다 — 한쪽만 고치지 말 것. */}
      <Link href="/business" className="group flex items-center justify-between gap-6">
        {/* 문구+버튼을 한 겹 더 싸서, 데스크톱은 이 겹이 폭을 다 먹고 좌우로 벌리고(종전과 같은 렌더)
            ≤760px는 세로로 쌓여 좌측 정렬 덩어리가 된다. 우측 아이콘은 이 겹 밖이라 항상 행 끝에 선다. */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-4">
          <p className="text-[15px] font-medium text-[#333333]">
            채용을 준비 중인{" "}
            <br className="hidden max-[760px]:inline" />
            담당자이신가요?
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 border border-[#111111] px-4 py-2 text-[13px] font-medium text-[#111111] transition-colors group-hover:bg-[#111111] group-hover:text-white">
            채용 솔루션 알아보기
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
        {/* ≤760px 전용 장식. 문구가 2줄로 접히며 우측에 생긴 빈 칸을 메우는 역할이라 정보를 얹지 않는다 —
            점 인디케이터와 같은 #d1d6dd로 눌러 두어 문구·버튼과 위계를 다투지 않게 한다. */}
        <Building2 className="hidden h-9 w-9 shrink-0 text-[#d1d6dd] max-[760px]:block" strokeWidth={1.5} aria-hidden />
      </Link>
    </section>
  );
}

function ThemeCuration() {
  const { containerRef, canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useHorizontalCarousel<HTMLDivElement>();

  return (
    <section className="mt-16">
      {/* viewAll이 없는 유일한 캐러셀 섹션 — 테마 목록 페이지(/themes)가 없고 라우트는 /themes/[themeId]뿐이라
          걸 곳이 없다. 이 캐러셀 자체가 테마 색인이고 가로 스크롤 컨테이너라 모바일에서 손가락으로 밀린다. */}
      <SectionHeader
        title="테마별 공고"
        action={
          <div className="hidden shrink-0 md:block">
            <CarouselControl
              onPrev={scrollPrev}
              onNext={scrollNext}
              canGoPrev={canScrollPrev}
              canGoNext={canScrollNext}
              prevLabel="이전 테마"
              nextLabel="다음 테마"
            />
          </div>
        }
      />
      <div ref={containerRef} className="premium-scrollbar flex gap-4 overflow-x-auto pb-2">
        {themeCurationCards.map((card) => (
          <Link key={card.id} href={card.href} data-carousel-item className="min-w-[254px] overflow-hidden border border-[#e5e5e5] bg-white transition duration-[180ms] hover:border-[#dcdcdc] hover:shadow-[0_4px_16px_rgba(12,18,24,0.05)]">
            <div className="h-[120px] overflow-hidden bg-[#f2f3f4]">
              <img src={card.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="px-5 py-4">
              <h3 className={clsx(typeScale.cardTitle, "truncate text-[#222222]")}>{card.title}</h3>
              <p className="mt-2 text-[13px] font-normal text-[#8a8a8a]">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HomeRecommendationCard({
  job,
  isBookmarked,
  onToggleBookmark,
}: {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: number) => void;
}) {
  const logoUrl = job.logoUrl ?? companyLogos[job.company];
  return (
    /* ≤760px는 [로고칸 | 세로선 | 정보]의 좌우 2열을 버리고 세로 스택으로 바꾼다. 카드가 화면 폭 하나를
       통째로 쓰는 1열 배치에서 130px짜리 로고 칸은 제목·태그가 쓸 폭을 그만큼 깎기만 한다 —
       로고는 아래 상단 행에 32px로 다시 들어가고, 남은 폭은 전부 글로 간다.
       min-h-[156px]도 함께 푼다(max-[760px]:min-h-0): 2열 시절 좌우 높이를 맞추려고 잡아 둔 바닥값이라
       세로로 쌓인 뒤에는 짧은 카드에 빈 칸만 남긴다. 높이는 내용이 정하게 둔다. */
    <article className="group relative z-0 flex h-full min-h-[156px] border border-[#e5e5e5] bg-white transition duration-[180ms] hover:z-10 hover:border-[#dcdcdc] hover:shadow-[0_4px_16px_rgba(12,18,24,0.05)] focus-within:z-10 focus-within:border-[#dcdcdc] max-[760px]:min-h-0 max-[760px]:flex-col max-[760px]:border-0">
      <Link
        href={job.slug && hasJobDetail(job.slug) ? `/jobs/${job.slug}` : "/jobs"}
        className="absolute inset-0 z-10"
        aria-label={`${job.title} 상세 보기`}
      >
        <span className="sr-only">{job.title} 상세 보기</span>
      </Link>
      {/* 로고 영역(>760px 전용): 박스 없이 이미지만, 없으면 이니셜.
          ≤760px에서는 이 칸을 통째로 접고 아래 상단 행의 32px 인스턴스가 대신한다 —
          !w-full로 EntityLogo의 인라인 width를 덮는 건 "칸이 폭을 정하는" 이 열에서만 맞는 처방이라,
          인라인 행에 그대로 들고 갈 수 없어 인스턴스를 따로 둔다. */}
      <div className="flex w-[130px] shrink-0 items-center justify-center px-5 max-[760px]:hidden">
        {/* JobCard와 같은 규격 — 폭은 칸이 정하므로 !w-full로 EntityLogo의 인라인 width를 덮는다.
            height 40 + padding 0은 종전 `max-h-10 w-full object-contain`과 같은 렌더 결과다. */}
        <EntityLogo
          name={job.company}
          logoUrl={logoUrl}
          variant="wide"
          height={40}
          padding={0}
          className="!w-full"
          fallback={<span className="text-[13px] font-semibold text-[#596373]">{getCompanyInitial(job.company)}</span>}
        />
      </div>
      {/* 세로 구분선 — 좌우 2열을 가르는 선이라 세로 스택이 되는 ≤760px에서는 의미가 없다 */}
      <div className="w-px shrink-0 self-stretch bg-[#eeeeee] max-[760px]:hidden" />
      {/* 정보 영역
          ≤760px 세로 여백 22 → 20. 나머지는 아래 요소 사이 간격(제목→태그 10→8, 태그→풋터 12→10)에서 만든다.
          좌우는 20(px-5)이 아니라 24(px-6)다 — 카드가 풀블리드가 된 뒤로 이 패딩이 곧 화면 여백이라,
          카드 안쪽 값이 아니라 같은 화면의 섹션 제목이 서 있는 --shell-gutter/2(=24px) 선을 따라야 한다.
          FLUSH_SECTION_CLASS·FLUSH_GRID_CLASS가 px-6으로 맞춘 선과 같다. */}
      <div className="relative flex min-w-0 flex-1 flex-col px-[22px] pb-[20px] pt-[22px] max-[760px]:px-6 max-[760px]:pt-5">
        {/* 상단 행. >760px에서는 이 겹이 흐름에서 자리를 차지하지 않는다 — 로고·회사명이 hidden이고
            북마크만 남는데 그건 absolute라 흐름 밖이다. 이 겹 자체는 static이므로 북마크의 기준 상자도
            종전과 같은 바깥 정보 칸(relative)이라, 데스크톱 렌더는 한 픽셀도 달라지지 않는다.
            ≤760px에서만 [32px 로고][회사명][북마크] 인라인 행으로 켜진다.
            북마크는 인스턴스를 둘로 늘리지 않고 위치만 바꾼다(absolute → static + ml-auto) —
            같은 버튼을 두 벌 두면 onToggleBookmark·aria-label이 갈라져 나중에 어긋난다. */}
        <div className="max-[760px]:flex max-[760px]:items-center max-[760px]:gap-2.5">
          {/* EntityLogo 루트가 자기 display(grid)를 갖고 있어 hidden을 같은 요소에 얹으면 둘 다 변형 없는
              display 유틸리티라 승부가 Tailwind 출력 순서에 달린다. 껍데기 한 겹으로 확정한다. */}
          <span className="hidden shrink-0 max-[760px]:block">
            <EntityLogo
              name={job.company}
              logoUrl={logoUrl}
              variant="wide"
              size={32}
              padding={0}
              fallback={<span className="text-[12px] font-semibold text-[#596373]">{getCompanyInitial(job.company)}</span>}
            />
          </span>
          <p className="hidden min-w-0 flex-1 truncate text-[13px] font-medium text-[#6b7280] max-[760px]:block">{job.company}</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleBookmark(job.id);
            }}
            className={clsx(
              "absolute right-[14px] top-[14px] z-20 grid h-8 w-8 place-items-center text-[#b4bac3] hover:text-[#111111] max-[760px]:static max-[760px]:ml-auto max-[760px]:shrink-0",
              isBookmarked && "text-[#111111]",
            )}
            aria-label={`${job.title} 저장 ${isBookmarked ? "해제" : "추가"}`}
          >
            <Bookmark size={22} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
        {/* ≤760px 타이포: 제목 17 → 16(위계 압축표). 회사명 13·태그 12는 15px 바닥 아래라 그대로 둔다 —
            이 카드에서 줄일 수 있는 글자는 제목 하나뿐이다.
            회사명은 ≤760px에서 위 상단 행이 대신 그리므로 이 줄은 접는다. pr-8은 데스크톱에서만 살아 있는
            북마크(absolute)를 피하는 여백이라 모바일에서는 어차피 무의미하다. */}
        <p className="truncate pr-8 text-[13px] font-medium text-[#6b7280] max-[760px]:hidden">{job.company}</p>
        {/* mt-0.5는 바로 위에 회사명이 붙어 있을 때의 값이다. ≤760px는 위가 32px 로고 행이라 그대로 두면
            제목이 로고에 달라붙는다. */}
        <h3 className={clsx(typeScale.cardTitle, "mt-0.5 truncate text-[#111111] max-[760px]:mt-2 max-[760px]:text-[16px]")}>{job.title}</h3>
        {/* ≤760px 태그는 접지 않고 한 줄로 고정하고 넘치면 자른다 — 세로 스택이 되며 카드 높이가 내용에
            딸려가게 됐으므로, 태그가 2줄로 접히는 카드만 혼자 키가 커져 목록의 세로 리듬이 흔들린다.
            잘라내는 쪽은 태그가 원래 보조 정보라 감당할 수 있다(제목은 그대로 1줄 truncate).
            shrink-0·nowrap이 없으면 flex가 태그를 min-content까지 눌러 태그 안에서 글자가 접힌다 —
            "1줄 고정"이 아니라 "찌그러진 2줄"이 되므로 셋은 한 벌이다.
            slice(0,4)는 잘라내기와 무관하게 남긴다. overflow-hidden은 넘친 걸 가릴 뿐이라
            태그가 20개면 20개를 다 렌더한 뒤 가리게 된다 — 렌더 자체의 상한은 여기가 유일하다. */}
        <div className="mt-2.5 flex flex-wrap gap-2 max-[760px]:mt-2 max-[760px]:flex-nowrap max-[760px]:overflow-hidden">
          {(job.coreKeywords ?? []).slice(0, 4).map((tag) => (
            <span key={tag} className="border border-[#f0f0f0] bg-[#f6f6f6] px-2 py-0.5 text-[12px] font-medium text-[#777f8c] max-[760px]:shrink-0 max-[760px]:whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 max-[760px]:pt-2.5">
          <div className="flex items-center gap-2">
            {job.postingSource === "headhunting" ? (
              <span className="bg-[#111111] px-2.5 py-1 text-[13px] font-medium text-white">헤드헌팅</span>
            ) : null}
            <span className="text-[13px] font-medium text-[#6b7481]">
              {APPLY_METHOD_SHORT_LABELS[job.applyMethod]}
            </span>
          </div>
          {/* 라벨과 색을 같은 판정에서 뽑는다. 종전에는 색이 무조건 text-danger라
              formatJobDeadlineLabel이 내주는 "상시채용"·"마감"까지 빨갛게 나왔다 — 급할 게 없는
              두 상태가 가장 급해 보였다. JobCard·공고 상세와 같은 isJobDeadlineUrgent를 쓴다. */}
          <strong className={clsx("text-[13px] font-medium", isJobDeadlineUrgent(job) ? "text-danger" : "text-[#6b7280]")}>
            {formatJobDeadlineLabel(job)}
          </strong>
        </div>
      </div>
    </article>
  );
}

function PersonalRecommendationSection({
  bookmarkedIds,
  onToggleBookmark,
  activeTrack,
}: {
  bookmarkedIds: number[];
  onToggleBookmark: (jobId: number) => void;
  activeTrack: HomeTrackFilter;
}) {
  const visibleJobs = homeRecommendationJobIds
    .map((id) => jobs.find((job) => job.id === id))
    .filter((job): job is Job => Boolean(job))
    .filter((job) => activeTrack === "all" || job.track === activeTrack)
    .slice(0, 4);

  return (
    <section className="mt-16">
      <SectionHeader title="나를 위한 추천 공고" viewAll={{ href: "/jobs" }} />
      {/* ≤760px 풀블리드 1열. 브레이크포인트를 900 → 760으로 내려 이 파일의 다른 모바일 분기와 한 줄로 맞춘다
          (761~900px는 이제 2열이다 — 아래 태그 처리 참고).

          FLUSH_GRID_CLASS를 그대로 쓰지 않았다. 그 상수의 [&>*]:border-0 / [&>*]:px-6은 그리드 직계 자식이
          곧 카드일 때를 전제하는데, 여기는 -ml-px/-mt-px 테두리 겹치기용 셀 래퍼가 한 겹 끼어 있어
          자식 선택자가 래퍼에 걸린다 — 카드 테두리는 안 지워지고 패딩만 이중(24+20)으로 얹힌다.
          그래서 같은 관용구(거터 되밀기 -mx, divide-y)만 손으로 가져오고 카드 쪽은 각 요소에서 직접 처리한다.

          border-l/border-t와 셀의 -ml-px/-mt-px는 칸을 맞대어 선을 하나로 합치는 짝이라 함께 푼다.
          화면 끝에 닿은 세로선은 테두리가 아니라 잘린 자국으로 읽히고, 낱장 사이 선은 divide-y가 그린다. */}
      <div className="grid grid-cols-2 border-l border-t border-[#dddddd] max-[760px]:-mx-[calc(var(--shell-gutter)/2)] max-[760px]:grid-cols-1 max-[760px]:divide-y max-[760px]:divide-[var(--color-border)] max-[760px]:border-0">
        {visibleJobs.map((job) => (
          <div key={job.id} className="-ml-px -mt-px h-full max-[760px]:ml-0 max-[760px]:mt-0">
            <HomeRecommendationCard job={job} isBookmarked={bookmarkedIds.includes(job.id)} onToggleBookmark={onToggleBookmark} />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 홈의 "주목할 만한 공고"는 네 트랙을 한데 모아 보여주므로 P·F를 전량 노출하면
 * 유료 구좌 존이 여러 줄로 늘어져 위계가 무너진다. P·F는 `homeSpotlightSlugs` 선별분만
 * 남겨 각 한 줄로 끊고, STANDARD는 그대로 둔다. 트랙 랜딩(`TrackLandingClient`)은
 * 트랙 하나만 다루므로 이 필터를 쓰지 않고 전량 노출한다.
 */
const homeFeaturedJobs = recommendedJobs.filter(
  (job) => job.adTier === "standard" || homeSpotlightSlugs.has(job.jobSlug ?? ""),
);

export function HomePageClient() {
  const activeTrack: HomeTrackFilter = "all";
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([101]);

  const toggleBookmark = (jobId: number) => {
    setBookmarkedIds((current) => (current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId]));
  };

  return (
    <>
      <Header />
      <main className="pb-0">
        <div className="app-shell">
          <HomeHeroBanner activeTrack={activeTrack} />
          <PremiumCompanies activeTrack={activeTrack} />
          <RecruiterSolutionBanner />
          <ThemeCuration />
          <PersonalRecommendationSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={activeTrack} />
          {/* 홈에서만 STANDARD를 2줄(10장)로 줄이고 그 앞에 헤드헌팅 안내 행을 둔다 —
              트랙 랜딩은 해당 트랙 전량을 보여주는 자리라 옵션을 넘기지 않는다. */}
          <FeaturedJobsSection jobs={homeFeaturedJobs} showHeadhuntingBanner standardLimit={10} />
        </div>
        <HomeJobsSection bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark} activeTrack={activeTrack} />
      </main>
    </>
  );
}
