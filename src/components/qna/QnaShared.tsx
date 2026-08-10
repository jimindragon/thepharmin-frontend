"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getEntryCommentCount, getMyQnaComments, getMyQnaPosts, getPopularQnaTags, getQnaPostById, qnaOperationPrinciple } from "@/data/qna";
import { readQnaScraps } from "@/components/qna/qnaScraps";
import { PlaceholderNotice, showPlaceholderNotice } from "@/components/shared/PlaceholderNotice";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import type { QnaAuthorType, QnaListEntry, QnaType } from "@/types/qna";

/**
 * 글쓰기/댓글/공감/스크랩/공유/신고 — 백엔드가 없는 동작은 이 토스트로 통일해서 알린다.
 * 마크업·지속시간은 플랫폼 공용 부품(shared/PlaceholderNotice)에 있고, 아래 둘은 QNA 호출부가
 * 쓰던 이름을 그대로 유지하기 위한 얇은 껍데기다.
 */
export function showQnaNotice(setNotice: (message: string) => void, message: string) {
  showPlaceholderNotice(setNotice, message);
}

export function QnaNotice({ message }: { message: string }) {
  return <PlaceholderNotice message={message} />;
}

const avatarToneClassName: Record<QnaAuthorType, string> = {
  anonymous: "border border-[#dfe4ea] bg-[#f4f4f4] text-[#555555]",
  company: "bg-[#111111] text-white",
  headhunter: "bg-[#3d4653] text-white",
};

