import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { getPopularQnaTags, qnaOperationPrinciple } from "@/data/qna";
import type { QnaAuthorType, QnaType } from "@/types/qna";

/** 글쓰기/댓글/공감/스크랩/공유/신고 — 백엔드가 없는 동작은 이 토스트로 통일해서 알린다 */
export function showQnaNotice(setNotice: (message: string) => void, message: string) {
  setNotice(message);
  window.setTimeout(() => setNotice(""), 2400);
}

export function QnaNotice({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mt-3 text-[12px] font-medium text-[#596373]">{message}</p>;
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

/** id 문자열을 0~mod-1 범위로 결정론적으로 매핑(djb2) — Math.random 대신 매 렌더링 동일한 값을 내도록 */
function hashToIndex(id: string, mod: number): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i += 1) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

const authorAvatarTones = [
  "bg-[#eef1f5] text-[#596373]",
  "bg-[#dde3ea] text-[#45505f]",
  "bg-[#c9d1db] text-[#333d4b]",
  "bg-[#b3bec9] text-[#202734]",
];

/** "익명"/"작성자"는 익명 계열이라 서로 구분되면 안 되므로 단색 하나로 고정한다 */
const anonymousAvatarTone = "bg-[#e8ebef] text-[#596373]";

function isAnonymousNickname(nickname: string): boolean {
  return nickname === "익명" || nickname === "작성자";
}

/**
 * QNA 카드 상단 작성자 블록 전용 원형 아바타 — 닉네임 이니셜을 그대로 쓴다.
 * "익명"/"작성자"(익명 계열)는 서로 식별되면 안 되므로 항상 같은 단색이고,
 * 실명(기업·헤드헌터·비익명 사용자)만 id 해시 기반 회색 톤 로테이션을 받는다.
 */
export function QnaAuthorAvatar({ id, nickname, size = 38 }: { id: string; nickname: string; size?: number }) {
  const tone = isAnonymousNickname(nickname) ? anonymousAvatarTone : authorAvatarTones[hashToIndex(id, authorAvatarTones.length)];
  return (
    <span
      className={clsx("grid shrink-0 place-items-center rounded-full text-[14px] font-bold", tone)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {nickname.slice(0, 1)}
    </span>
  );
}

export function QnaAuthorLabelBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[20px] items-center border border-[#cfd8e3] bg-[#f7f8fa] px-1.5 text-[11px] font-medium text-[#596373]">
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
}

export function PopularTagsPanel({ activeType, selectedTag, onTagClick, tagHref }: PopularTagsPanelProps) {
  const tags = getPopularQnaTags(activeType);

  return (
    <section className="border border-[#e5e9ef] bg-white p-5">
      <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-[#17202c]">
        <span className="inline-block h-3.5 w-[3px] bg-[#111111]" aria-hidden="true" />
        인기 태그
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selectedTag === tag;
          const className = clsx(
            "inline-flex h-6 items-center whitespace-nowrap bg-[#f4f6f8] px-2 text-[12px] font-medium transition-colors",
            active ? "font-bold text-[#111111]" : "text-[#596373] hover:text-[#111111]",
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
    <section className="border border-[#dfe4ea] bg-[#050505] p-5 text-white">
      <h2 className="text-[15px] font-bold tracking-[-0.01em] text-white">{qnaOperationPrinciple.title}</h2>
      <p className="mt-2.5 text-[13px] font-normal leading-[1.8] text-[#b9c0ca]">{qnaOperationPrinciple.description}</p>
    </section>
  );
}
