"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronRight, Search, ShieldCheck } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { BusinessImageBand } from "@/components/business/BusinessMarketingSections";
import { FLUSH_SECTION_CLASS } from "@/components/flushListStyles";
import { Pagination } from "@/components/Pagination";
import { PlaceholderNotice, usePlaceholderNotice } from "@/components/shared/PlaceholderNotice";
import { Button } from "@/components/ui/Button";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { typeScale } from "@/components/ui/Typography";
import { heroImages } from "@/config/companyImages";
import { jobTracks, jobTrackLabels } from "@/config/jobTracks";
import { FEATURED_COMPANY_IDS, isJobActive } from "@/data/companyDirectory";
import type { CompanyDirectoryEntry, IndustryGroup } from "@/data/companyDirectory";
import { jobs } from "@/data/jobs";
import type { JobTrack } from "@/types/jobs";
import { getCompanyInitial } from "@/utils/companyInitial";

type TrackFilter = "all" | "pharma_bio" | "cro_cdmo" | "research" | "hospital" | "pharmacy";
type SortOption = "리뷰순" | "관심순" | "채용중순";
type FeedFilter = "all" | "interview" | "company";

interface RecentFeedCompanyItem {
  id: string;
  companyId: string;
  companyName: string;
  type: "company";
  jobRole: string;
  writtenAt: string;
  content: string;
  helpfulCount: number;
}

interface RecentFeedInterviewItem {
  id: string;
  companyId: string;
  companyName: string;
  type: "interview";
  jobRole: string;
  writtenAt: string;
  /** 원문(content)은 절대 내려오지 않는다 — 태그만으로 미리보기를 구성한다 */
  tags: string[];
}

type RecentFeedItem = RecentFeedCompanyItem | RecentFeedInterviewItem;

interface CompaniesHomeClientProps {
  directory: CompanyDirectoryEntry[];
  companyFeedItems: RecentFeedCompanyItem[];
  interviewFeedItems: RecentFeedInterviewItem[];
}

const FEED_COMPANY_QUOTA = 4;
const FEED_INTERVIEW_QUOTA = 3;
const FEED_TOTAL = FEED_COMPANY_QUOTA + FEED_INTERVIEW_QUOTA;

/** "전체" 필터 기본 구성: 기업 리뷰 4 + 면접 후기 3(각 타입 내 최신순), 한쪽이 부족하면 다른 타입으로 채운다 */
function buildAllFeedItems(companyItems: RecentFeedCompanyItem[], interviewItems: RecentFeedInterviewItem[]): RecentFeedItem[] {
  const companyPick = companyItems.slice(0, FEED_COMPANY_QUOTA);
  const interviewPick = interviewItems.slice(0, FEED_INTERVIEW_QUOTA);
  const shortfall = FEED_TOTAL - companyPick.length - interviewPick.length;

  const extras: RecentFeedItem[] = [...companyItems.slice(companyPick.length), ...interviewItems.slice(interviewPick.length)]
    .sort((a, b) => b.writtenAt.localeCompare(a.writtenAt))
    .slice(0, Math.max(shortfall, 0));

  return [...companyPick, ...interviewPick, ...extras].sort((a, b) => b.writtenAt.localeCompare(a.writtenAt));
}

const PAGE_SIZE = 8;

const trackFilterTabs: { id: TrackFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pharma_bio", label: "제약·바이오" },
  { id: "cro_cdmo", label: "CRO·CDMO" },
  { id: "research", label: "연구" },
  { id: "hospital", label: "병원" },
  { id: "pharmacy", label: "약국" },
];

const feedFilterTabs: { id: FeedFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "interview", label: "면접 후기" },
  { id: "company", label: "기업 리뷰" },
];

const sortOptions: SortOption[] = ["리뷰순", "관심순", "채용중순"];

/** 사이드바 "업종별 탐색"의 산업(JobTrack) 클릭을 하단 리스트의 큐레이션 탭(TrackFilter)으로 잇는 매핑.
 * 산업은 큐레이션 탭이 세분화(제약·바이오/CRO·CDMO)되어 있어 대응하는 단일 탭이 없으므로 "전체"로 스크롤만 한다. */
