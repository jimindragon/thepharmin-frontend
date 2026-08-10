"use client";

import clsx from "clsx";
import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getEntryCommentCount, qnaCategoryFilters } from "@/data/qna";
import type { QnaListEntry, QnaType } from "@/types/qna";
import {
  MyActivityPanel,
  PopularTagsPanel,
  QnaAuthorAvatar,
  QnaNotice,
  QnaOperationPrinciplePanel,
  showQnaNotice,
  TrendingPostsPanel,
} from "@/components/qna/QnaShared";
import { QnaComposer } from "@/components/qna/QnaComposer";

type QnaSortOption = "추천순" | "최신순" | "공감순";
const qnaSortOptions: QnaSortOption[] = ["추천순", "최신순", "공감순"];

const qnaTypeTabs: { id: QnaType; label: string }[] = [
  { id: "pharmacist", label: "약사 QNA" },
  { id: "industry", label: "산업 QNA" },
];

const qnaTypeIntro: Record<QnaType, string> = {
  pharmacist: "약국·병원에서 일하는 약사 인증 회원을 위한 채용·이직 QNA입니다.",
  industry: "제약·바이오 산업 종사자를 위한 채용·이직 QNA입니다.",
};

function withTypeParam(type: QnaType, previewQuery: string) {
  const params = new URLSearchParams(previewQuery.replace(/^\?/, ""));
  params.set("type", type);
  return `/qna?${params.toString()}`;
}

