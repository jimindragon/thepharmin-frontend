"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronRight, Heart, Search, ShieldCheck } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Pagination } from "@/components/Pagination";
import { LockedContent } from "@/components/companies/LockedContent";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { companyExampleImages } from "@/config/companyImages";
import { jobTrackLabels } from "@/config/jobTracks";
import type { CompanyDirectoryEntry, IndustryGroup } from "@/data/companyDirectory";
import type { JobTrack } from "@/types/jobs";

type TrackFilter = "all" | "pharma_bio" | "cro_cdmo" | "hospital" | "pharmacy";
type SortOption = "리뷰순" | "관심순" | "채용중순";

interface RecentInterviewReviewPreview {
  id: string;
  companyId: string;
  companyName: string;
  track: JobTrack;
  industryGroup?: IndustryGroup;
  jobRole: string;
  outcome?: "합격" | "불합격";
  writtenAt: string;
  /** 권한이 없으면 서버에서부터 null로 내려온다 — 클라이언트는 원문 자체를 받지 않는다 */
  preview: string | null;
}

interface CompaniesHomeClientProps {
  directory: CompanyDirectoryEntry[];
  recentInterviewReviews: RecentInterviewReviewPreview[];
  isLoggedIn: boolean;
}

const LOGIN_HREF = "/companies";
const PAGE_SIZE = 8;

const trackFilterTabs: { id: TrackFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pharma_bio", label: "제약·바이오" },
  { id: "cro_cdmo", label: "CRO·CDMO" },
  { id: "hospital", label: "병원" },
  { id: "pharmacy", label: "약국" },
];

const sortOptions: SortOption[] = ["리뷰순", "관심순", "채용중순"];

/** 큐레이션 탭은 트랙(JobTrack)과 산업 세분류(IndustryGroup)를 함께 봐야 한다 — 산업 트랙이 제약·바이오/CRO·CDMO 두 탭으로 나뉘기 때문 */
function matchesTrackFilter(track: JobTrack, industryGroup: IndustryGroup | undefined, filter: TrackFilter) {
  if (filter === "all") return true;
  if (filter === "pharma_bio") return track === "industry" && industryGroup !== "cro_cdmo";
  if (filter === "cro_cdmo") return track === "industry" && industryGroup === "cro_cdmo";
  return track === filter;
}

function sortDirectory(entries: CompanyDirectoryEntry[], sort: SortOption) {
  return [...entries].sort((a, b) => {
    if (sort === "관심순") return (b.interestedCount ?? 0) - (a.interestedCount ?? 0);
    if (sort === "채용중순") return b.activeJobCount - a.activeJobCount;
    return b.reviewCount - a.reviewCount;
  });
}

function CompanyInfoHero({
  keyword,
  onKeywordChange,
  onSubmit,
}: {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="relative min-h-[300px] overflow-hidden border-b border-[#dce2e8] bg-[#070a0d] text-white">
      <img src={companyExampleImages.research} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,9,0.88)_0%,rgba(5,7,9,0.62)_48%,rgba(5,7,9,0.2)_100%)]" />
      <div className="app-shell relative z-10 flex min-h-[300px] flex-col justify-center py-12 max-[720px]:py-9">
        <span className="text-[12px] font-medium tracking-[0.08em] text-white/68">THE PHARMA · COMPANY REVIEW</span>
        <h1 className="mt-4 max-w-[640px] text-[34px] font-bold leading-[1.32] tracking-[-0.02em] text-white max-[720px]:text-[25px]">
          기업의 실제 근무 경험을 확인하세요
        </h1>
        <p className="mt-3 max-w-[560px] text-[15px] font-normal leading-[1.75] text-white/76 max-[720px]:text-[14px]">
          현직자·전직자가 남긴 기업 리뷰와 면접 후기를 살펴보세요.
        </p>
        <form onSubmit={onSubmit} className="mt-7 flex max-w-[560px] gap-2 max-[520px]:flex-col">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-[var(--radius)] border border-white/25 bg-white px-4">
            <Search size={18} className="shrink-0 text-[#8a95a5]" aria-hidden="true" />
            <input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="기업 또는 기관명을 검색하세요"
              aria-label="기업 또는 기관명 검색"
              className="h-full w-full bg-transparent text-[14px] text-[#202734] outline-none placeholder:text-[#a0a9b7]"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-[var(--radius)] bg-white px-6 text-[14px] font-medium text-[#111111] transition hover:bg-[#f0f0f0]"
          >
            검색
          </button>
        </form>
      </div>
    </section>
  );
}