const trackToDirectoryFilter: Partial<Record<JobTrack, TrackFilter>> = {
  research: "research",
  hospital: "hospital",
  pharmacy: "pharmacy",
};

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

/**
 * 기업·기관 리스트 섹션 헤더의 검색창. 목록을 걸러내는 컨트롤이라 정렬 칩과 같은 줄에 서고,
 * 기업센터 목록 툴바(BusinessApplicantsClient·BusinessHeadhuntingManageClient)와 같은 문법을 쓴다 —
 * h-10 입력칸 좌측에 돋보기를 얹고, 별도 제출 버튼을 두지 않는다.
 *
 * 종전에는 히어로 사진 위에 얹혀 그림자(no-shadow 원칙의 오버레이 예외)와 흰 테두리(white/15)를
 * 달고 있었다. 흰 카드 위로 내려오면서 두 예외의 근거가 모두 사라져 일반 회색 테두리로 돌아왔다.
 *
 * 제출 버튼이 없으므로 form이 아니라 div다 — 입력칸 하나짜리 form은 Enter가 암묵적 제출로
 * 이어져 페이지가 새로고침된다. 값이 바뀔 때마다 바로 거르는 방식은 /support 검색창과 같다.
 */
function CompanySearchBar({ keyword, onKeywordChange }: { keyword: string; onKeywordChange: (value: string) => void }) {
  return (
    <div className="relative max-[640px]:w-full">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a4adba]" aria-hidden="true" />
      {/* aria-label은 placeholder처럼 줄이지 않는다: 화면 폭 제약을 받지 않고, 읽어 주는 쪽에는 온전한 문장이 낫다. */}
      <input
        type="text"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="기업·기관명 검색"
        aria-label="기업 또는 기관명 검색"
        className="h-10 w-[220px] border border-[#d8e0e8] bg-white pl-8 pr-3 text-[13px] font-normal text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08] max-[640px]:w-full"
      />
    </div>
  );
}

/**
 * 허브 첫 화면의 사진 히어로. 공용 밴드(BusinessImageBand)를 헤드헌팅 소개 페이지와 같은
 * 조합(horizontal 그라데이션 + 좌측 정렬 + variant="hero")으로 부른다 — 왼쪽이 짙고
 * 오른쪽으로 갈수록 사진이 드러나는 그라데이션이라, 글이 왼쪽에 모여 있어야 읽힌다.
 *
 * 화면 이름("기업 인사이트")은 h1이 아니라 그 위 라벨로 둔다. h1 자리는 헤드라인이 가져가고,
 * 문서에 h1은 하나만 남는다. 라벨은 영문 Eyebrow(대문자·넓은 자간)를 쓰지 않는다 —
 * 한글에는 그 문법이 맞지 않아 본문 자간 그대로의 평범한 라벨로 둔다.
 *
 * 검색창은 여기 있지 않다 — 목록을 거르는 컨트롤이라 기업·기관 리스트 섹션 헤더로 내려갔다.
 * 검색창이 빠진 만큼 밴드도 함께 줄인다: ≤760px는 130, ≥761px는 600 → 400.
 *
 * 제목은 heroTitle(46/30)이 아니라 pageTitle(34/24)을 쓴다 — 밴드가 얇아진 만큼 46px는 밴드를
 * 혼자 다 먹고, 확정 타이포 스케일(최대 34) 안으로 들어오는 편이 이 위계에 맞는다. <br>도 뺀다:
 * 34px 한 줄이 데스크톱 폭에 여유 있게 들어가고, ≤760px에서는 자연 줄바꿈으로 2줄이 된다.
 *
 * 라벨과 제목 사이는 mt-2(8). 광학 간격은 여기에 두 줄상자의 반행송(라벨 4.2 + 제목 3.4)이 더해져
 * 약 15.6px인데, 라벨 자신의 줄상자(21.45)보다 좁아야 둘이 한 덩어리로 읽힌다. mt-3(12)은 광학
 * 19.6로 한 줄에 거의 닿아 라벨이 제목의 윗줄이 아니라 별개의 줄로 떨어져 나온다.
 */
