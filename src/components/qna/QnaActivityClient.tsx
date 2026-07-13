"use client";

import clsx from "clsx";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Eyebrow, PageTitle, typeScale } from "@/components/ui/Typography";
import { getMyQnaComments, getMyQnaPosts, getQnaPostById, type MyQnaCommentEntry } from "@/data/qna";
import { readQnaScraps, writeQnaScraps } from "@/components/qna/qnaScraps";
import type { QnaListEntry, QnaType } from "@/types/qna";

type ActivityTab = "scraps" | "posts" | "comments";

const qnaTypeLabel: Record<QnaType, string> = {
  pharmacist: "약사 QNA",
  industry: "산업 QNA",
};

function isActivityTab(value: string | null): value is ActivityTab {
  return value === "scraps" || value === "posts" || value === "comments";
}

function ActivityTabControl({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: ActivityTab; label: string }[];
  value: ActivityTab;
  onChange: (tab: ActivityTab) => void;
}) {
  return (
    <div className="grid grid-cols-3 overflow-hidden border border-[#dce2ea] bg-white" role="tablist" aria-label="내 활동 탭">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex h-11 items-center justify-center border-r border-[#dce2ea] px-3 text-[13px] font-medium last:border-r-0",
              active ? "bg-[#050505] text-white" : "text-[#3d4653] hover:bg-[#f4f4f4]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ActivityEmptyState({ message }: { message: string }) {
  return <div className="flex h-[140px] items-center justify-center text-[13px] font-normal text-[#8791a0]">{message}</div>;
}

function PostActivityRow({ entry, onUnscrap }: { entry: QnaListEntry; onUnscrap?: () => void }) {
  const excerpt = entry.body[0];
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Link href={`/qna/${entry.id}`} className="text-[15px] font-bold leading-[1.4] text-[#171d26] transition hover:text-[#111111]">
          {entry.title}
        </Link>
        <p className="mt-1 text-[13px] font-normal text-[#8b95a1]">
          {qnaTypeLabel[entry.qnaType]} · {entry.createdAtLabel}
        </p>
        <p className="mt-1.5 line-clamp-1 text-[14px] font-normal leading-[1.6] text-[#596373]">{excerpt}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-normal text-[#8b95a1]">
          {entry.tags.map((tag) => (
            <span key={tag} className="whitespace-nowrap">
              #{tag}
            </span>
          ))}
        </p>
      </div>
      {onUnscrap ? (
        <button
          type="button"
          onClick={onUnscrap}
          className="inline-flex h-8 shrink-0 items-center border border-[#cfd8e3] bg-white px-3 text-[12px] font-medium text-[#596373] transition hover:border-[#111111] hover:text-[#111111]"
        >
          스크랩 해제
        </button>
      ) : null}
    </div>
  );
}

function CommentActivityRow({ entry }: { entry: MyQnaCommentEntry }) {
  const qnaType = getQnaPostById(entry.postId)?.qnaType;
  return (
    <div className="flex items-start gap-2.5">
      <MessageCircle size={16} className="mt-0.5 shrink-0 text-[#9aa3ad]" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold leading-[1.4] text-[#171d26]">{entry.body}</p>
        <p className="mt-1 text-[13px] font-normal text-[#8b95a1]">
          {qnaType ? qnaTypeLabel[qnaType] : ""} · {entry.createdAtLabel}
        </p>
        <Link
          href={`/qna/${entry.postId}`}
          className="mt-1.5 inline-block truncate text-[13px] font-medium text-[#596373] transition hover:text-[#111111]"
        >
          원문: {entry.postTitle}
        </Link>
      </div>
    </div>
  );
}

export function QnaActivityClient() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("scraps");
  const [scrapIds, setScrapIds] = useState<string[]>([]);

  useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (isActivityTab(tabParam)) {
      setActiveTab(tabParam);
    }
    setScrapIds([...readQnaScraps()]);
  }, []);

  const scrapEntries = useMemo(() => {
    return scrapIds
      .map((id) => getQnaPostById(id))
      .filter((entry): entry is QnaListEntry => Boolean(entry))
      .sort((a, b) => a.minutesAgo - b.minutesAgo);
  }, [scrapIds]);

  const myPosts = useMemo(() => getMyQnaPosts(), []);
  const myComments = useMemo(() => getMyQnaComments(), []);

  const handleUnscrap = (id: string) => {
    const scraps = readQnaScraps();
    scraps.delete(id);
    writeQnaScraps(scraps);
    setScrapIds((current) => current.filter((scrapId) => scrapId !== id));
  };

  const tabs: { id: ActivityTab; label: string }[] = [
    { id: "scraps", label: `스크랩한 글 ${scrapEntries.length}` },
    { id: "posts", label: `내가 쓴 글 ${myPosts.length}` },
    { id: "comments", label: `내가 단 댓글 ${myComments.length}` },
  ];

  return (
    <main className="bg-[#f7f8fa] pb-20">
      <div className="app-shell pt-8">
        <PageBreadcrumb className="mb-5" items={[{ label: "QNA", href: "/qna" }, { label: "내 활동" }]} />
        <Eyebrow>THE PHARMA QNA</Eyebrow>
        <PageTitle>내 활동</PageTitle>
        <p className={clsx("mt-3 max-w-[640px]", typeScale.body, "text-[#596373]")}>내 QNA 활동을 한곳에서 확인할 수 있습니다.</p>

        <div className="mt-8">
          <ActivityTabControl tabs={tabs} value={activeTab} onChange={setActiveTab} />
        </div>

        <section className="mt-5 border border-[#e5e9ef] bg-white p-5">
          {activeTab === "scraps" ? (
            scrapEntries.length ? (
              <div className="divide-y divide-[#edf1f5]">
                {scrapEntries.map((entry) => (
                  <div key={entry.id} className="py-4 first:pt-0 last:pb-0">
                    <PostActivityRow entry={entry} onUnscrap={() => handleUnscrap(entry.id)} />
                  </div>
                ))}
              </div>
            ) : (
              <ActivityEmptyState message="아직 스크랩한 글이 없습니다." />
            )
          ) : null}

          {activeTab === "posts" ? (
            myPosts.length ? (
              <div className="divide-y divide-[#edf1f5]">
                {myPosts.map((entry) => (
                  <div key={entry.id} className="py-4 first:pt-0 last:pb-0">
                    <PostActivityRow entry={entry} />
                  </div>
                ))}
              </div>
            ) : (
              <ActivityEmptyState message="아직 작성한 글이 없습니다." />
            )
          ) : null}

          {activeTab === "comments" ? (
            myComments.length ? (
              <div className="divide-y divide-[#edf1f5]">
                {myComments.map((entry) => (
                  <div key={entry.id} className="py-4 first:pt-0 last:pb-0">
                    <CommentActivityRow entry={entry} />
                  </div>
                ))}
              </div>
            ) : (
              <ActivityEmptyState message="아직 작성한 댓글이 없습니다." />
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