export function QnaAvatar({ authorType, initial, size = 36 }: { authorType: QnaAuthorType; initial: string; size?: number }) {
  return (
    <span
      className={clsx("grid shrink-0 place-items-center text-[13px] font-bold", avatarToneClassName[authorType])}
      style={{ width: size, height: size, fontSize: size <= 28 ? 12 : 13 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

/** "익명"/"작성자"는 익명 계열이라 서로 구분되면 안 된다 — QNA 도메인 규칙이라 PersonAvatar가 아니라 여기 남는다 */
function isAnonymousNickname(nickname: string): boolean {
  return nickname === "익명" || nickname === "작성자";
}

/**
 * QNA 카드 상단 작성자 블록 전용 원형 아바타 — 닉네임 이니셜을 그대로 쓴다.
 * 익명 계열은 seed 없이 넘겨 항상 같은 단색을 받고,
 * 실명(기업·헤드헌터·비익명 사용자)만 id를 seed로 넘겨 회색 톤 로테이션을 받는다.
 * 톤 배열과 해시는 PersonAvatar가 갖고 있고, 이 함수는 "무엇을 seed로 줄지"만 정한다.
 */
export function QnaAuthorAvatar({ id, nickname, size = 38 }: { id: string; nickname: string; size?: number }) {
  return (
    <PersonAvatar
      label={nickname}
      size={size}
      seed={isAnonymousNickname(nickname) ? undefined : id}
      className="shrink-0"
    />
  );
}

export function QnaAuthorLabelBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-1.5 text-[12px] font-medium text-[#596373]">
      {children}
    </span>
  );
}

interface PopularTagsPanelProps {
  activeType: QnaType;
  /** 상단 필터와 공유하는 현재 선택값 — 일치하는 태그를 강조 표시 */
  selectedTag?: string;
  /** 목록 페이지: 클릭 시 로컬 필터 상태를 변경 */
  onTagClick?: (tag: string) => void;
  /** 상세 페이지: 클릭 시 /qna로 이동(로컬 필터 상태가 없어 콜백 대신 링크 사용) */
  tagHref?: (tag: string) => string;
  /** 호출부가 폭에 따라 노출을 제어하기 위한 통로 — 패널 자체는 반응형을 갖지 않는다 */
  className?: string;
}

export function PopularTagsPanel({ activeType, selectedTag, onTagClick, tagHref, className }: PopularTagsPanelProps) {
  const tags = getPopularQnaTags(activeType);

  return (
    <section className={clsx("border border-border bg-white p-5", className)}>
      <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">
        <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
        인기 태그
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selectedTag === tag;
          const className = clsx(
            "inline-flex h-6 items-center whitespace-nowrap border border-border px-2 text-[12px] transition-colors",
            active ? "font-bold text-[#111111]" : "font-medium text-[#3d4653] hover:text-[#111111]",
          );
          return tagHref ? (
            <Link key={tag} href={tagHref(tag)} className={className}>
              #{tag}
            </Link>
          ) : (
            <button key={tag} type="button" onClick={() => onTagClick?.(tag)} className={className}>
              #{tag}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function QnaOperationPrinciplePanel() {
  return (
    <section className="border border-border bg-[#050505] p-5 text-white">
      <h2 className="text-[17px] font-bold leading-[1.4] tracking-[-0.01em] text-white">{qnaOperationPrinciple.title}</h2>
      <p className="mt-2.5 text-[13px] font-normal leading-[1.8] text-white/70">{qnaOperationPrinciple.description}</p>
    </section>
  );
}

/** 허브/상세 사이드바가 공유하는 "실시간 인기 글" 패널 — 대상 목록만 호출부에서 넘긴다 */
export function TrendingPostsPanel({
  entries,
  previewQuery,
  className,
}: {
  entries: QnaListEntry[];
  previewQuery: string;
  /** 호출부가 폭에 따라 노출을 제어하기 위한 통로 — 패널 자체는 반응형을 갖지 않는다 */
  className?: string;
}) {
  return (
    <section className={clsx("border border-border bg-white p-5", className)}>
      <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">
        <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
        실시간 인기 글
      </h2>
      <ol className="mt-4 space-y-4">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <Link href={`/qna/${entry.id}${previewQuery}`} className="transition hover:opacity-70">
              <span className="flex items-start gap-3">
                <span className="text-[13px] font-medium text-[#6c7684]">{index + 1}</span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[14px] font-semibold text-[#1c232e]">{entry.title}</span>
                  <span className="mt-0.5 block text-[12px] font-normal text-[#a0a9b7]">
                    #{entry.tags[0]} · 댓글 {getEntryCommentCount(entry)}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MyActivitySummaryRow({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-2.5 text-[13px] font-medium text-[#596373] transition hover:text-[#111111]"
    >
      <span>{label}</span>
      <span>{count}</span>
    </Link>
  );
}

interface MyActivityPanelProps {
  activeType: QnaType;
  /**
   * "panel"   — 사이드바 기본형(제목 + 세로 3행).
   * "compact" — 1열 승격형(제목 없이 가로 3칸). 사이드바가 본문 맨 아래로 밀리는 폭에서
   *             본문 상단으로 끌어올려 쓰는 형태라 세로 길이를 줄이고 탭 타깃을 키운다.
   *             열 수가 3으로 고정이라 divide-x 대신 셀 border-r을 쓴다(가이드라인 3절).
   * 이 패널은 /qna/activity로 가는 앱 내 유일한 진입점이므로 어느 폭에서도 사라지면 안 된다.
   */
  variant?: "panel" | "compact";
  /** 호출부가 폭에 따라 노출을 제어하기 위한 통로 — 패널 자체는 반응형을 갖지 않는다 */
  className?: string;
}

/** 허브/상세 사이드바가 공유하는 "내 활동" 카드 — 스크랩 카운트만 activeType 기준으로 필터링한다 */
export function MyActivityPanel({ activeType, variant = "panel", className }: MyActivityPanelProps) {
  const [scrapCount, setScrapCount] = useState(0);
  const myPostsCount = getMyQnaPosts().length;
  const myCommentsCount = getMyQnaComments().length;

  useEffect(() => {
    const scrapped = [...readQnaScraps()]
      .map((id) => getQnaPostById(id))
      .filter((entry): entry is QnaListEntry => Boolean(entry && entry.qnaType === activeType));
    setScrapCount(scrapped.length);
  }, [activeType]);

  /** 두 변형이 같은 항목·순서·링크를 쓰도록 한 곳에서만 정의한다 */
  const items = [
    { label: "스크랩한 글", count: scrapCount, href: "/qna/activity?tab=scraps" },
    { label: "내가 쓴 글", count: myPostsCount, href: "/qna/activity?tab=posts" },
    { label: "내가 단 댓글", count: myCommentsCount, href: "/qna/activity?tab=comments" },
  ];

  if (variant === "compact") {
    return (
      <section className={clsx("border border-border bg-white", className)} aria-label="내 활동">
        <div className="grid grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 border-r border-[#edf1f5] py-3 transition last:border-r-0 hover:bg-[#f7f8fa]"
            >
              <span className="text-[12px] font-medium text-[#8a94a3]">{item.label}</span>
              <span className="text-[16px] font-bold text-[#171d26]">{item.count}</span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={clsx("border border-border bg-white p-5", className)}>
      <h2 className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-[#17202c]">
        <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
        내 활동
      </h2>

      <div className="mt-3 divide-y divide-[#edf1f5]">
        {items.map((item) => (
          <MyActivitySummaryRow key={item.href} label={item.label} count={item.count} href={item.href} />
        ))}
      </div>
    </section>
  );
}