function CompaniesHubHero() {
  return (
    /*
     * ≥761px 밴드 높이를 600 → 400으로 줄이는 국소 오버라이드. BusinessImageBand는 className을
     * 받지 않고(image·gradient·align·variant·children이 전부), min-h는 --hero-height를 통해
     * /support·헤드헌팅 소개와 공유하는 값이라 양쪽 다 손댈 수 없다. 그래서 호출부에서 자식
     * 선택자로 덮는다 — 이 파일 밖에는 한 글자도 영향이 없다.
     *
     * 출력 순서에 기대지 않는다: 생성되는 규칙이 `.min-\[761px\]\:… > section`(클래스 1 + 타입 1
     * = 0,1,1)이라 밴드의 `.min-h-\[var\(--hero-height\)\]`(클래스 1 = 0,1,0)를 명시도로 이긴다.
     * 밴드의 max-[760px]:min-h-0과는 미디어 쿼리가 서로 배타(≤760 / ≥761)라 아예 만나지 않는다.
     */
    <div className="min-[761px]:[&>section]:min-h-[400px]">
      <BusinessImageBand image={heroImages.companies} gradient="horizontal" variant="hero">
        {/* ≤760px 밴드 상하 패딩(py-16 = 64)을 32로 줄이는 유일한 방법 — 패딩은 공용 밴드가 갖고 있고,
            그 값은 다른 두 화면과 공유라 손댈 수 없다. flow-root는 자식(p·h1)의 마진이 이 래퍼를
            뚫고 나가 음수 마진과 상쇄되는 것을 막는다. 761px 이상에는 한 클래스도 적용되지 않는다. */}
        <div className="max-[760px]:-my-8 max-[760px]:flow-root">
          <p className="text-[13px] font-medium leading-[1.65] tracking-[-0.01em] text-white/70">기업 인사이트</p>
          <h1 className={`mt-2 text-white ${typeScale.pageTitle}`}>지원할 회사, 먼저 알아보세요</h1>
        </div>
      </BusinessImageBand>
    </div>
  );
}

/** 클릭과 드래그-스크롤을 구분하는 이동 임계값(px). 이 값을 넘기 전까지는 포인터 캡처를 걸지 않아
 *  단순 클릭 시 Link가 정상적으로 click 이벤트를 받도록 한다(캡처 즉시 호출 시 click이 컨테이너로 리타겟됨). */
const DRAG_THRESHOLD_PX = 6;

function CompanyLogoStrip({ entries }: { entries: CompanyDirectoryEntry[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startScrollLeft: number; isDragging: boolean } | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    // 세로 휠 스크롤을 가로 스크롤로 리다이렉트한다 — 트랙패드의 원래 가로 제스처(deltaX)는 그대로 둔다
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      node.scrollLeft += event.deltaY;
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const node = scrollRef.current;
    if (!node) return;
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: node.scrollLeft, isDragging: false };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    const state = dragState.current;
    if (!node || !state) return;

    const delta = event.clientX - state.startX;
    if (!state.isDragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      state.isDragging = true;
      node.setPointerCapture(state.pointerId);
    }
    node.scrollLeft = state.startScrollLeft - delta;
  };

  const endDrag = () => {
    const node = scrollRef.current;
    const state = dragState.current;
    if (node && state?.isDragging && node.hasPointerCapture(state.pointerId)) {
      node.releasePointerCapture(state.pointerId);
    }
    dragState.current = null;
  };

  if (!entries.length) return null;

  return (
    <div className={clsx("relative mt-10 border border-border bg-white py-[30px]", FLUSH_SECTION_CLASS)}>
      {/* ≤760px에서 좌우 24px는 셸 쪽(FLUSH_SECTION_CLASS의 px-6)이 잡는다 — 여기 px-6을 그대로 두면
          두 값이 더해져 48px가 된다. 스크롤러의 패딩만 접고 가로 스크롤 동작은 그대로 둔다. */}
      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="premium-scrollbar flex cursor-grab select-none overflow-x-auto px-6 active:cursor-grabbing max-[760px]:px-0"
      >
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex shrink-0 items-stretch">
            {index > 0 ? (
              <span aria-hidden="true" className="w-px shrink-0 self-center bg-[#e5e9ef]" style={{ height: 44 }} />
            ) : null}
            <Link
              href={entry.detailHref}
              draggable={false}
              title={entry.name}
              className="company-logo-strip-item flex w-[164px] shrink-0 flex-col items-center justify-center gap-2"
            >
              <img
                src={entry.logoUrl}
                alt={entry.name}
                draggable={false}
                className="company-logo-strip-img h-[42px] w-auto max-w-[120px] object-contain"
              />
              <span
                title={entry.name}
                className="company-logo-strip-name w-full max-w-[140px] truncate text-center text-[12px]"
              >
                {entry.name}
              </span>
            </Link>
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent max-[560px]:w-10"
      />
    </div>
  );
}

