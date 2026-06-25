"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Eyebrow, PageTitle, typeScale } from "@/components/ui/Typography";
import { isQnaPost, getEntryCommentCount, qnaCategoryFilters } from "@/data/qna";
import type { QnaListEntry, QnaType } from "@/types/qna";
import { PopularTagsPanel, QnaAvatar, QnaNotice, QnaOperationPrinciplePanel, QnaTagChip, showQnaNotice } from "@/components/qna/QnaShared";
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
    <div className="flex h-10 shrink-0 overflow-hidden border border-[#dfe4ea] bg-white" role="tablist" aria-label="QNA 유형">
      {qnaTypeTabs.map((tab) => {
        const active = tab.id === activeType;
        return (
          <Link
            key={tab.id}
            href={withTypeParam(tab.id, previewQuery)}
            role="tab"
            aria-selected={active}
            className={clsx(
              "flex h-full min-w-[100px] items-center justify-center px-4 text-[13px] font-medium transition-colors",
              active ? "text-white" : "text-[#596373] hover:text-[#111111]",
            )}
            style={active ? { backgroundImage: "var(--gradient-cta)" } : undefined}
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
    <div className="grid h-[34px] shrink-0 grid-cols-3 overflow-hidden border border-[#dce2ea] bg-white">
      {qnaSortOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={clsx(
            "min-w-[72px] border-r border-[#dce2ea] px-3 text-[12px] font-medium last:border-r-0",
            value === option ? "bg-[#050505] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function QnaListCard({ entry, previewQuery }: { entry: QnaListEntry; previewQuery: string }) {
  const clickable = isQnaPost(entry);
  const excerpt = isQnaPost(entry) ? entry.body[0] : entry.preview;
  const commentCount = getEntryCommentCount(entry);
  const isBest = isQnaPost(entry) && Boolean(entry.isBest);

  const content = (
    <article className={clsx("border border-[#e5e9ef] bg-white p-5 transition", clickable && "hover:border-[#111111]")}>
      <div className="flex flex-wrap items-center gap-1.5">
        {isBest ? <span className="inline-flex h-6 items-center bg-[#111111] px-2 text-[11px] font-bold text-white">BEST</span> : null}
        {entry.tags.map((tag) => (
          <QnaTagChip key={tag}>{tag}</QnaTagChip>
        ))}
      </div>
      <h3 className="mt-2.5 text-[17px] font-bold leading-[1.4] tracking-[-0.01em] text-[#171d26]">{entry.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] font-normal leading-[1.6] text-[#68717e]">{excerpt}</p>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#edf1f5] pt-3 text-[12px] font-normal text-[#8a94a3]">
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <QnaAvatar authorType={entry.authorType} initial={entry.avatarInitial} size={18} />
          {entry.authorName} · 댓글 {commentCount} · 공감 {entry.likeCount}
        </span>
        <span className="shrink-0">{entry.createdAtLabel}</span>
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

function TrendingPostsPanel({ entries, previewQuery }: { entries: QnaListEntry[]; previewQuery: string }) {
  return (
    <section className="border border-[#e5e9ef] bg-white p-5">
      <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">
        <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
        실시간 인기 글
      </h2>
      <ol className="mt-4 space-y-3.5">
        {entries.map((entry, index) => {
          const clickable = isQnaPost(entry);
          const row = (
            <span className="flex items-start gap-3">
              <span className="text-[15px] font-bold text-[#a0a9b7]">{index + 1}</span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-[#303946]">{entry.title}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-[#a0a9b7]">
                  #{entry.tags[0]} · 댓글 {getEntryCommentCount(entry)}
                </span>
              </span>
            </span>
          );
          return (
            <li key={entry.id}>
              {clickable ? (
                <Link href={`/qna/${entry.id}${previewQuery}`} className="transition hover:opacity-70">
                  {row}
                </Link>
              ) : (
                <div className="cursor-default">{row}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
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
    setCategoryFilter("전체");
    setSortOption("추천순");
  }, [activeType]);

  const filterChips = useMemo(() => ["전체", ...qnaCategoryFilters[activeType]], [activeType]);

  const visibleEntries = useMemo(() => {
    const filtered =
      categoryFilter === "전체" ? entries : entries.filter((entry) => entry.category === categoryFilter || entry.tags.includes(categoryFilter));

    return [...filtered].sort((a, b) => {
      if (sortOption === "공감순") return b.likeCount - a.likeCount;
      if (sortOption === "최신순") return a.minutesAgo - b.minutesAgo;
      const aBest = isQnaPost(a) && a.isBest ? 1 : 0;
      const bBest = isQnaPost(b) && b.isBest ? 1 : 0;
      if (aBest !== bBest) return bBest - aBest;
      return b.likeCount - a.likeCount;
    });
  }, [entries, categoryFilter, sortOption]);

  return (
    <main className="bg-[#f7f8fa] pb-20">
      <div className="app-shell pt-8">
        <PageBreadcrumb className="mb-5" items={[{ label: "채용 QNA" }]} />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow>THE PHARMA QNA</Eyebrow>
            <PageTitle className="mt-2">채용 QNA</PageTitle>
            <p className={clsx("mt-3 max-w-[560px]", typeScale.body, "text-[#596373]")}>{qnaTypeIntro[activeType]}</p>
          </div>
          {canSwitchType ? <QnaTypeToggle activeType={activeType} previewQuery={previewQuery} /> : null}
        </div>

        <QnaComposer
          activeType={activeType}
          isLoggedIn={isLoggedIn}
          isVerifiedPharmacist={canSwitchType}
          onNotify={(message) => showQnaNotice(setNotice, message)}
        />

        <nav className="mt-8 flex flex-wrap gap-2 border-b border-[#eceff1] pb-3.5" aria-label="QNA 카테고리">
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setCategoryFilter(chip)}
              className={clsx(
                "h-[36px] shrink-0 whitespace-nowrap border px-4 text-[13px] font-medium transition-colors",
                categoryFilter === chip
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
              )}
            >
              {chip === "전체" ? chip : `#${chip}`}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_280px] gap-8 max-[1024px]:grid-cols-1">
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

          <aside className="space-y-5">
            <TrendingPostsPanel entries={popularEntries} previewQuery={previewQuery} />
            <PopularTagsPanel />
            <QnaOperationPrinciplePanel />
          </aside>
        </div>

        <QnaNotice message={notice} />
      </div>
    </main>
  );
}