function QnaTypeToggle({ activeType, previewQuery }: { activeType: QnaType; previewQuery: string }) {
  return (
    <div className="flex h-9 shrink-0 overflow-hidden border border-[#dce2ea] bg-white" role="tablist" aria-label="QNA 유형">
      {qnaTypeTabs.map((tab) => {
        const active = tab.id === activeType;
        return (
          <Link
            key={tab.id}
            href={withTypeParam(tab.id, previewQuery)}
            role="tab"
            aria-selected={active}
            className={clsx(
              "flex h-full min-w-[100px] items-center justify-center border-r border-[#dce2ea] px-4 text-[13px] font-medium transition-colors last:border-r-0",
              active ? "bg-[#111111] text-white" : "text-[#596373] hover:bg-[#f4f4f4] hover:text-[#111111]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function SortControl({ value, onChange }: { value: QnaSortOption; onChange: (option: QnaSortOption) => void }) {
  return (
    <div className="grid h-[36px] shrink-0 grid-cols-3 overflow-hidden border border-[#dce2ea] bg-white">
      {qnaSortOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={clsx(
            "min-w-[72px] border-r border-[#dce2ea] px-3 text-[12px] font-medium last:border-r-0",
            value === option ? "bg-[#111111] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function QnaListCard({ entry, previewQuery }: { entry: QnaListEntry; previewQuery: string }) {
  const clickable = true;
  const excerpt = entry.body[0];
  const commentCount = getEntryCommentCount(entry);
  const isBest = Boolean(entry.isBest);

  const content = (
    <article className={clsx("border border-[#e5e9ef] bg-white p-5 transition", clickable && "hover:border-[#111111]")}>
      {isBest ? (
        <span className="mb-2.5 inline-flex h-6 items-center bg-[#111111] px-2 text-[12px] font-semibold text-white">BEST</span>
      ) : null}

      <div className="flex items-center gap-2.5">
        <QnaAuthorAvatar id={entry.id} nickname={entry.nickname} size={38} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#3d4653]">{entry.nickname}</p>
          <p className="mt-0.5 truncate text-[13px] font-normal text-[#8b95a1]">
            {[entry.jobRole, entry.createdAtLabel].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <h3 className="mt-3 text-[17px] font-semibold leading-[1.4] tracking-[-0.01em] text-[#171d26] max-[760px]:text-[16px]">{entry.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-[14px] font-normal leading-[1.6] text-[#596373]">{excerpt}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-[#edf1f5] pt-3">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-[#596373]">
          {entry.tags.map((tag) => (
            <span key={tag} className="whitespace-nowrap">
              #{tag}
            </span>
          ))}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 text-[13px] font-normal text-[#8b95a1]">
          <span className="whitespace-nowrap">댓글 {commentCount}</span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp size={14} aria-hidden="true" />
            {entry.likeCount}
          </span>
        </span>
      </div>
    </article>
  );

  if (!clickable) {
    return <div className="cursor-default">{content}</div>;
  }

  return (
    <Link href={`/qna/${entry.id}${previewQuery}`} className="block">
      {content}
    </Link>
  );
}

function QnaListEmptyState() {
  return (
    <div className="flex h-[160px] flex-col items-center justify-center gap-1.5 border border-[#e5e9ef] bg-[#fbfcfd] text-center">
      <p className="text-[14px] font-semibold text-[#3d4653]">조건에 맞는 글이 없습니다.</p>
      <p className="text-[13px] font-normal text-[#8791a0]">다른 카테고리나 정렬을 선택해보세요.</p>
    </div>
  );
}

interface QnaHomeClientProps {
  activeType: QnaType;
  canSwitchType: boolean;
  isLoggedIn: boolean;
  entries: QnaListEntry[];
  popularEntries: QnaListEntry[];
  previewQuery: string;
}

export function QnaHomeClient({ activeType, canSwitchType, isLoggedIn, entries, popularEntries, previewQuery }: QnaHomeClientProps) {
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [sortOption, setSortOption] = useState<QnaSortOption>("추천순");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    /** 상세페이지 "인기 태그" 클릭(/qna?type=...&tag=...)으로 들어왔을 때 해당 태그로 바로 필터링 */
    const tagParam = new URLSearchParams(window.location.search).get("tag");
    const isValidTag = Boolean(tagParam) && qnaCategoryFilters[activeType].includes(tagParam!);
    setCategoryFilter(isValidTag ? tagParam! : "전체");
    setSortOption("추천순");
  }, [activeType]);

  const filterChips = useMemo(() => ["전체", ...qnaCategoryFilters[activeType]], [activeType]);

  const visibleEntries = useMemo(() => {
    const filtered = categoryFilter === "전체" ? entries : entries.filter((entry) => entry.tags.includes(categoryFilter));

    return [...filtered].sort((a, b) => {
      if (sortOption === "공감순") return b.likeCount - a.likeCount;
      if (sortOption === "최신순") return a.minutesAgo - b.minutesAgo;
      const aBest = a.isBest ? 1 : 0;
      const bBest = b.isBest ? 1 : 0;
      if (aBest !== bBest) return bBest - aBest;
      return b.likeCount - a.likeCount;
    });
  }, [entries, categoryFilter, sortOption]);

  return (
    <main className="bg-[#f7f8fa] pb-20 max-[760px]:pb-16">
      <div className="app-shell pt-8 max-[760px]:pt-6">
        <PageHeader
          breadcrumbLabel="채용 QNA"
          eyebrow="THE PHARMA QNA"
          title="채용 QNA"
          description={qnaTypeIntro[activeType]}
          rightSlot={canSwitchType ? <QnaTypeToggle activeType={activeType} previewQuery={previewQuery} /> : undefined}
        />

        {/* 사이드바가 본문 맨 아래로 밀리는 1열 폭에서만 본문 상단으로 끌어올린다 —
            "내 활동"은 /qna/activity로 가는 앱 내 유일한 진입점이라 하단 사각지대에 두면 도달률이 0에 수렴한다.
            아래 aside 사본과 max-[1040px]/min-[1041px]로 정확히 상보라 겹치거나 비는 구간이 없다. */}
        {isLoggedIn ? <MyActivityPanel activeType={activeType} variant="compact" className="mt-6 min-[1041px]:hidden" /> : null}

        <QnaComposer
          activeType={activeType}
          isLoggedIn={isLoggedIn}
          isVerifiedPharmacist={canSwitchType}
          onNotify={(message) => showQnaNotice(setNotice, message)}
        />

        {/* 모바일은 wrap 대신 1행 가로 스크롤 — 10개짜리 태그 필터라 전부 보일 필요가 없고,
            wrap하면 3줄 124px을 먹어 첫 화면에 글 카드가 한 장도 들어오지 않는다 */}
        <nav
          className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3.5 max-[760px]:mt-6 max-[760px]:flex-nowrap max-[760px]:overflow-x-auto max-[760px]:pb-1"
          aria-label="QNA 카테고리"
        >
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setCategoryFilter(chip)}
              className={clsx(
                "h-[36px] shrink-0 whitespace-nowrap px-4 text-[13px] font-medium transition-colors",
                categoryFilter === chip
                  ? "border border-[#111111] bg-[#111111] text-white"
                  : "border border-[#dce2ea] bg-white text-[#3d4653] hover:border-[#cfd8e3] hover:bg-[#f7f8fa] hover:text-[#111111]",
              )}
            >
              {chip === "전체" ? chip : `#${chip}`}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_280px] gap-8 max-[1040px]:grid-cols-1 max-[760px]:mt-6 max-[760px]:gap-6">
          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <p className="text-[14px] font-medium text-[#596373]">전체 {visibleEntries.length}개의 글</p>
              <SortControl value={sortOption} onChange={setSortOption} />
            </div>

            {visibleEntries.length ? (
              <div className="flex flex-col gap-3">
                {visibleEntries.map((entry) => (
                  <QnaListCard key={entry.id} entry={entry} previewQuery={previewQuery} />
                ))}
              </div>
            ) : (
              <QnaListEmptyState />
            )}
          </div>

          <aside className="space-y-5 max-[760px]:space-y-4">
            {/* 1열에서는 본문 목록과 완전 중복 (추천순 상위 = 인기 글, 칩 nav = 태그 풀) */}
            <TrendingPostsPanel entries={popularEntries} previewQuery={previewQuery} className="max-[1040px]:hidden" />
            {isLoggedIn ? <MyActivityPanel activeType={activeType} className="max-[1040px]:hidden" /> : null}
            <PopularTagsPanel
              activeType={activeType}
              selectedTag={categoryFilter !== "전체" ? categoryFilter : undefined}
              onTagClick={(tag) => setCategoryFilter(tag)}
              className="max-[1040px]:hidden"
            />
            <QnaOperationPrinciplePanel />
          </aside>
        </div>

        <QnaNotice message={notice} />
      </div>
    </main>
  );
}