function TrackTabs({ active, onChange }: { active: TrackFilter; onChange: (track: TrackFilter) => void }) {
  return (
    <nav className="flex overflow-x-auto border-b border-border" aria-label="기업·기관 트랙">
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
                ? "font-semibold text-[#111111] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                : "text-[#4f5967] hover:text-[#111111]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function FeedFilterTabs({ active, onChange }: { active: FeedFilter; onChange: (filter: FeedFilter) => void }) {
  return (
    <nav className="flex overflow-x-auto border-b border-border" aria-label="최근 올라온 이야기 필터">
      {feedFilterTabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              "relative inline-flex h-12 shrink-0 items-center px-5 text-[14px] font-medium whitespace-nowrap transition",
              selected
                ? "font-semibold text-[#111111] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                : "text-[#4f5967] hover:text-[#111111]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function FeedRow({ item, onRequestWriteInterviewReview }: { item: RecentFeedItem; onRequestWriteInterviewReview: () => void }) {
  const href = item.type === "interview" ? `/companies/${item.companyId}/interviews` : `/companies/${item.companyId}/reviews`;
  const kindLabel = item.type === "interview" ? "면접 후기" : "기업 리뷰";

  return (
    <div className="group relative grid grid-cols-[150px_1px_1fr_auto] items-center gap-4 py-6 max-[560px]:grid-cols-1 max-[560px]:gap-2">
      {/* 행 전체 클릭 영역. 우측 액션은 이 Link에 중첩되지 않는 형제 엘리먼트(z-20)로 분리해 둔다 */}
      <Link href={href} aria-label={`${item.companyName} 상세 보기`} className="absolute inset-0 z-10" />
      <div className="min-w-0">
        <p className="line-clamp-2 text-[16px] font-semibold text-[#171d26]">{item.companyName}</p>
        <p className="mt-1 text-[12px] font-normal text-[#8a94a3]">
          <span className="font-semibold text-[#596373]">{kindLabel}</span>
          {" · "}
          {item.jobRole}
        </p>
      </div>
      <span aria-hidden="true" className="h-10 w-px shrink-0 self-center bg-[#e5e9ef] max-[560px]:hidden" />
      <div className="min-w-0">
        {item.type === "company" ? (
          <p className="line-clamp-2 text-[15px] font-normal leading-[1.65] text-[#3f4855] transition group-hover:text-[#111111]">
            “{item.content}”
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag} className="border border-border px-2 py-0.5 text-[12px] font-normal text-[#596373]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 justify-self-end self-center whitespace-nowrap">
        {item.type === "company" ? (
          <p className="text-[12px] font-normal text-[#a0a9b7]">도움돼요 {item.helpfulCount}</p>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRequestWriteInterviewReview();
            }}
            className="relative z-20 text-[12px] font-medium text-[#a0a9b7] underline decoration-[#d8dce2] underline-offset-2 transition hover:text-[#111111]"
          >
            후기 작성 후 원문 열람
          </button>
        )}
      </div>
    </div>
  );
}

function RecentStoriesFeed({ companyItems, interviewItems }: { companyItems: RecentFeedCompanyItem[]; interviewItems: RecentFeedInterviewItem[] }) {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const interviewReviewNotice = usePlaceholderNotice();

  const allItems = useMemo(() => buildAllFeedItems(companyItems, interviewItems), [companyItems, interviewItems]);

  const displayedItems: RecentFeedItem[] =
    feedFilter === "all" ? allItems : feedFilter === "company" ? companyItems : interviewItems;

  const handleRequestWriteInterviewReview = () => {
    interviewReviewNotice.show("면접 후기 작성 화면은 준비 중입니다.");
  };

  return (
    <section className={clsx("border border-border bg-white px-6 py-6", FLUSH_SECTION_CLASS)}>
      <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#111111]">최근 올라온 이야기</h2>
      <div className="mt-4">
        <FeedFilterTabs active={feedFilter} onChange={setFeedFilter} />
      </div>

      {/* px-5는 데스크톱에서 행을 카드 제목보다 한 단 들여 세우던 값이다. ≤760px에서는 카드 패딩이
          그대로 화면 여백(24px)이 되므로, 여기서 더 들어가면 h1·탭이 선 자리에서 20px 밀린다. */}
      {displayedItems.length ? (
        <div className="mt-4 divide-y divide-[#e5e9ef] px-5 max-[760px]:px-0">
          {displayedItems.map((item) => (
            <FeedRow key={item.id} item={item} onRequestWriteInterviewReview={handleRequestWriteInterviewReview} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex h-[120px] flex-col items-center justify-center gap-1 px-5 text-center max-[760px]:px-0">
          <p className="text-[15px] font-medium text-[#303946]">해당 조건의 이야기가 아직 없습니다.</p>
        </div>
      )}

      <PlaceholderNotice message={interviewReviewNotice.message} className="mt-4" />
    </section>
  );
}

function SidebarBlockTitle({ children }: { children: string }) {
  return (
    <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">
      <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
      {children}
    </h2>
  );
}

function TopReviewedCompaniesPanel({ entries }: { entries: CompanyDirectoryEntry[] }) {
  if (!entries.length) return null;

  return (
    <section className={clsx("border border-border bg-white px-5 py-5", FLUSH_SECTION_CLASS)}>
      <SidebarBlockTitle>리뷰 많은 기업 TOP 5</SidebarBlockTitle>
      <ol className="mt-4 space-y-3.5">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <Link href={entry.detailHref} className="flex items-start gap-3 transition hover:opacity-70">
              <span className="text-[15px] font-bold text-[#a0a9b7]">{index + 1}</span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-[#303946]">{entry.name}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-[#a0a9b7]">
                  기업 리뷰 {entry.companyReviewCount} · 면접후기 {entry.interviewReviewCount}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WriteReviewCtaPanel({ onCtaClick }: { onCtaClick: () => void }) {
  return (
    <section className={clsx("border border-border bg-[#050505] px-5 py-5 text-white", FLUSH_SECTION_CLASS)}>
      <h2 className="text-[17px] font-bold leading-[1.4] tracking-[-0.01em] text-white">다녀온 회사의 이야기를 남겨주세요</h2>
      <p className="mt-2 text-[13px] font-normal leading-[1.65] text-white/70">후기를 작성하면 모든 면접 후기 원문을 열람할 수 있습니다.</p>
      <Button type="button" variant="gradient" onClick={onCtaClick} className="mt-4 w-full">
        후기 작성하기
      </Button>
    </section>
  );
}

function IndustryExplorePanel({ onExplore }: { onExplore: (track: JobTrack) => void }) {
  const jobCountByTrack = useMemo(() => {
    const counts: Partial<Record<JobTrack, number>> = {};
    for (const track of jobTracks) {
      counts[track.id] = jobs.filter((job) => job.track === track.id && isJobActive(job)).length;
    }
    return counts;
  }, []);

  return (
    <section className={clsx("border border-border bg-white px-5 py-5", FLUSH_SECTION_CLASS)}>
      <SidebarBlockTitle>업종별 탐색</SidebarBlockTitle>
      <div className="mt-4 divide-y divide-[#edf1f5]">
        {jobTracks.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => onExplore(track.id)}
            className="flex w-full items-center justify-between py-3 text-left transition hover:opacity-70"
          >
            <span className="text-[14px] font-medium text-[#171d26]">{track.label}</span>
            <span className="text-[13px] font-normal text-[#8a94a3]">채용중 {jobCountByTrack[track.id] ?? 0}건</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * 스탯 줄 인라인 강등 실험 중 — 후퇴 시 복원 대상, 삭제 금지.
 *
 * 목록 행 우측에 서던 3열(리뷰|면접 후기|채용중)의 원본이다. 지금은 CompanyListItem이 같은 값을
 * 메타줄 아래 한 줄 텍스트로 강등해 쓰고 있어 호출부가 없다. 실기기 확인 뒤 되돌릴 수 있어 남긴다.
 * 아래 void 한 줄은 그 사이 tsconfig의 noUnusedLocals를 억제하기 위한 것으로, 호출부가 살아나면
 * 함께 지우면 된다(전체 삭제로 후퇴할 경우에는 이 함수와 void 줄을 통째로 지운다).
 */
function CompanyStatColumn({ label, count, href }: { label: string; count: number; href: string }) {
  const isZero = count === 0;
  const numberClassName = clsx(
    "text-[19px] font-bold leading-none",
    isZero
      ? "font-medium text-[#c9c9c9]"
      : "text-[#171d26] group-hover/stat:underline group-hover/stat:underline-offset-[3px]",
  );

  if (isZero) {
    return (
      <div className="flex w-[84px] shrink-0 cursor-default flex-col items-center gap-1.5 py-1 max-[640px]:w-[68px]">
        <span className={numberClassName}>{count}</span>
        <span className="text-[11px] font-normal text-[#8a94a3]">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={(event) => event.stopPropagation()}
      className="group/stat relative z-20 flex w-[84px] shrink-0 flex-col items-center gap-1.5 py-1 max-[640px]:w-[68px]"
    >
      <span className={numberClassName}>{count}</span>
      <span className="text-[11px] font-normal text-[#8a94a3]">{label}</span>
    </Link>
  );
}
void CompanyStatColumn;

/** JobCard.tsx의 [로고|구분선|정보] 문법을 따른다: 이미지 로고는 흰 배경 위에 직접, logoText 폴백만 기존 회색 이니셜 칩 스타일을 유지한다. */
function CompanyLogoCell({ entry }: { entry: CompanyDirectoryEntry }) {
  return (
    <div className="flex h-[52px] w-[120px] shrink-0 items-center justify-center max-[640px]:w-[100px]">
      {/* JobCard와 달리 !w-full을 쓸 수 없다 — 여기는 이미지가 칸 폭(120/100)이 아니라
          별도의 max-w(100/76)로 제한돼 있어, 칸을 채우면 로고가 커진다.
          그래서 종전 max-w/max-h 값을 EntityLogo의 width/height로 그대로 옮기고
          ≤640px 축소만 important로 덮는다. */}
      <EntityLogo
        name={entry.name}
        logoUrl={entry.logoUrl}
        variant="wide"
        width={100}
        height={46}
        padding={0}
        className="max-[640px]:!w-[76px]"
        fallback={<span className="text-[13px] font-semibold text-[#596373]">{getCompanyInitial(entry.name)}</span>}
      />
    </div>
  );
}

function CompanyListItem({ entry }: { entry: CompanyDirectoryEntry }) {
  const metaParts = [jobTrackLabels[entry.track], entry.type, entry.region].filter(Boolean);

  /* 스탯 줄 인라인 강등 실험 — 후퇴(전체 삭제) 시 이 상수와 아래 <p> 두 조각만 지우면 된다.
     라벨은 짧은 형이어야 한다: 390px에서 정보 칸이 173px뿐이라 "리뷰 5 · 면접 5 · 채용 1"은
     115.7px로 들어가지만 긴 형("면접 후기"·"채용중")은 152.2px로 여유가 15px밖에 남지 않는다.
     0은 생략한다 — 목록 50건 중 27건이 리뷰·면접 모두 0이라 전부 적으면 줄의 대부분이 0으로 찬다. */
  const statParts = (
    [
      ["리뷰", entry.companyReviewCount],
      ["면접", entry.interviewReviewCount],
      ["채용", entry.activeJobCount],
    ] as const
  )
    .filter(([, count]) => count > 0)
    .map(([label, count]) => `${label} ${count}`);

  return (
    <article className="relative grid grid-cols-[120px_1px_1fr_auto] items-center gap-x-4 gap-y-3 py-5 pr-9 transition hover:bg-[#f7f8fa] max-[640px]:grid-cols-[100px_1px_1fr]">
      {/* 카드 전체 클릭 영역. 스탯 컬럼이 이 Link 위에 형제(z-20)로 서 있었으나 인라인 줄로 강등되면서
          카드 안에 중첩되지 않는 링크는 하나도 남지 않았다 — 후퇴 시 그 구조가 그대로 돌아온다 */}
      <Link
        href={entry.detailHref}
        aria-label={`${entry.name} 상세 보기`}
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
      />
      <CompanyLogoCell entry={entry} />
      <span aria-hidden="true" className="h-9 w-px shrink-0 self-center bg-[#eeeeee]" />
      <div className="min-w-0 pl-[6px]">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[16px] font-bold text-[#171d26]">{entry.name}</h3>
          {entry.verified ? <ShieldCheck size={14} className="shrink-0 text-[#596373]" aria-label="인증된 기업·기관" /> : null}
        </div>
        <p className="mt-1 truncate text-[13px] font-normal text-[#777777]">{metaParts.join(" · ")}</p>
        {statParts.length ? (
          <p className="mt-0.5 truncate text-[13px] font-normal text-[#8a94a3]">{statParts.join(" · ")}</p>
        ) : null}
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
    <div className="flex h-[160px] flex-col items-center justify-center gap-1.5 text-center">
      <p className="text-[15px] font-medium text-[#303946]">아직 등록된 기업·기관이 없습니다.</p>
      <p className="text-[13px] font-normal text-[#8791a0]">다른 분야를 선택하거나 검색어를 다시 입력해보세요.</p>
    </div>
  );
}

export function CompaniesHomeClient({ directory, companyFeedItems, interviewFeedItems }: CompaniesHomeClientProps) {
  /** 입력값이 곧 필터다 — 제출 버튼이 없어 커밋 단계를 따로 두지 않는다. 목록이 정적 배열 50건이라
   *  디바운스 없이 매 입력마다 걸러도 무리가 없다(/support 검색창과 같은 방식). */
  const [keyword, setKeyword] = useState("");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("리뷰순");
  const [currentPage, setCurrentPage] = useState(1);
  const companyReviewNotice = usePlaceholderNotice();

  /** 로고 스트립 정렬: FEATURED_COMPANY_IDS 우선 → 프로필 보유 기업(detailHref가 /reviews로 폴백되지 않은 경우) → 나머지 로고 보유 기업 순 */
  const logoStripEntries = useMemo(() => {
    const featuredIds = new Set(FEATURED_COMPANY_IDS);
    const featured: CompanyDirectoryEntry[] = [];
    const withProfile: CompanyDirectoryEntry[] = [];
    const rest: CompanyDirectoryEntry[] = [];

    for (const entry of directory) {
      if (!entry.logoUrl) continue;
      if (featuredIds.has(entry.id)) featured.push(entry);
      else if (entry.detailHref === `/companies/${entry.id}`) withProfile.push(entry);
      else rest.push(entry);
    }

    featured.sort((a, b) => FEATURED_COMPANY_IDS.indexOf(a.id) - FEATURED_COMPANY_IDS.indexOf(b.id));
    return [...featured, ...withProfile, ...rest];
  }, [directory]);

  const topReviewedCompanies = useMemo(
    () => [...directory].filter((entry) => entry.reviewCount > 0).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5),
    [directory],
  );

  /** 접힘 판정과 목록 필터가 같은 값을 봐야 "검색 중인데 아직 전체 목록"인 순간이 생기지 않는다 */
  const isSearching = keyword.trim().length > 0;

  const filteredDirectory = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return directory.filter((entry) => {
      const matchesTrack = matchesTrackFilter(entry.track, entry.industryGroup, trackFilter);
      const matchesKeyword = !normalizedKeyword || entry.name.toLowerCase().includes(normalizedKeyword);
      return matchesTrack && matchesKeyword;
    });
  }, [directory, trackFilter, keyword]);

  const sortedDirectory = useMemo(() => sortDirectory(filteredDirectory, sortOption), [filteredDirectory, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [trackFilter, sortOption, keyword]);

  const totalPages = Math.max(1, Math.ceil(sortedDirectory.length / PAGE_SIZE));
  // 필터로 목록이 짧아졌는데 currentPage가 아직 뒤 페이지에 남아 있는 경우를 막는다 — 슬라이스와 Pagination이 같은 값을 쓴다.
  const safePage = Math.min(currentPage, totalPages);

  const visibleDirectory = useMemo(
    () => sortedDirectory.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sortedDirectory, safePage],
  );

  const handleRequestWriteCompanyReview = () => {
    companyReviewNotice.show("기업 리뷰 작성 화면은 준비 중입니다.");
  };

  const handleScrollToDirectory = () => {
    document.getElementById("company-directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExploreTrack = (track: JobTrack) => {
    setTrackFilter(trackToDirectoryFilter[track] ?? "all");
    handleScrollToDirectory();
  };

  return (
    <>
      {/* 히어로는 .app-shell 밖에 세운다 — 밴드가 화면 폭을 꽉 채우고, 안쪽 텍스트는 밴드가 가진
          자체 셸(app-shell--default)이 잡는다. 셸 안의 본문은 그 아래에서 다시 시작한다. */}
      <CompaniesHubHero />

      <div className="app-shell">
        {/* 검색 중에는 둘러보기용 블록(로고 띠·최근 이야기·사이드바)을 접어 결과 목록을 첫 화면으로 끌어올린다.
            언마운트가 아니라 hidden인 이유는 RecentStoriesFeed가 자체 상태(feedFilter)를 들고 있어서다 —
            지웠다 다시 켜면 사용자가 골라 둔 피드 탭이 "전체"로 되돌아간다.
            둘을 한 래퍼로 묶은 것은 grid에 hidden을 얹으면 같은 display 축이라 두 유틸리티의
            출력 순서에 기대게 되기 때문이다. 래퍼는 스타일이 없어 접지 않은 상태의 레이아웃은 종전 그대로다. */}
        <div className={clsx(isSearching && "hidden")}>
          <CompanyLogoStrip entries={logoStripEntries} />

          <div className="mt-10 grid grid-cols-[minmax(0,1fr)_280px] gap-10 max-[1024px]:grid-cols-1 max-[1024px]:gap-8">
            <RecentStoriesFeed companyItems={companyFeedItems} interviewItems={interviewFeedItems} />
            <aside className="space-y-8">
              <IndustryExplorePanel onExplore={handleExploreTrack} />
              <TopReviewedCompaniesPanel entries={topReviewedCompanies} />
              <WriteReviewCtaPanel onCtaClick={handleRequestWriteCompanyReview} />
            </aside>
          </div>
        </div>

        <section id="company-directory" className={clsx("mt-14 border border-border bg-white px-6 py-6", FLUSH_SECTION_CLASS)}>
          {/* 검색창과 정렬 칩은 둘 다 이 목록을 좁히는 컨트롤이라 제목 맞은편 한 묶음으로 세운다.
              ≤640px에서는 이 묶음이 통째로 다음 줄 전폭을 쓰고, 그 안에서 검색창이 한 줄을
              혼자 차지한 뒤 정렬 칩이 아래로 내려간다 — 220px 입력칸과 278px 칩을 342px 폭에
              나란히 세울 수 없기 때문이다. 높이는 서로 다르게 둔다(검색 h-10 · 칩 h-9):
              입력칸은 기업센터 툴바가 쓰는 값, 칩은 이 화면이 쓰던 값 그대로다. */}
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#111111]">기업·기관 리스트</h2>
            <div className="flex items-center gap-2.5 max-[640px]:w-full max-[640px]:flex-wrap">
              <CompanySearchBar keyword={keyword} onKeywordChange={setKeyword} />
              <div className="grid h-9 grid-cols-3 overflow-hidden border border-[#dce2ea] bg-white">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSortOption(option)}
                    className={clsx(
                      "min-w-[92px] border-r border-[#dce2ea] px-3 text-[12px] font-medium last:border-r-0",
                      sortOption === option ? "bg-[#111111] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <TrackTabs active={trackFilter} onChange={setTrackFilter} />

          {visibleDirectory.length ? (
            <div className="divide-y divide-[#e5e9ef]">
              {visibleDirectory.map((entry) => (
                <CompanyListItem key={`${entry.id}-${currentPage}`} entry={entry} />
              ))}
            </div>
          ) : (
            <DirectoryEmptyState />
          )}
        </section>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          ariaLabel="기업·기관 목록 페이지"
        />
        <PlaceholderNotice message={companyReviewNotice.message} />
      </div>
    </>
  );
}