function TrackTabs({ active, onChange }: { active: TrackFilter; onChange: (track: TrackFilter) => void }) {
  return (
    <section className="border-b border-[#dfe4ea] bg-white">
      <div className="app-shell">
        <nav className="flex overflow-x-auto" aria-label="기업·기관 트랙">
          {trackFilterTabs.map((tab) => {
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={clsx(
                  "relative inline-flex h-12 shrink-0 items-center px-5 text-[14px] font-medium whitespace-nowrap transition",
                  selected
                    ? "font-semibold text-[#111111] after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                    : "text-[#4f5967] hover:text-[#111111]",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

function CompanyListItem({ entry, onRequestWriteReview }: { entry: CompanyDirectoryEntry; onRequestWriteReview: () => void }) {
  const metaParts = [jobTrackLabels[entry.track], entry.type, entry.region].filter(Boolean);
  const hasReviews = entry.reviewCount > 0;

  return (
    <article className="relative grid min-h-[84px] grid-cols-[44px_1fr_auto] items-center gap-x-4 gap-y-3 border border-[#e5e9ef] bg-white py-4 pl-5 pr-9 transition hover:border-[#111111] hover:bg-[#f7f8fa] max-[640px]:grid-cols-[44px_1fr]">
      {/* 카드 전체 클릭 영역. "첫 리뷰 쓰기"는 이 Link에 중첩되지 않는 형제 엘리먼트(z-20)로 분리해 둔다 */}
      <Link
        href={entry.detailHref}
        aria-label={`${entry.name} 상세 보기`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
      />
      <EntityLogo name={entry.name} logoText={entry.logoText} logoUrl={entry.logoUrl} size={44} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[16px] font-bold text-[#171d26]">{entry.name}</h3>
          {entry.verified ? <ShieldCheck size={14} className="shrink-0 text-[#596373]" aria-label="인증된 기업·기관" /> : null}
        </div>
        <p className="mt-1 truncate text-[13px] font-normal text-[#777777]">{metaParts.join(" · ")}</p>
      </div>
      <div className="flex flex-col items-end gap-1 max-[640px]:col-start-2 max-[640px]:row-start-2 max-[640px]:items-start">
        {hasReviews ? (
          <p className="text-[14px] font-medium text-[#171d26]">
            리뷰 {entry.companyReviewCount} · 면접후기 {entry.interviewReviewCount}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-[14px] font-medium text-[#171d26]">
            <span>아직 리뷰가 없어요</span>
            <span aria-hidden="true" className="text-[#d8dce2]">·</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRequestWriteReview();
              }}
              className="relative z-20 font-medium text-[#596373] underline decoration-[#d8dce2] underline-offset-2 transition hover:text-[#111111]"
            >
              첫 리뷰 쓰기
            </button>
          </p>
        )}
        <p className="flex items-center gap-1 text-[13px] font-normal text-[#8a94a3]">
          {entry.interestedCount != null ? (
            <>
              <Heart size={12} className="shrink-0" aria-hidden="true" />
              <span>{entry.interestedCount.toLocaleString("ko-KR")}</span>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span>채용중 {entry.activeJobCount}</span>
        </p>
      </div>
      <ChevronRight
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#b6bdc7]"
      />
    </article>
  );
}

function DirectoryEmptyState() {
  return (
    <div className="flex h-[160px] flex-col items-center justify-center gap-1.5 border border-[#e5e9ef] bg-[#fbfcfd] text-center">
      <p className="text-[14px] font-semibold text-[#3d4653]">아직 등록된 기업·기관이 없습니다.</p>
      <p className="text-[13px] font-normal text-[#8791a0]">다른 분야를 선택하거나 검색어를 다시 입력해보세요.</p>
    </div>
  );
}

function InterviewReviewCard({
  review,
  isLoggedIn,
  onRequestWriteReview,
}: {
  review: RecentInterviewReviewPreview;
  isLoggedIn: boolean;
  onRequestWriteReview: () => void;
}) {
  const locked = review.preview === null;

  return (
    <article className="border border-[#e5e9ef] bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-[#596373]">{review.companyName}</p>
        {review.outcome ? (
          <span
            className={clsx(
              "shrink-0 border px-2 py-0.5 text-[11px]",
              review.outcome === "합격" ? "border-[#111111] font-bold text-[#111111]" : "border-[#d9d9d9] font-medium text-[#777777]",
            )}
          >
            {review.outcome}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-[12px] font-normal text-[#8a95a5]">
        {review.jobRole} · {review.writtenAt}
      </p>
      {locked ? (
        <LockedContent
          className="mt-3"
          lines={2}
          message={
            isLoggedIn
              ? "면접 후기를 작성하면 다른 사용자의 상세 후기를 확인할 수 있습니다."
              : "로그인 후 면접 후기 열람 조건을 확인할 수 있습니다."
          }
          ctaLabel={isLoggedIn ? "면접 후기 작성하기" : "로그인하기"}
          ctaHref={isLoggedIn ? undefined : LOGIN_HREF}
          onCtaClick={isLoggedIn ? onRequestWriteReview : undefined}
        />
      ) : (
        <p className="mt-3 line-clamp-3 text-[13px] font-normal leading-[1.65] text-[#3f4855]">{review.preview}</p>
      )}
    </article>
  );
}

export function CompaniesHomeClient({ directory, recentInterviewReviews, isLoggedIn }: CompaniesHomeClientProps) {
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("리뷰순");
  const [currentPage, setCurrentPage] = useState(1);
  const [companyReviewNotice, setCompanyReviewNotice] = useState("");
  const [interviewReviewNotice, setInterviewReviewNotice] = useState("");

  const filteredDirectory = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    return directory.filter((entry) => {
      const matchesTrack = matchesTrackFilter(entry.track, entry.industryGroup, trackFilter);
      const matchesKeyword = !normalizedKeyword || entry.name.toLowerCase().includes(normalizedKeyword);
      return matchesTrack && matchesKeyword;
    });
  }, [directory, trackFilter, searchKeyword]);

  const sortedDirectory = useMemo(() => sortDirectory(filteredDirectory, sortOption), [filteredDirectory, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [trackFilter, sortOption, searchKeyword]);

  const visibleDirectory = useMemo(() => {
    if (sortedDirectory.length === 0) return [];
    const pageOffset = ((currentPage - 1) * PAGE_SIZE) % sortedDirectory.length;
    return [...sortedDirectory.slice(pageOffset), ...sortedDirectory.slice(0, pageOffset)].slice(0, PAGE_SIZE);
  }, [sortedDirectory, currentPage]);

  const filteredInterviewReviews = useMemo(
    () => recentInterviewReviews.filter((review) => matchesTrackFilter(review.track, review.industryGroup, trackFilter)),
    [recentInterviewReviews, trackFilter],
  );

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchKeyword(keyword);
  };

  const handleRequestWriteCompanyReview = () => {
    setCompanyReviewNotice("기업 리뷰 작성 화면은 추후 연결될 예정입니다.");
    window.setTimeout(() => setCompanyReviewNotice(""), 2400);
  };

  const handleRequestWriteInterviewReview = () => {
    setInterviewReviewNotice("면접 후기 작성 화면은 추후 연결될 예정입니다.");
    window.setTimeout(() => setInterviewReviewNotice(""), 2400);
  };

  const handleScrollToDirectory = () => {
    document.getElementById("company-directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="bg-[#f7f8fa] pb-20">
      <CompanyInfoHero keyword={keyword} onKeywordChange={setKeyword} onSubmit={handleSearchSubmit} />
      <TrackTabs active={trackFilter} onChange={setTrackFilter} />

      <div className="app-shell">
        <section id="company-directory" className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#111111]">기업·기관 리스트</h2>
            <div className="grid h-[34px] grid-cols-3 overflow-hidden border border-[#dce2ea] bg-white">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSortOption(option)}
                  className={clsx(
                    "min-w-[92px] border-r border-[#dce2ea] px-3 text-[12px] font-medium last:border-r-0",
                    sortOption === option ? "bg-[#050505] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {visibleDirectory.length ? (
            <div className="flex flex-col gap-2">
              {visibleDirectory.map((entry) => (
                <CompanyListItem key={`${entry.id}-${currentPage}`} entry={entry} onRequestWriteReview={handleRequestWriteCompanyReview} />
              ))}
            </div>
          ) : (
            <DirectoryEmptyState />
          )}

          <Pagination currentPage={currentPage} onPageChange={setCurrentPage} />
          {companyReviewNotice ? <p className="mt-3 text-[12px] font-medium text-[#596373]">{companyReviewNotice}</p> : null}
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#111111]">최근 면접 후기</h2>
            <span className="cursor-default text-[13px] font-medium text-[#aaaaaa]">전체 보기 ›</span>
          </div>

          {filteredInterviewReviews.length ? (
            <div className="grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
              {filteredInterviewReviews.map((review) => (
                <InterviewReviewCard
                  key={review.id}
                  review={review}
                  isLoggedIn={isLoggedIn}
                  onRequestWriteReview={handleRequestWriteInterviewReview}
                />
              ))}
            </div>
          ) : (
            <DirectoryEmptyState />
          )}
          {interviewReviewNotice ? <p className="mt-3 text-[12px] font-medium text-[#596373]">{interviewReviewNotice}</p> : null}
        </section>

        <section className="mt-14 border border-[#e5e9ef] bg-[#fbfcfd] px-7 py-10 text-center max-[640px]:px-5 max-[640px]:py-8">
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#171d26]">경험을 공유하고 더 많은 리뷰를 확인해보세요</h2>
          <p className="mx-auto mt-3 max-w-[420px] text-[13px] font-normal leading-[1.7] text-[#596373]">기업 리뷰는 로그인 후 확인할 수 있습니다.</p>
          <p className="mx-auto text-[13px] font-normal leading-[1.7] text-[#596373]">면접 후기를 작성하면 다른 사용자의 상세 면접 후기를 열람할 수 있습니다.</p>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleScrollToDirectory}
              className="mt-6 inline-flex h-11 items-center bg-[#111111] px-6 text-[14px] font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              리뷰 작성하기
            </button>
          ) : (
            <Link href={LOGIN_HREF} className="mt-6 inline-flex h-11 items-center bg-[#111111] px-6 text-[14px] font-medium text-white transition hover:bg-[#2a2a2a]">
              리뷰 작성하기
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
